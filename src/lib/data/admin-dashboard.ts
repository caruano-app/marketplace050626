import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminBenefits, type BenefitOffer } from "@/lib/data/benefits";
import { getConsumptionOpportunities, type ConsumptionProfile } from "@/lib/data/consumption-profile";
import { getManagedStock, type ManagedStockItem } from "@/lib/data/managed-stock";
import { getSupplyOrders, type SupplyOrder } from "@/lib/data/supply-orders";
import type { AtendimentoLead } from "@/lib/data/leads";

export type AdminStore = {
  id: string;
  usuario_id: string;
  nome_fantasia: string;
  slug: string;
  status_operacao: string | null;
  criado_em: string | null;
  usuarios?: {
    status_verificacao_identidade: string | null;
  } | null;
};

export type AdminDriver = {
  id: string;
  usuario_id: string;
  nome_entregador: string;
  telefone: string | null;
  status_verificacao_identidade: string | null;
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

export type AdminReview = {
  id: string;
  nota: number;
  comentario: string | null;
  status: string | null;
  criado_em: string | null;
  usuarios?: {
    nome_completo: string | null;
  } | null;
  produtos?: {
    nome_produto: string | null;
  } | null;
  lojistas?: {
    nome_fantasia: string | null;
  } | null;
};

export type AdminMetrics = {
  totalLeads: number;
  todayLeads: number;
  activeStores: number;
  productsCount: number;
  volume: number;
};

export type AdminEcosystemData = {
  benefits: BenefitOffer[];
  managedStock: ManagedStockItem[];
  supplyOrders: SupplyOrder[];
  opportunities: ConsumptionProfile[];
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
    return {
      stores: [],
      drivers: [],
      products: [],
      logs: [],
      leads: [],
      categorySuggestions: [],
      reviews: [],
      ecosystem: { benefits: [], managedStock: [], supplyOrders: [], opportunities: [] },
      metrics: emptyMetrics,
      volume: 0,
    };
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
    reviewsResult,
    driversResult,
    benefits,
    managedStock,
    supplyOrders,
    opportunities,
  ] = await Promise.all([
    supabase
      .from("lojistas")
      .select("id,usuario_id,nome_fantasia,slug,status_operacao,criado_em,usuarios(status_verificacao_identidade)")
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
    supabase
      .from("avaliacoes_comentarios")
      .select("id,nota,comentario,status,criado_em,usuarios(nome_completo),produtos(nome_produto),lojistas(nome_fantasia)")
      .eq("status", "pendente")
      .order("criado_em", { ascending: false })
      .limit(20),
    supabase
      .from("entregadores")
      .select("id,usuario_id,usuarios(nome_completo,telefone,status_verificacao_identidade)")
      .limit(30),
    getAdminBenefits(),
    getManagedStock(),
    getSupplyOrders(),
    getConsumptionOpportunities(),
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
  const stores = (storesResult.data || []).map((store) => ({
    ...store,
    usuarios: Array.isArray(store.usuarios) ? store.usuarios[0] || null : store.usuarios,
  })) as AdminStore[];
  const reviews = (reviewsResult.data || []).map((review) => ({
    ...review,
    usuarios: Array.isArray(review.usuarios) ? review.usuarios[0] || null : review.usuarios,
    produtos: Array.isArray(review.produtos) ? review.produtos[0] || null : review.produtos,
    lojistas: Array.isArray(review.lojistas) ? review.lojistas[0] || null : review.lojistas,
  })) as AdminReview[];
  const drivers = (driversResult.data || []).map((driver) => {
    const user = Array.isArray(driver.usuarios) ? driver.usuarios[0] || null : driver.usuarios;

    return {
      id: String(driver.id),
      usuario_id: String(driver.usuario_id),
      nome_entregador: user?.nome_completo || "Entregador Caruano",
      telefone: user?.telefone || null,
      status_verificacao_identidade: user?.status_verificacao_identidade || "nao_enviado",
    };
  }) as AdminDriver[];
  const metrics = {
    totalLeads: totalLeadsResult.count || leads.length,
    todayLeads: todayLeadsResult.count || 0,
    activeStores: activeStoresResult.count || 0,
    productsCount: productsCountResult.count || 0,
    volume,
  };

  return {
    stores,
    drivers,
    products: (productsResult.data || []) as AdminProduct[],
    logs: (logsResult.data || []) as AuditLog[],
    leads,
    categorySuggestions,
    reviews,
    ecosystem: {
      benefits,
      managedStock,
      supplyOrders,
      opportunities,
    },
    metrics,
    volume,
  };
}
