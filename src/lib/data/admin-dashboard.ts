import { createSupabaseServerClient } from "@/lib/supabase/server";

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
};

export type AuditLog = {
  id: number;
  rota_acessada: string;
  acao_executada: string;
  tentativa_rejeitada: boolean | null;
  criado_em: string | null;
};

export async function getAdminDashboardData() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { stores: [], products: [], logs: [], volume: 0 };
  }

  const [storesResult, productsResult, logsResult, volumeResult] = await Promise.all([
    supabase
      .from("lojistas")
      .select("id,nome_fantasia,slug,status_operacao,criado_em")
      .eq("status_operacao", "analise_documental")
      .order("criado_em", { ascending: false })
      .limit(10),
    supabase
      .from("produtos")
      .select("id,nome_produto,codigo_referencia_sku,status_moderacao")
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
  ]);

  const volume = (volumeResult.data || []).reduce((sum, item) => sum + Number(item.valor_total_checkout || 0), 0);

  return {
    stores: (storesResult.data || []) as AdminStore[],
    products: (productsResult.data || []) as AdminProduct[],
    logs: (logsResult.data || []) as AuditLog[],
    volume,
  };
}
