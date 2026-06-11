import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ManagementScope = {
  id: string;
  usuario_id: string;
  cidade_atuacao: string | null;
  segmento_atuacao: string | null;
  nivel_permissao: number;
  ativo: boolean | null;
  criado_em: string | null;
  usuarios?: {
    nome_completo: string | null;
    email: string | null;
    telefone: string | null;
    perfil_principal: string | null;
  } | null;
};

export type ManagementUserOption = {
  id: string;
  nome_completo: string | null;
  email: string | null;
  telefone: string | null;
  perfil_principal: string | null;
};

export type IntelligenceProfile = {
  id?: string;
  usuario_id: string;
  profissao: string | null;
  bairro: string | null;
  gasto_mensal_energia: number | null;
  possui_veiculo_proprio: boolean | null;
  tipo_veiculo_preferencial: string | null;
  faturamento_medio_mensal: number | null;
  interesses_tags: string[] | null;
  score_confianca: number | null;
  ultima_atualizacao: string | null;
};

export type ManagerDemand = {
  id: string;
  cliente_id: string;
  tipo_demanda: string | null;
  segmento: string | null;
  cidade: string | null;
  titulo_demanda: string;
  descricao_detalhada: string | null;
  detalhes_tecnicos: Record<string, unknown> | null;
  status: string | null;
  urgente: boolean | null;
  criado_em: string | null;
  usuarios?: {
    nome_completo: string | null;
    email: string | null;
    telefone: string | null;
  } | null;
};

export type ManagerLead = {
  id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  origem: string | null;
  mensagem: string | null;
  status: string | null;
  metadata: Record<string, unknown> | null;
  criado_em: string | null;
  lojistas?: {
    nome_fantasia: string | null;
    slug: string | null;
  } | null;
};

export const cityOptions = [
  { value: "todas", label: "Todas" },
  { value: "caruaru", label: "Caruaru" },
  { value: "toritama", label: "Toritama" },
  { value: "santa_cruz_do_capibaribe", label: "Santa Cruz do Capibaribe" },
];

export const segmentOptions = [
  { value: "todos", label: "Todos" },
  { value: "moda", label: "Moda" },
  { value: "alimentacao", label: "Alimentacao" },
  { value: "insumos", label: "Insumos" },
  { value: "servicos", label: "Servicos" },
  { value: "energia", label: "Energia" },
];

export const permissionLevels = [
  { value: 1, label: "Operador" },
  { value: 2, label: "Gerente de Setor" },
  { value: 3, label: "Diretor Regional" },
  { value: 4, label: "Master Admin" },
];

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") return null;
  return value.trim().toLowerCase() || null;
}

function scopeMatches(scope: ManagementScope, cidade: unknown, segmento: unknown) {
  const cityValue = normalizeText(cidade);
  const segmentValue = normalizeText(segmento);
  const cityMatches = !scope.cidade_atuacao || scope.cidade_atuacao === cityValue;
  const segmentMatches = !scope.segmento_atuacao || scope.segmento_atuacao === segmentValue;

  return cityMatches && segmentMatches;
}

function leadMatchesScope(lead: ManagerLead, scopes: ManagementScope[]) {
  const metadata = lead.metadata || {};
  const cidade = metadata.cidade || metadata.cidade_atuacao || metadata.cidade_base;
  const segmento = metadata.segmento || metadata.segmento_atuacao || metadata.tipo_segmento;

  if (!cidade && !segmento) {
    return scopes.some((scope) => !scope.cidade_atuacao && !scope.segmento_atuacao);
  }

  return scopes.some((scope) => scopeMatches(scope, cidade, segmento));
}

export function getCityLabel(value: string | null) {
  return cityOptions.find((item) => item.value === (value || "todas"))?.label || value || "Todas";
}

export function getSegmentLabel(value: string | null) {
  return segmentOptions.find((item) => item.value === (value || "todos"))?.label || value || "Todos";
}

export function getPermissionLabel(value: number) {
  return permissionLevels.find((item) => item.value === value)?.label || `Nivel ${value}`;
}

export async function getManagementTeamData(client?: SupabaseClient) {
  const supabase = client || createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("escopos_gerencia")
    .select("id,usuario_id,cidade_atuacao,segmento_atuacao,nivel_permissao,ativo,criado_em,usuarios(nome_completo,email,telefone,perfil_principal)")
    .eq("ativo", true)
    .order("criado_em", { ascending: false });

  return (data || []).map((scope) => ({
    ...scope,
    usuarios: normalizeRelation(scope.usuarios),
  })) as ManagementScope[];
}

export async function searchManagementUsers(client: SupabaseClient, term: string) {
  const cleanTerm = term.trim().replace(/[%,]/g, "");

  if (cleanTerm.length < 2) {
    return [];
  }

  const { data, error } = await client
    .from("usuarios")
    .select("id,nome_completo,email,telefone,perfil_principal")
    .or(`nome_completo.ilike.%${cleanTerm}%,email.ilike.%${cleanTerm}%,telefone.ilike.%${cleanTerm}%`)
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ManagementUserOption[];
}

export async function getIntelligenceProfile(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("inteligencia_usuario")
    .select("id,usuario_id,profissao,bairro,gasto_mensal_energia,possui_veiculo_proprio,tipo_veiculo_preferencial,faturamento_medio_mensal,interesses_tags,score_confianca,ultima_atualizacao")
    .eq("usuario_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as IntelligenceProfile | null;
}

export async function getManagerDashboardData(client: SupabaseClient, userId: string) {
  const { data: scopesData, error: scopesError } = await client
    .from("escopos_gerencia")
    .select("id,usuario_id,cidade_atuacao,segmento_atuacao,nivel_permissao,ativo,criado_em")
    .eq("usuario_id", userId)
    .eq("ativo", true);

  if (scopesError) {
    throw new Error(scopesError.message);
  }

  const scopes = (scopesData || []) as ManagementScope[];

  if (!scopes.length) {
    return { scopes, demands: [], leads: [] };
  }

  const [demandsResult, leadsResult] = await Promise.all([
    client
      .from("central_demandas")
      .select("id,cliente_id,tipo_demanda,segmento,cidade,titulo_demanda,descricao_detalhada,detalhes_tecnicos,status,urgente,criado_em,usuarios(nome_completo,email,telefone)")
      .order("criado_em", { ascending: false })
      .limit(100),
    client
      .from("leads_atendimento")
      .select("id,nome,whatsapp,email,origem,mensagem,status,metadata,criado_em,lojistas(nome_fantasia,slug)")
      .order("criado_em", { ascending: false })
      .limit(100),
  ]);

  if (demandsResult.error) {
    throw new Error(demandsResult.error.message);
  }

  if (leadsResult.error) {
    throw new Error(leadsResult.error.message);
  }

  const demands = ((demandsResult.data || []).map((demand) => ({
    ...demand,
    usuarios: normalizeRelation(demand.usuarios),
  })) as ManagerDemand[]).filter((demand) => scopes.some((scope) => scopeMatches(scope, demand.cidade, demand.segmento)));

  const leads = ((leadsResult.data || []).map((lead) => ({
    ...lead,
    lojistas: normalizeRelation(lead.lojistas),
  })) as ManagerLead[]).filter((lead) => leadMatchesScope(lead, scopes));

  return { scopes, demands, leads };
}
