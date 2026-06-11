import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";

type DemandPayload = {
  tipo?: string;
  segmento?: string;
  cidade?: string;
  titulo?: string;
  descricao?: string;
  urgente?: boolean;
  detalhes?: Record<string, unknown>;
};

const allowedCities = new Set(["caruaru", "toritama", "santa_cruz_do_capibaribe"]);
const allowedSegments = new Set(["moda", "alimentacao", "insumos", "servicos", "energia"]);

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const payload = (await request.json()) as DemandPayload;
  const titulo = cleanText(payload.titulo);
  const descricao = cleanText(payload.descricao);
  const cidade = allowedCities.has(cleanText(payload.cidade)) ? cleanText(payload.cidade) : "caruaru";
  const segmento = allowedSegments.has(cleanText(payload.segmento)) ? cleanText(payload.segmento) : "servicos";

  if (!titulo || !descricao) {
    return NextResponse.json({ error: "Informe titulo e descricao da demanda." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("central_demandas")
    .insert({
      cliente_id: auth.user.id,
      tipo_demanda: cleanText(payload.tipo, "servico_tecnico"),
      segmento,
      cidade,
      titulo_demanda: titulo.slice(0, 200),
      descricao_detalhada: descricao,
      detalhes_tecnicos: {
        origem: "portal_publico",
        perfil_principal: auth.profile.perfil_principal,
        ...(payload.detalhes || {}),
      },
      status: "triagem",
      urgente: Boolean(payload.urgente),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
