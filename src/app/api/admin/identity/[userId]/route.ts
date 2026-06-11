import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import type { IdentityStatus, SignedIdentityDocument } from "@/lib/data/kyc";

type RouteContext = {
  params: {
    userId: string;
  };
};

const allowedStatuses = new Set<IdentityStatus>(["aprovado", "rejeitado", "pendente"]);

export async function GET(request: NextRequest, { params }: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);

  if ("error" in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { data: profile, error: profileError } = await admin.supabase
    .from("usuarios")
    .select("id,status_verificacao_identidade")
    .eq("id", params.userId)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: profileError?.message || "Usuario nao encontrado." }, { status: 404 });
  }

  const { data, error } = await admin.supabase
    .from("documentos_usuarios")
    .select("id,usuario_id,tipo,url_arquivo,status,motivo_rejeicao,criado_em")
    .eq("usuario_id", params.userId)
    .order("criado_em", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const documents = await Promise.all(
    (data || []).map(async (document) => {
      const { data: signed, error: signedError } = await admin.supabase.storage
        .from("user-documents")
        .createSignedUrl(document.url_arquivo, 60 * 10);

      return {
        ...document,
        signed_url: signedError ? null : signed?.signedUrl || null,
      } as SignedIdentityDocument;
    }),
  );

  return NextResponse.json({
    status: profile.status_verificacao_identidade || "nao_enviado",
    documents,
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const admin = await getAuthenticatedAdmin(request);

  if ("error" in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const payload = (await request.json()) as { status?: IdentityStatus; motivo?: string };
  const status = payload.status;

  if (!status || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Status de verificacao invalido." }, { status: 400 });
  }

  if (status === "rejeitado" && !payload.motivo?.trim()) {
    return NextResponse.json({ error: "Informe o motivo da rejeicao." }, { status: 400 });
  }

  const { error: profileError } = await admin.supabase
    .from("usuarios")
    .update({ status_verificacao_identidade: status })
    .eq("id", params.userId);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { error: docsError } = await admin.supabase
    .from("documentos_usuarios")
    .update({
      status,
      motivo_rejeicao: status === "rejeitado" ? payload.motivo?.trim() || null : null,
    })
    .eq("usuario_id", params.userId);

  if (docsError) {
    return NextResponse.json({ error: docsError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status });
}
