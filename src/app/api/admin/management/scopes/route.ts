import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

type ScopePayload = {
  usuarioId?: string;
  cidade?: string;
  segmento?: string;
  nivel?: number;
};

export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const payload = (await request.json()) as ScopePayload;

  if (!payload.usuarioId) {
    return NextResponse.json({ error: "Selecione um usuario." }, { status: 400 });
  }

  const nivel = Number(payload.nivel || 1);

  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 4) {
    return NextResponse.json({ error: "Nivel de permissao invalido." }, { status: 400 });
  }

  const { error } = await admin.supabase.from("escopos_gerencia").insert({
    usuario_id: payload.usuarioId,
    cidade_atuacao: payload.cidade && payload.cidade !== "todas" ? payload.cidade : null,
    segmento_atuacao: payload.segmento && payload.segmento !== "todos" ? payload.segmento : null,
    nivel_permissao: nivel,
    ativo: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
