import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { importDistributorStock, type DistributorStockInput } from "@/lib/data/distributor-stock";

type ImportPayload = {
  items?: DistributorStockInput[];
};

function normalizeItem(item: DistributorStockInput): DistributorStockInput {
  return {
    distribuidora_id: item.distribuidora_id || null,
    codigo_ean: String(item.codigo_ean || "").replace(/\D/g, ""),
    nome_produto: item.nome_produto?.trim() || null,
    preco_venda_b2b: item.preco_venda_b2b === null || item.preco_venda_b2b === undefined ? null : Number(item.preco_venda_b2b),
    estoque_disponivel: Number(item.estoque_disponivel || 0),
  };
}

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const payload = (await request.json()) as ImportPayload;
  const items = (payload.items || []).map(normalizeItem).filter((item) => item.codigo_ean);

  if (!items.length) {
    return NextResponse.json({ error: "Nenhum item com EAN valido foi encontrado." }, { status: 400 });
  }

  try {
    const results = await importDistributorStock(admin.supabase, items);
    return NextResponse.json({
      ok: true,
      inserted: results.filter((item) => item.action === "inserted").length,
      updated: results.filter((item) => item.action === "updated").length,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao importar estoque." }, { status: 400 });
  }
}
