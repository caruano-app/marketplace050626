import type { SupabaseClient } from "@supabase/supabase-js";

export type DistributorStockInput = {
  distribuidora_id?: string | null;
  codigo_ean: string;
  nome_produto: string | null;
  preco_venda_b2b: number | null;
  estoque_disponivel: number;
};

export type DistributorStockItem = DistributorStockInput & {
  id: string;
  ultima_atualizacao_pdf: string | null;
  lojistas?: {
    nome_fantasia: string | null;
    slug: string | null;
  } | null;
};

export type ReplenishmentItem = {
  productId: string;
  productName: string;
  sku: string;
  ean: string;
  currentStock: number;
  bestOffer: DistributorStockItem | null;
  alertStatus: string | null;
  suggestedQuantity: number | null;
};

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

export async function importDistributorStock(client: SupabaseClient, items: DistributorStockInput[]) {
  const results: Array<{ ean: string; action: "updated" | "inserted" }> = [];

  for (const item of items) {
    const ean = item.codigo_ean.replace(/\D/g, "");
    if (!ean) continue;

    let query = client.from("estoque_distribuidoras").select("id").eq("codigo_ean", ean).limit(1);

    if (item.distribuidora_id) {
      query = query.eq("distribuidora_id", item.distribuidora_id);
    }

    const { data: existing, error: existingError } = await query.maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    const row = {
      distribuidora_id: item.distribuidora_id || null,
      codigo_ean: ean,
      nome_produto: item.nome_produto,
      preco_venda_b2b: item.preco_venda_b2b,
      estoque_disponivel: item.estoque_disponivel,
      ultima_atualizacao_pdf: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await client.from("estoque_distribuidoras").update(row).eq("id", existing.id);
      if (error) throw new Error(error.message);
      results.push({ ean, action: "updated" });
    } else {
      const { error } = await client.from("estoque_distribuidoras").insert(row);
      if (error) throw new Error(error.message);
      results.push({ ean, action: "inserted" });
    }
  }

  return results;
}

export async function getMerchantReplenishment(client: SupabaseClient, lojistaId: string): Promise<ReplenishmentItem[]> {
  const { data: products, error: productsError } = await client
    .from("produtos")
    .select("id,nome_produto,codigo_referencia_sku")
    .eq("lojista_id", lojistaId)
    .limit(100);

  if (productsError || !products?.length) {
    return [];
  }

  const productIds = products.map((product) => product.id);
  const { data: variations, error: variationsError } = await client
    .from("variacoes_produto")
    .select("id,produto_id,codigo_barras_ean,estoque_atual")
    .in("produto_id", productIds);

  if (variationsError || !variations?.length) {
    return [];
  }

  const eans = variations.map((variation) => String(variation.codigo_barras_ean || "")).filter(Boolean);

  if (!eans.length) {
    return [];
  }

  const [{ data: offers }, { data: alerts }] = await Promise.all([
    client
      .from("estoque_distribuidoras")
      .select("id,distribuidora_id,codigo_ean,nome_produto,preco_venda_b2b,estoque_disponivel,ultima_atualizacao_pdf,lojistas(nome_fantasia,slug)")
      .in("codigo_ean", eans)
      .gt("estoque_disponivel", 0)
      .order("preco_venda_b2b", { ascending: true }),
    client
      .from("alertas_reabastecimento")
      .select("produto_id,status,quantidade_sugerida")
      .eq("lojista_id", lojistaId)
      .in("produto_id", productIds),
  ]);

  const replenishmentItems: ReplenishmentItem[] = [];

  for (const variation of variations) {
      const product = products.find((item) => item.id === variation.produto_id);
      if (!product) continue;

      const ean = String(variation.codigo_barras_ean || "");
      const matchingOffers = (offers || [])
        .filter((offer) => String(offer.codigo_ean) === ean)
        .map((offer) => ({
          ...offer,
          lojistas: normalizeRelation(offer.lojistas),
        })) as DistributorStockItem[];
      const alert = (alerts || []).find((item) => item.produto_id === product.id) || null;

      replenishmentItems.push({
        productId: product.id,
        productName: product.nome_produto,
        sku: product.codigo_referencia_sku,
        ean,
        currentStock: Number(variation.estoque_atual || 0),
        bestOffer: matchingOffers[0] || null,
        alertStatus: alert?.status || null,
        suggestedQuantity: alert?.quantidade_sugerida || null,
      });
  }

  return replenishmentItems.sort((a, b) => a.currentStock - b.currentStock);
}
