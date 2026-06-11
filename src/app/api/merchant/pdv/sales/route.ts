import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedMerchant } from "@/lib/auth/session";

type SalePayload = {
  ean?: string;
  quantity?: number;
};

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

export async function POST(request: NextRequest) {
  const merchant = await getAuthenticatedMerchant(request);
  if ("error" in merchant) return NextResponse.json({ error: merchant.error }, { status: merchant.status });

  const payload = (await request.json()) as SalePayload;
  const ean = String(payload.ean || "").replace(/\D/g, "");
  const quantity = Number(payload.quantity || 1);

  if (!ean || quantity <= 0) {
    return NextResponse.json({ error: "Informe EAN e quantidade validos." }, { status: 400 });
  }

  const { data: variationData, error: variationError } = await merchant.supabase
    .from("variacoes_produto")
    .select("id,produto_id,codigo_barras_ean,estoque_atual,produtos(id,lojista_id,nome_produto,preco_base_varejo)")
    .eq("codigo_barras_ean", ean)
    .eq("produtos.lojista_id", merchant.store.id)
    .limit(1)
    .maybeSingle();

  if (variationError) {
    return NextResponse.json({ error: variationError.message }, { status: 400 });
  }

  const product = normalizeRelation(variationData?.produtos);

  if (!variationData || !product || product.lojista_id !== merchant.store.id) {
    return NextResponse.json({ error: "Produto nao encontrado para este lojista." }, { status: 404 });
  }

  const currentStock = Number(variationData.estoque_atual || 0);
  const nextStock = Math.max(0, currentStock - quantity);
  const total = Number(product.preco_base_varejo || 0) * quantity;

  const { error: saleError } = await merchant.supabase.from("vendas_pdv_local").insert({
    lojista_id: merchant.store.id,
    produto_id: product.id,
    quantidade: quantity,
    valor_total: total,
  });

  if (saleError) {
    return NextResponse.json({ error: saleError.message }, { status: 400 });
  }

  const { error: stockError } = await merchant.supabase
    .from("variacoes_produto")
    .update({ estoque_atual: nextStock })
    .eq("id", variationData.id);

  if (stockError) {
    return NextResponse.json({ error: stockError.message }, { status: 400 });
  }

  let lowStockAlert = false;

  if (nextStock < 5) {
    lowStockAlert = true;
    await merchant.supabase.from("alertas_reabastecimento").insert({
      lojista_id: merchant.store.id,
      produto_id: product.id,
      status: "pendente",
      quantidade_sugerida: Math.max(10, 20 - nextStock),
    });
  }

  return NextResponse.json({
    ok: true,
    productName: product.nome_produto,
    total,
    nextStock,
    lowStockAlert,
  });
}
