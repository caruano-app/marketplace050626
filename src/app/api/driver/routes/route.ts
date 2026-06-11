import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedDriver } from "@/lib/auth/session";

type RoutePayload = {
  origem?: string;
  destino?: string;
  dias?: string[];
  valorBase?: number;
};

export async function POST(request: NextRequest) {
  const driver = await getAuthenticatedDriver(request);

  if ("error" in driver) {
    return NextResponse.json({ error: driver.error }, { status: driver.status });
  }

  const payload = (await request.json()) as RoutePayload;

  if (!payload.origem || !payload.destino) {
    return NextResponse.json({ error: "Informe origem e destino da rota." }, { status: 400 });
  }

  const { error } = await driver.supabase.from("rotas_entregadores").insert({
    entregador_id: driver.driver.id,
    cidade_origem: payload.origem,
    cidade_destino: payload.destino,
    dias_semana: Array.isArray(payload.dias) ? payload.dias : [],
    valor_base_entrega: Number(payload.valorBase || 0),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
