import { createClient } from "@supabase/supabase-js";

export type SessionProfile = {
  id: string;
  perfil_principal: string | null;
  is_admin: boolean | null;
  status_verificacao_identidade?: string | null;
};

type AuthUserLike = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export function createSupabaseProfileClient(token?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || (!supabaseAnonKey && !serviceRoleKey)) {
    return null;
  }

  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (!token || !supabaseAnonKey) {
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

export function profileFromUserMetadata(user: AuthUserLike): SessionProfile {
  const metadata = user.user_metadata || {};
  const metadataProfile = metadata.perfil_principal;
  const metadataStatus = metadata.status_verificacao_identidade;

  return {
    id: user.id,
    perfil_principal: typeof metadataProfile === "string" ? metadataProfile : null,
    is_admin: metadata.is_admin === true || metadata.is_admin === "true",
    status_verificacao_identidade: typeof metadataStatus === "string" ? metadataStatus : null,
  };
}

export async function getProfileForUser(user: AuthUserLike, token?: string) {
  const profileClient = createSupabaseProfileClient(token);

  if (!profileClient) {
    return {
      profile: profileFromUserMetadata(user),
      error: "Cliente de perfil indisponivel.",
      usedFallback: true,
      usedServiceRole: false,
    };
  }

  const { data, error } = await profileClient
    .from("usuarios")
    .select("id,perfil_principal,is_admin,status_verificacao_identidade")
    .eq("id", user.id)
    .maybeSingle<SessionProfile>();

  if (error || !data) {
    return {
      profile: profileFromUserMetadata(user),
      error: error?.message || "Perfil nao encontrado em public.usuarios.",
      usedFallback: true,
      usedServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    };
  }

  return {
    profile: data,
    error: null,
    usedFallback: false,
    usedServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}
