import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedMerchant } from "@/lib/auth/session";

type SuggestionPayload = {
  name: string;
  niche: string;
  context: string;
};

export async function POST(request: NextRequest) {
  const merchant = await getAuthenticatedMerchant(request);

  if ("error" in merchant) {
    return NextResponse.json({ error: merchant.error }, { status: merchant.status });
  }

  const payload = (await request.json()) as SuggestionPayload;

  if (!payload.name?.trim()) {
    return NextResponse.json({ error: "Informe o nome da categoria sugerida." }, { status: 400 });
  }

  const { error } = await merchant.supabase.from("sugestoes_categorias").insert({
    lojista_id: merchant.store.id,
    nome_sugerido: payload.name.trim(),
    status: "pendente",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
