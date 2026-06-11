import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedDriver } from "@/lib/auth/session";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const driver = await getAuthenticatedDriver(request);

  if ("error" in driver) {
    return NextResponse.json({ error: driver.error }, { status: driver.status });
  }

  if (driver.profile.status_verificacao_identidade !== "aprovado") {
    return NextResponse.json({ error: "Sua verificacao precisa estar aprovada para aceitar fretes." }, { status: 403 });
  }

  const { error } = await driver.supabase
    .from("solicitacoes_frete")
    .update({ entregador_id: driver.driver.id })
    .eq("id", params.id)
    .is("entregador_id", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
