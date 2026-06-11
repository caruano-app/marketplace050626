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
  cityLabel: string;
  segment: string;
  segmentLabel: string;
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
  topStoreName: string;
  topStoreQuantity: number;
  topStoreTotal: number;
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

export type SegmentDistributionItem = {
  segment: string;
  label: string;
  total: number;
  quantity: number;
  salesCount: number;
  percentage: number;
};

export type ReplenishmentFunnel = {
  pendingAlerts: number;
  convertedAlerts: number;
  supplyOrders: number;
};

export type AdminIntelligenceFilters = {
  period?: "hoje" | "7d" | "mes";
  city?: string;
  segment?: string;
};

export type AdminIntelligenceData = {
  totalPdvSales: number;
  totalPdvRevenue: number;
  averageTicket: number;
  totalItemsScanned: number;
  funnel: ReplenishmentFunnel;
  cityHeatmap: CityHeatmapItem[];
  segmentDistribution: SegmentDistributionItem[];
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

async function getSupplyOrders(client: SupabaseClient, startDate?: Date): Promise<SupplyOrderRecord[]> {
  let modernQuery = client
    .from("ordens_abastecimento")
    .select("id,mercadinho_id,distribuidora_id,valor_total,status,criado_em")
    .order("criado_em", { ascending: false });

  if (startDate) {
    modernQuery = modernQuery.gte("criado_em", startDate.toISOString());
  }

  const modern = await modernQuery.limit(50);

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

  let legacyQuery = client
    .from("ordens_abastecimento")
    .select("id,comprador_id,fornecedor_id,valor_total,status,criado_em")
    .order("criado_em", { ascending: false });

  if (startDate) {
    legacyQuery = legacyQuery.gte("criado_em", startDate.toISOString());
  }

  const legacy = await legacyQuery.limit(50);

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

function cityKey(value: string | null | undefined) {
  const normalized = (value || "nao_informada").toLowerCase();
  if (normalized === "caruaru") return "caruaru";
  if (normalized === "toritama") return "toritama";
  if (normalized === "santa_cruz_do_capibaribe") return "santa_cruz_do_capibaribe";
  return "nao_informada";
}

function cityLabel(value: string | null | undefined) {
  const normalized = cityKey(value);
  if (normalized === "caruaru") return "Caruaru";
  if (normalized === "toritama") return "Toritama";
  if (normalized === "santa_cruz_do_capibaribe") return "Santa Cruz";
  return "Nao informada";
}

function segmentKey(value: string | null | undefined) {
  return (value || "outros").trim().toLowerCase() || "outros";
}

function segmentLabel(value: string | null | undefined) {
  const normalized = segmentKey(value);
  if (normalized === "moda") return "Moda";
  if (normalized === "alimentacao") return "Alimentacao";
  if (normalized === "insumos") return "Insumos";
  if (normalized === "servicos") return "Servicos";
  if (normalized === "energia") return "Energia";
  if (normalized === "construcao") return "Construcao";
  return "Outros";
}

function periodStartDate(period: AdminIntelligenceFilters["period"]) {
  const start = new Date();

  if (period === "hoje") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "7d") {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "mes") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  return undefined;
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

export async function getAdminIntelligenceData(
  client: SupabaseClient,
  filters: AdminIntelligenceFilters = {},
): Promise<AdminIntelligenceData> {
  const startDate = periodStartDate(filters.period);
  let salesQuery = client
    .from("vendas_pdv_local")
    .select("id,lojista_id,produto_id,quantidade,valor_total,criado_em,lojistas(nome_fantasia,segmento,usuarios(cidade_base)),produtos(nome_produto,codigo_referencia_sku)")
    .order("criado_em", { ascending: false });

  if (startDate) {
    salesQuery = salesQuery.gte("criado_em", startDate.toISOString());
  }

  const salesResult = await salesQuery.limit(1000);

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

  const allSales = (salesResult.data || []).map((sale) => {
    const store = normalizeRelation(sale.lojistas);
    const storeUser = normalizeRelation(store?.usuarios);
    const product = normalizeRelation(sale.produtos);
    const saleCity = cityKey(storeUser?.cidade_base);
    const saleSegment = segmentKey(store?.segmento);

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
      city: saleCity,
      cityLabel: cityLabel(saleCity),
      segment: saleSegment,
      segmentLabel: segmentLabel(saleSegment),
    };
  }) as PdvSaleRecord[];

  const salesForDistribution = allSales.filter((sale) => !filters.city || sale.city === filters.city);
  const sales = salesForDistribution.filter((sale) => !filters.segment || sale.segment === filters.segment);

  const rankingMap = new Map<string, ProductRankingItem & { stores: Map<string, { quantity: number; total: number }> }>();

  for (const sale of sales) {
    const key = sale.produto_id || sale.productName;
    const current = rankingMap.get(key) || {
      productId: key,
      productName: sale.productName,
      sku: sale.sku,
      ean: sale.ean,
      quantity: 0,
      total: 0,
      topStoreName: sale.storeName,
      topStoreQuantity: 0,
      topStoreTotal: 0,
      stores: new Map<string, { quantity: number; total: number }>(),
    };

    current.quantity += sale.quantidade;
    current.total += Number(sale.valor_total || 0);
    const storeStats = current.stores.get(sale.storeName) || { quantity: 0, total: 0 };
    storeStats.quantity += sale.quantidade;
    storeStats.total += Number(sale.valor_total || 0);
    current.stores.set(sale.storeName, storeStats);
    const leader = Array.from(current.stores.entries()).sort((a, b) => b[1].quantity - a[1].quantity)[0];

    if (leader) {
      current.topStoreName = leader[0];
      current.topStoreQuantity = leader[1].quantity;
      current.topStoreTotal = leader[1].total;
    }

    rankingMap.set(key, current);
  }

  const orders = await getSupplyOrders(client, startDate);
  const [{ count: pendingAlerts }, { count: convertedAlerts }] = await Promise.all([
    client.from("alertas_reabastecimento").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    client.from("alertas_reabastecimento").select("id", { count: "exact", head: true }).in("status", ["pedido_feito", "concluido"]),
  ]);
  const heatmapMap = new Map<string, CityHeatmapItem>();

  for (const sale of allSales.filter((item) => !filters.segment || item.segment === filters.segment)) {
    const current = heatmapMap.get(sale.city) || {
      city: sale.city,
      label: sale.cityLabel,
      total: 0,
      quantity: 0,
    };

    current.total += Number(sale.valor_total || 0);
    current.quantity += sale.quantidade;
    heatmapMap.set(sale.city, current);
  }
  const segmentMap = new Map<string, SegmentDistributionItem>();
  const segmentTotal = salesForDistribution.reduce((sum, sale) => sum + Number(sale.valor_total || 0), 0);

  for (const sale of salesForDistribution) {
    const current = segmentMap.get(sale.segment) || {
      segment: sale.segment,
      label: sale.segmentLabel,
      total: 0,
      quantity: 0,
      salesCount: 0,
      percentage: 0,
    };

    current.total += Number(sale.valor_total || 0);
    current.quantity += sale.quantidade;
    current.salesCount += 1;
    segmentMap.set(sale.segment, current);
  }

  const segmentDistribution = Array.from(segmentMap.values())
    .map((item) => ({ ...item, percentage: segmentTotal ? Math.round((item.total / segmentTotal) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
  const totalPdvRevenue = sales.reduce((sum, sale) => sum + Number(sale.valor_total || 0), 0);
  const ranking = Array.from(rankingMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map(({ stores: _stores, ...item }) => item);

  return {
    totalPdvSales: sales.length,
    totalPdvRevenue,
    averageTicket: sales.length ? totalPdvRevenue / sales.length : 0,
    totalItemsScanned: sales.reduce((sum, sale) => sum + sale.quantidade, 0),
    funnel: {
      pendingAlerts: pendingAlerts || 0,
      convertedAlerts: convertedAlerts || 0,
      supplyOrders: orders.length,
    },
    cityHeatmap: Array.from(heatmapMap.values()).sort((a, b) => b.total - a.total),
    segmentDistribution,
    salesSeries: buildSalesSeries(sales),
    sales: sales.slice(0, 30),
    orders,
    ranking,
  };
}
