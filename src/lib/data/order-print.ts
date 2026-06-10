import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OrderPrintItem = {
  id: string;
  quantidade: number;
  preco_unitario_aplicado: number;
  produto: string;
  sku: string;
  tamanho: string;
  cor: string;
};

export type OrderPrintData = {
  id: string;
  transactionId: string;
  createdAt: string;
  status: string;
  storeName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  destinationCity: string;
  subtotal: number;
  freight: number;
  total: number;
  weightKg: number;
  volume: string;
  trackingCode: string;
  items: OrderPrintItem[];
};

const fallbackOrder: OrderPrintData = {
  id: "pedido-demo",
  transactionId: "CARUANO-DEMO",
  createdAt: new Date().toISOString(),
  status: "pendente_separacao",
  storeName: "Loja Caruano",
  customerName: "Cliente Caruano",
  customerPhone: "(81) 99999-0000",
  customerEmail: "cliente@caruano.local",
  destinationCity: "Caruaru",
  subtotal: 119.8,
  freight: 0,
  total: 119.8,
  weightKg: 1.2,
  volume: "01/01",
  trackingCode: "CRN-DEMO-0001",
  items: [
    {
      id: "item-demo",
      quantidade: 2,
      preco_unitario_aplicado: 59.9,
      produto: "Camisa Polo",
      sku: "PR-241276",
      tamanho: "P",
      cor: "Azul",
    },
  ],
};

type SupabaseOrderRow = {
  id: string;
  valor_produtos_loja: number;
  valor_frete_loja: number;
  status_preparacao: string | null;
  criado_em: string | null;
  lojistas?: { nome_fantasia: string } | { nome_fantasia: string }[] | null;
  transacoes_mestre?: {
    id: string;
    criado_em: string | null;
    valor_total_checkout: number;
    usuarios?: {
      nome_completo: string;
      telefone: string;
      email: string;
      cidade_base: string;
    } | { nome_completo: string; telefone: string; email: string; cidade_base: string }[] | null;
  } | Array<{
    id: string;
    criado_em: string | null;
    valor_total_checkout: number;
    usuarios?: {
      nome_completo: string;
      telefone: string;
      email: string;
      cidade_base: string;
    } | { nome_completo: string; telefone: string; email: string; cidade_base: string }[] | null;
  }> | null;
  itens_pedido?: Array<{
    id: string;
    quantidade: number;
    preco_unitario_aplicado: number;
    produtos?: { nome_produto: string; codigo_referencia_sku: string; peso_kg: number | null } | { nome_produto: string; codigo_referencia_sku: string; peso_kg: number | null }[] | null;
    variacoes_produto?: { nome_variacao: string | null } | { nome_variacao: string | null }[] | null;
  }> | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
}

function parseVariation(value: string | null | undefined) {
  const text = value || "";
  return {
    tamanho: text.match(/\b(PP|P|M|G|GG|XG)\b/i)?.[0]?.toUpperCase() || "-",
    cor: text.split(" ").find((part) => ["preto", "azul", "vermelho", "amarelo", "verde", "pink"].includes(part.toLowerCase())) || "-",
  };
}

export async function getOrderPrintData(orderId: string): Promise<OrderPrintData> {
  const supabase = createSupabaseServerClient();

  if (!supabase || orderId === "demo") {
    return fallbackOrder;
  }

  const { data, error } = await supabase
    .from("sub_pedidos_loja")
    .select(
      "id,valor_produtos_loja,valor_frete_loja,status_preparacao,criado_em,lojistas(nome_fantasia),transacoes_mestre(id,criado_em,valor_total_checkout,usuarios(nome_completo,telefone,email,cidade_base)),itens_pedido(id,quantidade,preco_unitario_aplicado,produtos(nome_produto,codigo_referencia_sku,peso_kg),variacoes_produto(nome_variacao))",
    )
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return fallbackOrder;
  }

  const row = data as unknown as SupabaseOrderRow;
  const store = first(row.lojistas);
  const transaction = first(row.transacoes_mestre);
  const customer = first(transaction?.usuarios);
  const items = (row.itens_pedido || []).map((item) => {
    const variationRow = first(item.variacoes_produto);
    const variation = parseVariation(variationRow?.nome_variacao);
    const product = first(item.produtos);
    return {
      id: item.id,
      quantidade: Number(item.quantidade || 0),
      preco_unitario_aplicado: Number(item.preco_unitario_aplicado || 0),
      produto: product?.nome_produto || "Produto",
      sku: product?.codigo_referencia_sku || "-",
      tamanho: variation.tamanho,
      cor: variation.cor,
    };
  });
  const weightKg = (row.itens_pedido || []).reduce((sum, item) => sum + Number(first(item.produtos)?.peso_kg || 0) * Number(item.quantidade || 0), 0);

  return {
    id: row.id,
    transactionId: transaction?.id || row.id,
    createdAt: transaction?.criado_em || row.criado_em || new Date().toISOString(),
    status: row.status_preparacao || "pendente",
    storeName: store?.nome_fantasia || "Loja Caruano",
    customerName: customer?.nome_completo || "Cliente Caruano",
    customerPhone: customer?.telefone || "-",
    customerEmail: customer?.email || "-",
    destinationCity: customer?.cidade_base || "Caruaru",
    subtotal: Number(row.valor_produtos_loja || 0),
    freight: Number(row.valor_frete_loja || 0),
    total: Number(row.valor_produtos_loja || 0) + Number(row.valor_frete_loja || 0),
    weightKg,
    volume: "01/01",
    trackingCode: `CRN-${row.id.slice(0, 8).toUpperCase()}`,
    items,
  };
}
