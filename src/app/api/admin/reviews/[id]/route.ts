import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

type RouteContext = {
  params: {
    id: string;
  };
};

const allowedStatuses = new Set(["aprovado", "rejeitado"]);

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const payload = (await request.json()) as { status?: string };
  const status = payload.status;

  if (!status || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Status de avaliacao invalido." }, { status: 400 });
  }

  const { error } = await admin.supabase
    .from("avaliacoes_comentarios")
    .update({ status })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status });
}
