import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getIntelligenceProfile } from "@/lib/data/management";

type ProfilePayload = {
  profissao?: string;
  bairro?: string;
  gastoMensalEnergia?: number | string;
  possuiVeiculo?: boolean;
  tipoVeiculo?: string;
  faturamentoMedioMensal?: number | string;
  interesses?: string[];
};

function toNumber(value: number | string | undefined) {
  if (value === undefined || value === "") return null;
  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const profile = await getIntelligenceProfile(auth.supabase, auth.user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao carregar perfil." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const payload = (await request.json()) as ProfilePayload;
  const interesses = Array.isArray(payload.interesses) ? payload.interesses.filter(Boolean).slice(0, 12) : [];

  const { error } = await auth.supabase.from("inteligencia_usuario").upsert(
    {
      usuario_id: auth.user.id,
      profissao: payload.profissao?.trim() || null,
      bairro: payload.bairro?.trim() || null,
      gasto_mensal_energia: toNumber(payload.gastoMensalEnergia),
      possui_veiculo_proprio: Boolean(payload.possuiVeiculo),
      tipo_veiculo_preferencial: payload.possuiVeiculo ? payload.tipoVeiculo?.trim() || null : null,
      faturamento_medio_mensal: toNumber(payload.faturamentoMedioMensal),
      interesses_tags: interesses,
      score_confianca: 100,
      ultima_atualizacao: new Date().toISOString(),
    },
    { onConflict: "usuario_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
