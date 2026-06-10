import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedMerchant } from "@/lib/auth/session";

const allowedStatuses = new Set(["pendente_separacao", "em_separacao", "pronto_coleta", "enviado"]);

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const merchant = await getAuthenticatedMerchant(request);

  if ("error" in merchant) {
    return NextResponse.json({ error: merchant.error }, { status: merchant.status });
  }

  const payload = (await request.json()) as { status?: string };
  const status = payload.status;

  if (!status || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Status de pedido invalido." }, { status: 400 });
  }

  const { data: order, error: orderError } = await merchant.supabase
    .from("sub_pedidos_loja")
    .select("id,lojista_id")
    .eq("id", params.id)
    .eq("lojista_id", merchant.store.id)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Pedido nao encontrado para este lojista." }, { status: 404 });
  }

  const { error } = await merchant.supabase
    .from("sub_pedidos_loja")
    .update({ status_preparacao: status })
    .eq("id", params.id)
    .eq("lojista_id", merchant.store.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status });
}
