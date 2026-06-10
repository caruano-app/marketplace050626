import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export function getSessionToken(request: NextRequest) {
  const appCookie = request.cookies.get("caruano_session_access_token")?.value;

  if (appCookie) {
    return appCookie;
  }

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

export function createSupabaseRequestClient(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
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
}

export async function getAuthenticatedMerchant(request: NextRequest) {
  const token = getSessionToken(request);

  if (!token) {
    return { error: "Login necessario.", status: 401 as const };
  }

  const supabase = createSupabaseRequestClient(token);

  if (!supabase) {
    return { error: "Supabase nao configurado.", status: 500 as const };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return { error: "Sessao invalida.", status: 401 as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("id,perfil_principal,is_admin")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.perfil_principal !== "lojista") {
    return { error: "Acesso restrito a lojistas.", status: 403 as const };
  }

  const { data: store, error: storeError } = await supabase
    .from("lojistas")
    .select("id,nome_fantasia,slug")
    .eq("usuario_id", authData.user.id)
    .maybeSingle();

  if (storeError || !store) {
    return { error: "Lojista nao encontrado para este usuario.", status: 404 as const };
  }

  return {
    supabase,
    user: authData.user,
    profile,
    store,
  };
}
