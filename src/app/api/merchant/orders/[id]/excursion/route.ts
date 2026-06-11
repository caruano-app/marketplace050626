import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedMerchant } from "@/lib/auth/session";

type RouteContext = {
  params: {
    id: string;
  };
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function uploadProofImage(request: NextRequest, merchantId: string, orderId: string, file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  const merchant = await getAuthenticatedMerchant(request);

  if ("error" in merchant) {
    throw new Error(merchant.error);
  }

  const bucket = process.env.NEXT_PUBLIC_DELIVERY_PROOFS_BUCKET || "delivery-proofs";
  const path = `${merchantId}/${orderId}/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase()}`;
  const { error } = await merchant.supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(`Falha no upload do comprovante: ${error.message}`);
  }

  const { data } = merchant.supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const merchant = await getAuthenticatedMerchant(request);

  if ("error" in merchant) {
    return NextResponse.json({ error: merchant.error }, { status: merchant.status });
  }

  const { data: order, error: orderError } = await merchant.supabase
    .from("sub_pedidos_loja")
    .select("id,lojista_id,transacoes_mestre(comprador_id)")
    .eq("id", params.id)
    .eq("lojista_id", merchant.store.id)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Pedido nao encontrado para este lojista." }, { status: 404 });
  }

  const formData = await request.formData();
  const fileValue = formData.get("proof");
  const proofFile = fileValue instanceof File ? fileValue : null;

  let proofUrl = textValue(formData, "currentProofUrl");

  try {
    const uploadedUrl = await uploadProofImage(request, merchant.store.id, params.id, proofFile);
    proofUrl = uploadedUrl || proofUrl;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha no upload do comprovante." }, { status: 400 });
  }

  const payload = {
    sub_pedido_id: params.id,
    lojista_id: merchant.store.id,
    excursao_transportadora_id: textValue(formData, "excursionId"),
    nome_guia: textValue(formData, "guideName"),
    numero_vaga_box: textValue(formData, "boxNumber"),
    cor_setor: textValue(formData, "sectorColor"),
    foto_comprovante_vaga_url: proofUrl,
    status_entrega: "pronto_para_coleta",
  };

  const { data: existing } = await merchant.supabase
    .from("envio_via_excursao")
    .select("id")
    .eq("sub_pedido_id", params.id)
    .maybeSingle();

  const operation = existing?.id
    ? merchant.supabase.from("envio_via_excursao").update(payload).eq("id", existing.id)
    : merchant.supabase.from("envio_via_excursao").insert(payload);

  const { error } = await operation;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await merchant.supabase
    .from("sub_pedidos_loja")
    .update({ status_preparacao: "pronto_coleta" })
    .eq("id", params.id)
    .eq("lojista_id", merchant.store.id);

  const transaction = Array.isArray(order.transacoes_mestre) ? order.transacoes_mestre[0] : order.transacoes_mestre;
  const buyerId = transaction?.comprador_id;

  if (buyerId && proofUrl) {
    await merchant.supabase.from("notificacoes").insert({
      usuario_id: buyerId,
      titulo: `Seu fardo da loja ${merchant.store.nome_fantasia} ja esta no onibus!`,
      mensagem: "O lojista anexou a foto do comprovante da entrega na excursao.",
      tipo: "logistica",
      lida: false,
      link_acao: "/dashboard/comprador",
    });
  }

  return NextResponse.json({ ok: true, proofUrl });
}
