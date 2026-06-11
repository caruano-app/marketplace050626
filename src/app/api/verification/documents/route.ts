import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { isIdentityDocumentType } from "@/lib/data/kyc";

const maxDocumentBytes = 800 * 1024;

function extensionFromFile(file: File) {
  const explicitExtension = file.name.split(".").pop();

  if (explicitExtension && explicitExtension.length <= 5) {
    return explicitExtension.toLowerCase();
  }

  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("documentos_usuarios")
    .select("id,usuario_id,tipo,url_arquivo,status,motivo_rejeicao,criado_em")
    .eq("usuario_id", auth.user.id)
    .order("criado_em", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    documents: data || [],
    status: auth.profile.status_verificacao_identidade || "nao_enviado",
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const typeValue = formData.get("type");
  const fileValue = formData.get("file");

  if (typeof typeValue !== "string" || !isIdentityDocumentType(typeValue)) {
    return NextResponse.json({ error: "Tipo de documento invalido." }, { status: 400 });
  }

  if (!(fileValue instanceof File) || fileValue.size <= 0) {
    return NextResponse.json({ error: "Envie um arquivo valido." }, { status: 400 });
  }

  if (!fileValue.type.startsWith("image/") && fileValue.type !== "application/pdf") {
    return NextResponse.json({ error: "Use imagem ou PDF para documentos." }, { status: 400 });
  }

  if (fileValue.size > maxDocumentBytes) {
    return NextResponse.json({ error: "O arquivo deve ter no maximo 800kb." }, { status: 400 });
  }

  const extension = extensionFromFile(fileValue);
  const path = `${auth.user.id}/${typeValue}-${Date.now()}.${extension}`;
  const { error: uploadError } = await auth.supabase.storage.from("user-documents").upload(path, fileValue, {
    contentType: fileValue.type || "image/jpeg",
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { error: insertError } = await auth.supabase.from("documentos_usuarios").insert({
    usuario_id: auth.user.id,
    tipo: typeValue,
    url_arquivo: path,
    status: "pendente",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const { error: profileError } = await auth.supabase
    .from("usuarios")
    .update({ status_verificacao_identidade: "pendente" })
    .eq("id", auth.user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, path });
}
