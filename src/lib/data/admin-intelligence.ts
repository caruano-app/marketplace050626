import type { SupabaseClient } from "@supabase/supabase-js";

export type PdvSaleRecord = {
  id: string;
  lojista_id: string | null;
  produto_id: string | null;
  quantidade: number;
  valor_total: number | null;
  criado_em: string | null;
  storeName: string;
  productName: string;
  sku: string | null;
  ean: string | null;
  city: string;
};

export type SupplyOrderRecord = {
  id: string;
  buyerStoreId: string | null;
  supplierStoreId: string | null;
  buyerName: string;
  supplierName: string;
  productName: string;
  quantity: number | null;
  valor_total: number | null;
  status: string | null;
  criado_em: string | null;
};

export type ProductRankingItem = {
  productId: string;
  productName: string;
  sku: string | null;
  ean: string | null;
  quantity: number;
  total: number;
};

export type CityHeatmapItem = {
  city: string;
  label: string;
  total: number;
  quantity: number;
};

export type SalesSeriesItem = {
  label: string;
  total: number;
};

export type ReplenishmentFunnel = {
  pendingAlerts: number;
  convertedAlerts: number;
  supplyOrders: number;
};

export type AdminIntelligenceData = {
  totalPdvSales: number;
  totalPdvRevenue: number;
  funnel: ReplenishmentFunnel;
  cityHeatmap: CityHeatmapItem[];
  salesSeries: SalesSeriesItem[];
  sales: PdvSaleRecord[];
  orders: SupplyOrderRecord[];
  ranking: ProductRankingItem[];
};

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

async function getStoreNames(client: SupabaseClient, ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

  if (!uniqueIds.length) {
    return new Map<string, string>();
  }

  const { data } = await client.from("lojistas").select("id,nome_fantasia").in("id", uniqueIds);
  return new Map((data || []).map((store) => [String(store.id), store.nome_fantasia || "Loja Caruano"]));
}

async function getSupplyOrders(client: SupabaseClient): Promise<SupplyOrderRecord[]> {
  const modern = await client
    .from("ordens_abastecimento")
    .select("id,mercadinho_id,distribuidora_id,valor_total,status,criado_em")
    .order("criado_em", { ascending: false })
    .limit(50);

  if (!modern.error) {
    const rows = modern.data || [];
    const storeNames = await getStoreNames(
      client,
      rows.flatMap((row) => [row.mercadinho_id, row.distribuidora_id].filter(Boolean) as string[]),
    );

    return rows.map((row) => ({
      id: String(row.id),
      buyerStoreId: row.mercadinho_id || null,
      supplierStoreId: row.distribuidora_id || null,
      buyerName: row.mercadinho_id ? storeNames.get(row.mercadinho_id) || "Mercadinho Caruano" : "Mercadinho Caruano",
      supplierName: row.distribuidora_id ? storeNames.get(row.distribuidora_id) || "Distribuidora Caruano" : "Distribuidora Caruano",
      productName: "Produto nao registrado na ordem",
      quantity: null,
      valor_total: row.valor_total === null ? null : Number(row.valor_total),
      status: row.status || null,
      criado_em: row.criado_em || null,
    }));
  }

  const legacy = await client
    .from("ordens_abastecimento")
    .select("id,comprador_id,fornecedor_id,valor_total,status,criado_em")
    .order("criado_em", { ascending: false })
    .limit(50);

  if (legacy.error) {
    return [];
  }

  const rows = legacy.data || [];
  const storeNames = await getStoreNames(
    client,
    rows.flatMap((row) => [row.comprador_id, row.fornecedor_id].filter(Boolean) as string[]),
  );

  return rows.map((row) => ({
    id: String(row.id),
    buyerStoreId: row.comprador_id || null,
    supplierStoreId: row.fornecedor_id || null,
    buyerName: row.comprador_id ? storeNames.get(row.comprador_id) || "Comprador Caruano" : "Comprador Caruano",
    supplierName: row.fornecedor_id ? storeNames.get(row.fornecedor_id) || "Fornecedor Caruano" : "Fornecedor Caruano",
    productName: "Produto nao registrado na ordem",
    quantity: null,
    valor_total: row.valor_total === null ? null : Number(row.valor_total),
    status: row.status || null,
    criado_em: row.criado_em || null,
  }));
}

function cityLabel(value: string | null | undefined) {
  const normalized = (value || "nao_informada").toLowerCase();
  if (normalized === "caruaru") return "Caruaru";
  if (normalized === "toritama") return "Toritama";
  if (normalized === "santa_cruz_do_capibaribe") return "Santa Cruz";
  return "Nao informada";
}

function buildSalesSeries(sales: PdvSaleRecord[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return days.map((date) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const total = sales
      .filter((sale) => {
        if (!sale.criado_em) return false;
        const created = new Date(sale.criado_em);
        return created >= date && created < nextDate;
      })
      .reduce((sum, sale) => sum + Number(sale.valor_total || 0), 0);

    return {
      label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date),
      total,
    };
  });
}

export async function getAdminIntelligenceData(client: SupabaseClient): Promise<AdminIntelligenceData> {
  const salesResult = await client
    .from("vendas_pdv_local")
    .select("id,lojista_id,produto_id,quantidade,valor_total,criado_em,lojistas(nome_fantasia,usuarios(cidade_base)),produtos(nome_produto,codigo_referencia_sku)")
    .order("criado_em", { ascending: false })
    .limit(200);

  const productIds = Array.from(new Set((salesResult.data || []).map((sale) => sale.produto_id).filter(Boolean))) as string[];
  const { data: variations } = productIds.length
    ? await client.from("variacoes_produto").select("produto_id,codigo_barras_ean").in("produto_id", productIds)
    : { data: [] };
  const eanByProduct = new Map<string, string>();

  for (const variation of variations || []) {
    if (!eanByProduct.has(variation.produto_id)) {
      eanByProduct.set(variation.produto_id, variation.codigo_barras_ean || "");
    }
  }

  const sales = (salesResult.data || []).map((sale) => {
    const store = normalizeRelation(sale.lojistas);
    const storeUser = normalizeRelation(store?.usuarios);
    const product = normalizeRelation(sale.produtos);

    return {
      id: String(sale.id),
      lojista_id: sale.lojista_id || null,
      produto_id: sale.produto_id || null,
      quantidade: Number(sale.quantidade || 0),
      valor_total: sale.valor_total === null ? null : Number(sale.valor_total || 0),
      criado_em: sale.criado_em || null,
      storeName: store?.nome_fantasia || "Loja Caruano",
      productName: product?.nome_produto || "Produto Caruano",
      sku: product?.codigo_referencia_sku || null,
      ean: sale.produto_id ? eanByProduct.get(sale.produto_id) || null : null,
      city: cityLabel(storeUser?.cidade_base),
    };
  }) as PdvSaleRecord[];

  const rankingMap = new Map<string, ProductRankingItem>();

  for (const sale of sales) {
    const key = sale.produto_id || sale.productName;
    const current = rankingMap.get(key) || {
      productId: key,
      productName: sale.productName,
      sku: sale.sku,
      ean: sale.ean,
      quantity: 0,
      total: 0,
    };

    current.quantity += sale.quantidade;
    current.total += Number(sale.valor_total || 0);
    rankingMap.set(key, current);
  }

  const orders = await getSupplyOrders(client);
  const [{ count: pendingAlerts }, { count: convertedAlerts }] = await Promise.all([
    client.from("alertas_reabastecimento").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    client.from("alertas_reabastecimento").select("id", { count: "exact", head: true }).in("status", ["pedido_feito", "concluido"]),
  ]);
  const heatmapMap = new Map<string, CityHeatmapItem>();

  for (const sale of sales) {
    const current = heatmapMap.get(sale.city) || {
      city: sale.city,
      label: sale.city,
      total: 0,
      quantity: 0,
    };

    current.total += Number(sale.valor_total || 0);
    current.quantity += sale.quantidade;
    heatmapMap.set(sale.city, current);
  }

  return {
    totalPdvSales: sales.length,
    totalPdvRevenue: sales.reduce((sum, sale) => sum + Number(sale.valor_total || 0), 0),
    funnel: {
      pendingAlerts: pendingAlerts || 0,
      convertedAlerts: convertedAlerts || 0,
      supplyOrders: orders.length,
    },
    cityHeatmap: Array.from(heatmapMap.values()).sort((a, b) => b.total - a.total),
    salesSeries: buildSalesSeries(sales),
    sales: sales.slice(0, 30),
    orders,
    ranking: Array.from(rankingMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 10),
  };
}
