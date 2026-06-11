import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ConsumptionProfile = {
  id: string;
  usuario_id: string | null;
  gasto_medio_energia: number | null;
  possui_veiculo: boolean | null;
  tipo_veiculo: string | null;
  interesses_insumos: string[] | null;
  atualizado_em: string | null;
  usuarios?: {
    nome_completo: string | null;
    telefone: string | null;
    perfil_principal: string | null;
  } | null;
};

function normalizeProfile(profile: ConsumptionProfile): ConsumptionProfile {
  return {
    ...profile,
    usuarios: Array.isArray(profile.usuarios) ? profile.usuarios[0] || null : profile.usuarios,
  };
}

export function opportunityLabel(profile: ConsumptionProfile) {
  if (Number(profile.gasto_medio_energia || 0) >= 800) return "Energia Solar";
  if (profile.possui_veiculo) return `Seguro ${profile.tipo_veiculo || "Veiculo"}`;
  if (profile.interesses_insumos?.length) return `Insumos: ${profile.interesses_insumos.slice(0, 2).join(", ")}`;
  return "Beneficio Caruano";
}

export async function getConsumptionOpportunities(limit = 20): Promise<ConsumptionProfile[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("perfil_consumo_usuario")
    .select("id,usuario_id,gasto_medio_energia,possui_veiculo,tipo_veiculo,interesses_insumos,atualizado_em,usuarios(nome_completo,telefone,perfil_principal)")
    .order("atualizado_em", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as ConsumptionProfile[]).map(normalizeProfile);
}

export async function getConsumptionProfileByUser(usuarioId: string): Promise<ConsumptionProfile | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("perfil_consumo_usuario")
    .select("id,usuario_id,gasto_medio_energia,possui_veiculo,tipo_veiculo,interesses_insumos,atualizado_em,usuarios(nome_completo,telefone,perfil_principal)")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (error || !data) return null;

  return normalizeProfile(data as unknown as ConsumptionProfile);
}
