import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AtendimentoLead } from "@/lib/data/leads";

export type AdminStore = {
  id: string;
  nome_fantasia: string;
  slug: string;
  status_operacao: string | null;
  criado_em: string | null;
};

export type AdminProduct = {
  id: string;
  nome_produto: string;
  codigo_referencia_sku: string;
  status_moderacao: string | null;
  criado_em?: string | null;
};

export type AuditLog = {
  id: number;
  rota_acessada: string;
  acao_executada: string;
  tentativa_rejeitada: boolean | null;
  criado_em: string | null;
};

export type CategorySuggestion = {
  id: string;
  lojista_id: string | null;
  nome_sugerido: string;
  nicho_sugerido: string | null;
  status: string | null;
  criado_em: string | null;
  lojistas?: {
    nome_fantasia: string;
    slug: string;
  } | null;
};

export type AdminMetrics = {
  totalLeads: number;
  todayLeads: number;
  activeStores: number;
  productsCount: number;
  volume: number;
};

const emptyMetrics: AdminMetrics = {
  totalLeads: 0,
  todayLeads: 0,
  activeStores: 0,
  productsCount: 0,
  volume: 0,
};

export async function getAdminDashboardData() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { stores: [], products: [], logs: [], leads: [], categorySuggestions: [], metrics: emptyMetrics, volume: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    storesResult,
    productsResult,
    logsResult,
    volumeResult,
    leadsResult,
    suggestionsResult,
    totalLeadsResult,
    todayLeadsResult,
    activeStoresResult,
    productsCountResult,
  ] = await Promise.all([
    supabase
      .from("lojistas")
      .select("id,nome_fantasia,slug,status_operacao,criado_em")
      .eq("status_operacao", "analise_documental")
      .order("criado_em", { ascending: false })
      .limit(10),
    supabase
      .from("produtos")
      .select("id,nome_produto,codigo_referencia_sku,status_moderacao,criado_em")
      .eq("status_moderacao", "pendente_aprovacao")
      .limit(10),
    supabase
      .from("logs_seguranca_auditoria")
      .select("id,rota_acessada,acao_executada,tentativa_rejeitada,criado_em")
      .order("criado_em", { ascending: false })
      .limit(8),
    supabase
      .from("transacoes_mestre")
      .select("valor_total_checkout")
      .limit(100),
    supabase
      .from("leads_atendimento")
      .select("id,nome,whatsapp,email,origem,mensagem,status,lojista_id,metadata,criado_em,lojistas(nome_fantasia,slug)")
      .order("criado_em", { ascending: false })
      .limit(30),
    supabase
      .from("sugestoes_categorias")
      .select("id,lojista_id,nome_sugerido,nicho_sugerido,status,criado_em,lojistas(nome_fantasia,slug)")
      .eq("status", "pendente")
      .order("criado_em", { ascending: false })
      .limit(20),
    supabase.from("leads_atendimento").select("id", { count: "exact", head: true }),
    supabase.from("leads_atendimento").select("id", { count: "exact", head: true }).gte("criado_em", today.toISOString()),
    supabase.from("lojistas").select("id", { count: "exact", head: true }).eq("status_operacao", "ativo"),
    supabase.from("produtos").select("id", { count: "exact", head: true }),
  ]);

  const volume = (volumeResult.data || []).reduce((sum, item) => sum + Number(item.valor_total_checkout || 0), 0);
  const leads = (leadsResult.data || []).map((lead) => ({
    ...lead,
    lojistas: Array.isArray(lead.lojistas) ? lead.lojistas[0] || null : lead.lojistas,
  })) as AtendimentoLead[];
  const categorySuggestions = (suggestionsResult.data || []).map((suggestion) => ({
    ...suggestion,
    lojistas: Array.isArray(suggestion.lojistas) ? suggestion.lojistas[0] || null : suggestion.lojistas,
  })) as CategorySuggestion[];
  const metrics = {
    totalLeads: totalLeadsResult.count || leads.length,
    todayLeads: todayLeadsResult.count || 0,
    activeStores: activeStoresResult.count || 0,
    productsCount: productsCountResult.count || 0,
    volume,
  };

  return {
    stores: (storesResult.data || []) as AdminStore[],
    products: (productsResult.data || []) as AdminProduct[],
    logs: (logsResult.data || []) as AuditLog[],
    leads,
    categorySuggestions,
    metrics,
    volume,
  };
}
