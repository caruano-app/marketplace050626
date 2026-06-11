import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { submitReview } from "@/lib/modules/trust/service";

type ReviewPayload = {
  produtoId?: string;
  lojistaId?: string | null;
  pedidoId?: string | null;
  nota?: number;
  comentario?: string | null;
};

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const payload = (await request.json()) as ReviewPayload;
  const nota = Number(payload.nota);

  if (!payload.produtoId || !Number.isFinite(nota) || nota < 1 || nota > 5) {
    return NextResponse.json({ error: "Informe produto e nota entre 1 e 5." }, { status: 400 });
  }

  const { data, error } = await submitReview(
    {
      produto_id: payload.produtoId,
      usuario_id: auth.user.id,
      lojista_id: payload.lojistaId || null,
      nota,
      comentario: payload.comentario?.trim() || null,
      metadata: {
        origem: "minha_carga",
        sub_pedido_id: payload.pedidoId || null,
      },
    },
    auth.supabase,
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, review: data });
}
