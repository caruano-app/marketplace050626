import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    pedido_id: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    await supabase
      .from("sub_pedidos_loja")
      .update({ status_preparacao: "enviado" })
      .eq("id", params.pedido_id);

    await supabase
      .from("envio_via_excursao")
      .update({ status_entrega: "enviado" })
      .eq("sub_pedido_id", params.pedido_id);
  }

  return NextResponse.redirect(new URL(`/rastreio/${params.pedido_id}?confirmado=1`, request.url));
}
