import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MerchantOrderStatus } from "@/lib/data/merchant-orders";

export type BuyerCargoOrder = {
  id: string;
  status: MerchantOrderStatus;
  createdAt: string | null;
  storeName: string;
  storeVerified: boolean;
  total: number;
  itemsCount: number;
  shipment: {
    excursionName: string | null;
    guideName: string | null;
    boxNumber: string | null;
    sectorColor: string | null;
    proofUrl: string | null;
    status: string | null;
  } | null;
};

export type BuyerCargoSummary = {
  waiting: number;
  inBus: number;
};

type CargoRow = {
  id: string;
  valor_produtos_loja?: number | null;
  valor_frete_loja?: number | null;
  status_preparacao?: string | null;
  criado_em?: string | null;
  lojistas?: {
    nome_fantasia?: string | null;
    usuarios?: { status_verificacao_identidade?: string | null } | Array<{ status_verificacao_identidade?: string | null }> | null;
  } | Array<{
    nome_fantasia?: string | null;
    usuarios?: { status_verificacao_identidade?: string | null } | Array<{ status_verificacao_identidade?: string | null }> | null;
  }> | null;
  itens_pedido?: Array<{ quantidade?: number | null }> | null;
  envio_via_excursao?: Array<{
    nome_guia?: string | null;
    numero_vaga_box?: string | null;
    cor_setor?: string | null;
    foto_comprovante_vaga_url?: string | null;
    status_entrega?: string | null;
    excursos_transportadoras?: { nome_transportadora?: string | null; nome?: string | null } | Array<{ nome_transportadora?: string | null; nome?: string | null }> | null;
  }> | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
}

function normalizeStatus(status: string | null | undefined): MerchantOrderStatus {
  if (status === "em_separacao" || status === "pronto_coleta" || status === "enviado") return status;
  return "pendente_separacao";
}

function verifiedFromStore(store: CargoRow["lojistas"]) {
  const normalizedStore = first(store);
  const user = first(normalizedStore?.usuarios);
  return user?.status_verificacao_identidade === "aprovado";
}

function orderFromRow(row: CargoRow): BuyerCargoOrder {
  const store = first(row.lojistas);
  const shipmentRow = first(row.envio_via_excursao);
  const excursion = first(shipmentRow?.excursos_transportadoras);

  return {
    id: row.id,
    status: normalizeStatus(row.status_preparacao),
    createdAt: row.criado_em || null,
    storeName: store?.nome_fantasia || "Loja Caruano",
    storeVerified: verifiedFromStore(row.lojistas),
    total: Number(row.valor_produtos_loja || 0) + Number(row.valor_frete_loja || 0),
    itemsCount: (row.itens_pedido || []).reduce((sum, item) => sum + Number(item.quantidade || 0), 0),
    shipment: shipmentRow
      ? {
          excursionName: excursion?.nome_transportadora || excursion?.nome || null,
          guideName: shipmentRow.nome_guia || null,
          boxNumber: shipmentRow.numero_vaga_box || null,
          sectorColor: shipmentRow.cor_setor || null,
          proofUrl: shipmentRow.foto_comprovante_vaga_url || null,
          status: shipmentRow.status_entrega || null,
        }
      : null,
  };
}

export async function getBuyerCargo(userId: string): Promise<{ orders: BuyerCargoOrder[]; summary: BuyerCargoSummary }> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { orders: [], summary: { waiting: 0, inBus: 0 } };
  }

  const { data, error } = await supabase
    .from("sub_pedidos_loja")
    .select(
      "id,valor_produtos_loja,valor_frete_loja,status_preparacao,criado_em,lojistas(nome_fantasia,usuarios(status_verificacao_identidade)),transacoes_mestre!inner(comprador_id),itens_pedido(quantidade),envio_via_excursao(nome_guia,numero_vaga_box,cor_setor,foto_comprovante_vaga_url,status_entrega,excursos_transportadoras(nome_transportadora,nome))",
    )
    .eq("transacoes_mestre.comprador_id", userId)
    .order("criado_em", { ascending: false })
    .limit(50);

  if (error || !data) {
    return { orders: [], summary: { waiting: 0, inBus: 0 } };
  }

  const orders = (data as unknown as CargoRow[]).map(orderFromRow);
  const summary = {
    waiting: orders.filter((order) => order.status !== "enviado" && !order.shipment?.proofUrl).length,
    inBus: orders.filter((order) => Boolean(order.shipment?.proofUrl) || order.status === "enviado").length,
  };

  return { orders, summary };
}
