import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ManagedStockItem = {
  id: string;
  produto_id: string | null;
  quantidade_minima_alerta: number | null;
  quantidade_atual: number | null;
  localizacao_fisica: string | null;
  ultima_contagem: string | null;
  produtos?: {
    nome_produto: string | null;
    codigo_referencia_sku: string | null;
    lojista_id: string | null;
    lojistas?: {
      nome_fantasia: string | null;
      slug: string | null;
    } | null;
  } | null;
};

export function isStockBelowMinimum(item: ManagedStockItem) {
  return Number(item.quantidade_atual || 0) <= Number(item.quantidade_minima_alerta || 0);
}

function normalizeStock(item: ManagedStockItem): ManagedStockItem {
  const product = Array.isArray(item.produtos) ? item.produtos[0] || null : item.produtos;

  return {
    ...item,
    produtos: product
      ? {
          ...product,
          lojistas: Array.isArray(product.lojistas) ? product.lojistas[0] || null : product.lojistas,
        }
      : null,
  };
}

export async function getManagedStock(limit = 30): Promise<ManagedStockItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("estoque_gerenciado")
    .select("id,produto_id,quantidade_minima_alerta,quantidade_atual,localizacao_fisica,ultima_contagem,produtos(nome_produto,codigo_referencia_sku,lojista_id,lojistas(nome_fantasia,slug))")
    .order("ultima_contagem", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as ManagedStockItem[]).map(normalizeStock);
}

export async function getManagedStockByStore(lojistaId: string, limit = 20): Promise<ManagedStockItem[]> {
  const items = await getManagedStock(limit * 2);
  return items.filter((item) => item.produtos?.lojista_id === lojistaId).slice(0, limit);
}
