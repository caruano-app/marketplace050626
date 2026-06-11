import type { SupabaseClient } from "@supabase/supabase-js";

export type WarehouseStockItem = {
  id: string;
  distribuidora_id: string | null;
  distributorName: string;
  distributorSlug: string | null;
  codigo_ean: string;
  nome_produto: string | null;
  preco_venda_b2b: number | null;
  estoque_disponivel: number;
  ultima_atualizacao_pdf: string | null;
};

export type WarehouseDistributor = {
  id: string;
  name: string;
};

export type AdminWarehouseData = {
  items: WarehouseStockItem[];
  distributors: WarehouseDistributor[];
  totalSku: number;
  totalUnits: number;
  totalValue: number;
};

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

export async function getAdminWarehouseData(client: SupabaseClient, distributorId?: string | null): Promise<AdminWarehouseData> {
  let query = client
    .from("estoque_distribuidoras")
    .select("id,distribuidora_id,codigo_ean,nome_produto,preco_venda_b2b,estoque_disponivel,ultima_atualizacao_pdf,lojistas(nome_fantasia,slug)")
    .order("ultima_atualizacao_pdf", { ascending: false })
    .limit(500);

  if (distributorId) {
    query = query.eq("distribuidora_id", distributorId);
  }

  const { data } = await query;
  const items = (data || []).map((item) => {
    const store = normalizeRelation(item.lojistas);

    return {
      id: String(item.id),
      distribuidora_id: item.distribuidora_id || null,
      distributorName: store?.nome_fantasia || "Distribuidora nao vinculada",
      distributorSlug: store?.slug || null,
      codigo_ean: item.codigo_ean,
      nome_produto: item.nome_produto || null,
      preco_venda_b2b: item.preco_venda_b2b === null ? null : Number(item.preco_venda_b2b || 0),
      estoque_disponivel: Number(item.estoque_disponivel || 0),
      ultima_atualizacao_pdf: item.ultima_atualizacao_pdf || null,
    };
  }) as WarehouseStockItem[];

  const distributorsMap = new Map<string, WarehouseDistributor>();

  for (const item of items) {
    if (item.distribuidora_id) {
      distributorsMap.set(item.distribuidora_id, {
        id: item.distribuidora_id,
        name: item.distributorName,
      });
    }
  }

  return {
    items,
    distributors: Array.from(distributorsMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    totalSku: items.length,
    totalUnits: items.reduce((sum, item) => sum + item.estoque_disponivel, 0),
    totalValue: items.reduce((sum, item) => sum + item.estoque_disponivel * Number(item.preco_venda_b2b || 0), 0),
  };
}
