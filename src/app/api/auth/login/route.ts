import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isCaruanoAdmin } from "@/lib/auth/admin";
import { getProfileForUser } from "@/lib/auth/profile";

type AuthRequest = {
  mode: "login" | "cadastro";
  email: string;
  password: string;
  name?: string;
  profile?: "comprador" | "lojista";
  captchaToken?: string;
};

type UserProfileRoute = {
  id: string;
  perfil_principal: string | null;
  is_admin: boolean | null;
  status_verificacao_identidade: string | null;
};

type AttemptState = {
  count: number;
  resetAt: number;
  blockedUntil?: number;
};

const attempts = new Map<string, AttemptState>();
const windowMs = 10 * 60 * 1000;
const blockMs = 15 * 60 * 1000;
const maxAttempts = 5;

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getRateKey(request: NextRequest, email: string) {
  return `${getClientIp(request)}:${email.toLowerCase()}`;
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.blockedUntil && current.blockedUntil > now) {
    return Math.ceil((current.blockedUntil - now) / 1000);
  }

  current.count += 1;

  if (current.count > maxAttempts) {
    current.blockedUntil = now + blockMs;
    return Math.ceil(blockMs / 1000);
  }

  attempts.set(key, current);
  return null;
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

function saveSessionCookie(response: NextResponse, accessToken: string) {
  response.cookies.set("caruano_session_access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

function getProfileRedirect(profile: UserProfileRoute | null, fallbackProfile?: string) {
  const role = profile?.perfil_principal || fallbackProfile || "comprador";

  if (isCaruanoAdmin(profile)) {
    return "/admin";
  }

  if (role === "lojista") {
    return profile?.status_verificacao_identidade === "aprovado" ? "/dashboard/lojista" : "/dashboard/verificacao";
  }

  if (role === "entregador") {
    return profile?.status_verificacao_identidade === "aprovado"
      ? "/dashboard/entregador"
      : "/dashboard/entregador/verificacao";
  }

  if (role === "cliente" || role === "comprador") {
    return "/dashboard/comprador";
  }

  return "/dashboard/perfil-premiado";
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AuthRequest;
  const email = body.email?.trim();
  const password = body.password;
  const captchaToken = body.captchaToken?.trim();

  if (!email || !password || !["login", "cadastro"].includes(body.mode)) {
    return NextResponse.json({ error: "Dados de acesso invalidos." }, { status: 400 });
  }

  if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken) {
    return NextResponse.json({ error: "Confirme o desafio de seguranca antes de continuar." }, { status: 400 });
  }

  const rateKey = getRateKey(request, email);
  const retryAfter = checkRateLimit(rateKey);

  if (retryAfter) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
        },
      },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase nao configurado." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const result =
    body.mode === "login"
      ? await supabase.auth.signInWithPassword({
          email,
          password,
          options: captchaToken ? { captchaToken } : undefined,
        })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken,
            data: {
              nome_completo: body.name || "",
              perfil_principal: body.profile || "comprador",
            },
          },
        });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 401 });
  }

  clearAttempts(rateKey);

  let redirectTo = getProfileRedirect(null, body.profile);

  if (result.data.session?.access_token && result.data.user?.id) {
    const { profile } = await getProfileForUser(result.data.user, result.data.session.access_token);
    redirectTo = getProfileRedirect(profile as UserProfileRoute, body.profile);
  }

  const response = NextResponse.json({
    ok: true,
    redirectTo,
    needsEmailConfirmation: !result.data.session,
  });

  if (result.data.session?.access_token) {
    saveSessionCookie(response, result.data.session.access_token);
  }

  return response;
}
