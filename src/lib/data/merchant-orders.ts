import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MerchantOrderStatus = "pendente_separacao" | "em_separacao" | "pronto_coleta" | "enviado";

export type MerchantOrderItem = {
  id: string;
  quantidade: number;
  preco_unitario_aplicado: number;
  produto: string;
  sku: string;
  imagem: string | null;
};

export type MerchantOrderSummary = {
  id: string;
  status: MerchantOrderStatus;
  createdAt: string | null;
  customerName: string;
  customerPhone: string;
  storeName: string;
  total: number;
  itemsCount: number;
};

export type MerchantExcursionOption = {
  id: string;
  name: string;
  guideName: string | null;
  sectorColor: string | null;
};

export type MerchantExcursionShipment = {
  id: string;
  excursionId: string | null;
  excursionName: string | null;
  guideName: string | null;
  boxNumber: string | null;
  sectorColor: string | null;
  proofUrl: string | null;
  status: string | null;
};

export type MerchantOrderDetail = MerchantOrderSummary & {
  transactionId: string;
  customerEmail: string;
  items: MerchantOrderItem[];
  shipment: MerchantExcursionShipment | null;
  excursions: MerchantExcursionOption[];
};

export type TrackingDetail = {
  id: string;
  status: MerchantOrderStatus;
  storeName: string;
  customerName: string;
  trackingCode: string;
  shipment: MerchantExcursionShipment | null;
};

type SupabaseOrderRow = {
  id: string;
  lojista_id?: string;
  valor_produtos_loja?: number;
  valor_frete_loja?: number;
  status_preparacao?: string | null;
  criado_em?: string | null;
  lojistas?: { nome_fantasia?: string | null } | { nome_fantasia?: string | null }[] | null;
  transacoes_mestre?: {
    id?: string;
    usuarios?: {
      nome_completo?: string | null;
      telefone?: string | null;
      email?: string | null;
    } | { nome_completo?: string | null; telefone?: string | null; email?: string | null }[] | null;
  } | Array<{
    id?: string;
    usuarios?: {
      nome_completo?: string | null;
      telefone?: string | null;
      email?: string | null;
    } | { nome_completo?: string | null; telefone?: string | null; email?: string | null }[] | null;
  }> | null;
  itens_pedido?: Array<{
    id: string;
    quantidade?: number | null;
    preco_unitario_aplicado?: number | null;
    produtos?: {
      nome_produto?: string | null;
      codigo_referencia_sku?: string | null;
      imagens_url?: string[] | null;
    } | Array<{
      nome_produto?: string | null;
      codigo_referencia_sku?: string | null;
      imagens_url?: string[] | null;
    }> | null;
  }> | null;
};

type ShipmentRow = {
  id: string;
  excursao_transportadora_id?: string | null;
  nome_guia?: string | null;
  numero_vaga_box?: string | null;
  cor_setor?: string | null;
  foto_comprovante_vaga_url?: string | null;
  status_entrega?: string | null;
  excursos_transportadoras?: { nome_transportadora?: string | null; nome?: string | null } | Array<{ nome_transportadora?: string | null; nome?: string | null }> | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
}

function normalizeStatus(status: string | null | undefined): MerchantOrderStatus {
  if (status === "em_separacao" || status === "pronto_coleta" || status === "enviado") {
    return status;
  }

  return "pendente_separacao";
}

function itemFromRow(item: NonNullable<SupabaseOrderRow["itens_pedido"]>[number]): MerchantOrderItem {
  const product = first(item.produtos);

  return {
    id: item.id,
    quantidade: Number(item.quantidade || 0),
    preco_unitario_aplicado: Number(item.preco_unitario_aplicado || 0),
    produto: product?.nome_produto || "Produto Caruano",
    sku: product?.codigo_referencia_sku || "-",
    imagem: product?.imagens_url?.[0] || null,
  };
}

function summaryFromRow(row: SupabaseOrderRow): MerchantOrderSummary {
  const store = first(row.lojistas);
  const transaction = first(row.transacoes_mestre);
  const customer = first(transaction?.usuarios);
  const items = row.itens_pedido || [];

  return {
    id: row.id,
    status: normalizeStatus(row.status_preparacao),
    createdAt: row.criado_em || null,
    customerName: customer?.nome_completo || "Cliente Caruano",
    customerPhone: customer?.telefone || "-",
    storeName: store?.nome_fantasia || "Loja Caruano",
    total: Number(row.valor_produtos_loja || 0) + Number(row.valor_frete_loja || 0),
    itemsCount: items.reduce((sum, item) => sum + Number(item.quantidade || 0), 0),
  };
}

function shipmentFromRow(row: ShipmentRow | null | undefined): MerchantExcursionShipment | null {
  if (!row) return null;
  const excursion = first(row.excursos_transportadoras);

  return {
    id: row.id,
    excursionId: row.excursao_transportadora_id || null,
    excursionName: excursion?.nome_transportadora || excursion?.nome || null,
    guideName: row.nome_guia || null,
    boxNumber: row.numero_vaga_box || null,
    sectorColor: row.cor_setor || null,
    proofUrl: row.foto_comprovante_vaga_url || null,
    status: row.status_entrega || null,
  };
}

async function getShipment(orderId: string): Promise<MerchantExcursionShipment | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("envio_via_excursao")
    .select("id,excursao_transportadora_id,nome_guia,numero_vaga_box,cor_setor,foto_comprovante_vaga_url,status_entrega,excursos_transportadoras(nome_transportadora,nome)")
    .eq("sub_pedido_id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return shipmentFromRow(data as ShipmentRow);
}

async function getExcursions(): Promise<MerchantExcursionOption[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("excursos_transportadoras")
    .select("id,nome_transportadora,nome,nome_guia,cor_setor")
    .order("criado_em", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return (data as Array<Record<string, string | null>>).map((item) => ({
    id: String(item.id),
    name: item.nome_transportadora || item.nome || "Excursao Caruano",
    guideName: item.nome_guia || null,
    sectorColor: item.cor_setor || null,
  }));
}

export async function getMerchantOrders(): Promise<MerchantOrderSummary[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sub_pedidos_loja")
    .select("id,valor_produtos_loja,valor_frete_loja,status_preparacao,criado_em,lojistas(nome_fantasia),transacoes_mestre(id,usuarios(nome_completo,telefone,email)),itens_pedido(id,quantidade)")
    .order("criado_em", { ascending: false })
    .limit(40);

  if (error || !data) return [];

  return (data as unknown as SupabaseOrderRow[]).map(summaryFromRow);
}

export async function getMerchantOrderDetail(orderId: string): Promise<MerchantOrderDetail | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sub_pedidos_loja")
    .select("id,valor_produtos_loja,valor_frete_loja,status_preparacao,criado_em,lojistas(nome_fantasia),transacoes_mestre(id,usuarios(nome_completo,telefone,email)),itens_pedido(id,quantidade,preco_unitario_aplicado,produtos(nome_produto,codigo_referencia_sku,imagens_url))")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as SupabaseOrderRow;
  const transaction = first(row.transacoes_mestre);
  const customer = first(transaction?.usuarios);
  const [shipment, excursions] = await Promise.all([getShipment(orderId), getExcursions()]);

  return {
    ...summaryFromRow(row),
    transactionId: transaction?.id || row.id,
    customerEmail: customer?.email || "-",
    items: (row.itens_pedido || []).map(itemFromRow),
    shipment,
    excursions,
  };
}

export async function getTrackingDetail(orderId: string): Promise<TrackingDetail | null> {
  const detail = await getMerchantOrderDetail(orderId);

  if (!detail) return null;

  return {
    id: detail.id,
    status: detail.status,
    storeName: detail.storeName,
    customerName: detail.customerName,
    trackingCode: `CRN-${detail.id.slice(0, 8).toUpperCase()}`,
    shipment: detail.shipment,
  };
}
