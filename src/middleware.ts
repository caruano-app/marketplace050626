import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

type UserProfile = {
  perfil_principal: string | null;
  is_admin: boolean | null;
};

const protectedMatchers = ["/admin", "/dashboard/lojista"];

function isProtectedPath(pathname: string) {
  return protectedMatchers.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function getTokenFromAppCookie(request: NextRequest) {
  return request.cookies.get("caruano_session_access_token")?.value || null;
}

function getTokenFromSupabaseCookie(request: NextRequest) {
  const authCookie = request.cookies.getAll().find((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));

  if (!authCookie?.value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(authCookie.value));
    return parsed?.access_token || parsed?.[0] || null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return redirectToLogin(request);
  }

  const token = getTokenFromAppCookie(request) || getTokenFromSupabaseCookie(request);

  if (!token) {
    return redirectToLogin(request);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return redirectToLogin(request);
  }

  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("perfil_principal,is_admin")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return redirectToLogin(request);
  }

  const userProfile = profile as UserProfile;

  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && userProfile.is_admin !== true) {
    return redirectToLogin(request);
  }

  if (
    (pathname === "/dashboard/lojista" || pathname.startsWith("/dashboard/lojista/")) &&
    userProfile.perfil_principal !== "lojista"
  ) {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/lojista/:path*"],
};
