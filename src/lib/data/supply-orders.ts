import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SupplyOrder = {
  id: string;
  comprador_id: string | null;
  fornecedor_id: string | null;
  status: string | null;
  valor_total: number | null;
  comissao_caruano: number | null;
  criado_em: string | null;
  comprador?: {
    nome_fantasia: string | null;
    slug: string | null;
  } | null;
  fornecedor?: {
    nome_fantasia: string | null;
    slug: string | null;
  } | null;
};

function normalizeOrder(order: SupplyOrder): SupplyOrder {
  return {
    ...order,
    comprador: Array.isArray(order.comprador) ? order.comprador[0] || null : order.comprador,
    fornecedor: Array.isArray(order.fornecedor) ? order.fornecedor[0] || null : order.fornecedor,
  };
}

export async function getSupplyOrders(limit = 20): Promise<SupplyOrder[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("ordens_abastecimento")
    .select("id,comprador_id,fornecedor_id,status,valor_total,comissao_caruano,criado_em,comprador:lojistas!ordens_abastecimento_comprador_id_fkey(nome_fantasia,slug),fornecedor:lojistas!ordens_abastecimento_fornecedor_id_fkey(nome_fantasia,slug)")
    .order("criado_em", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as SupplyOrder[]).map(normalizeOrder);
}
