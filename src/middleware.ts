import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

type UserProfile = {
  perfil_principal: string | null;
  is_admin: boolean | null;
};

const protectedMatchers = ["/admin", "/dashboard/lojista", "/dashboard/comprador", "/dashboard/entregador", "/dashboard/verificacao"];
const primaryHosts = new Set(["caruano.com", "www.caruano.com"]);

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
  const shouldNoindex =
    process.env.NEXT_PUBLIC_SITE_NOINDEX === "true" || !primaryHosts.has(request.nextUrl.hostname.toLowerCase());

  if (!isProtectedPath(pathname)) {
    const response = NextResponse.next();

    if (shouldNoindex) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }

    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const response = redirectToLogin(request);
    if (shouldNoindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const token = getTokenFromAppCookie(request) || getTokenFromSupabaseCookie(request);

  if (!token) {
    const response = redirectToLogin(request);
    if (shouldNoindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
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
    const response = redirectToLogin(request);
    if (shouldNoindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("perfil_principal,is_admin")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    const response = redirectToLogin(request);
    if (shouldNoindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const userProfile = profile as UserProfile;

  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && userProfile.is_admin !== true) {
    const response = redirectToLogin(request);
    if (shouldNoindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (
    (pathname === "/dashboard/lojista" || pathname.startsWith("/dashboard/lojista/")) &&
    userProfile.perfil_principal !== "lojista"
  ) {
    const response = redirectToLogin(request);
    if (shouldNoindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (
    (pathname === "/dashboard/comprador" || pathname.startsWith("/dashboard/comprador/")) &&
    userProfile.perfil_principal !== "cliente"
  ) {
    const response = redirectToLogin(request);
    if (shouldNoindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (
    (pathname === "/dashboard/entregador" || pathname.startsWith("/dashboard/entregador/")) &&
    userProfile.perfil_principal !== "entregador"
  ) {
    const response = redirectToLogin(request);
    if (shouldNoindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const response = NextResponse.next();

  if (shouldNoindex) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
};
