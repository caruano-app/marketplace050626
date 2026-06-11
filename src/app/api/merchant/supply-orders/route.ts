import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedMerchant } from "@/lib/auth/session";

type SupplyPayload = {
  fornecedorId?: string | null;
  valorTotal?: number | null;
};

export async function POST(request: NextRequest) {
  const merchant = await getAuthenticatedMerchant(request);

  if ("error" in merchant) {
    return NextResponse.json({ error: merchant.error }, { status: merchant.status });
  }

  const payload = (await request.json()) as SupplyPayload;

  const { error } = await merchant.supabase.from("ordens_abastecimento").insert({
    comprador_id: merchant.store.id,
    fornecedor_id: payload.fornecedorId || null,
    valor_total: Number(payload.valorTotal || 0),
    comissao_caruano: 0,
    status: "analise_marketplace",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
