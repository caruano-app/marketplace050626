import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { error } = await admin.supabase.from("escopos_gerencia").update({ ativo: false }).eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
