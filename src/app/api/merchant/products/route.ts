import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedMerchant } from "@/lib/auth/session";

type ProductPayload = {
  categoryId: number;
  categoryName: string;
  name: string;
  sku: string;
  description: string;
  unitMeasure: string;
  retailPrice: number;
  wholesalePrice: number | null;
  wholesaleMinQuantity: number | null;
  weightKg: number;
  heightCm: number;
  widthCm: number;
  depthCm: number;
  allowExport: boolean;
  technicalSpecs: Record<string, string>;
  variationName: string;
  variationEan13: string;
  variationStock: number;
};

const allowedUnits = new Set(["UN", "KG", "CX", "DZ", "FD", "LT", "MT"]);

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formNumber(formData: FormData, key: string) {
  const value = formText(formData, key).replace(",", ".");
  return value ? Number(value) : 0;
}

function formNullableNumber(formData: FormData, key: string) {
  const value = formText(formData, key).replace(",", ".");
  return value ? Number(value) : null;
}

function parseTechnicalSpecs(value: string) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, string> : {};
  } catch {
    return {};
  }
}

async function parsePayload(request: NextRequest): Promise<{ payload: ProductPayload; images: File[] }> {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    const payload = (await request.json()) as ProductPayload;
    return {
      payload: {
        ...payload,
        variationName: payload.variationName || "Padrao",
        variationEan13: String(payload.variationEan13 || "").replace(/\D/g, ""),
        variationStock: Number(payload.variationStock || 0),
      },
      images: [],
    };
  }

  const formData = await request.formData();
  const images = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0 && file.type.startsWith("image/"));

  return {
    payload: {
      categoryId: Number(formText(formData, "categoryId")),
      categoryName: formText(formData, "categoryName"),
      name: formText(formData, "name"),
      sku: formText(formData, "sku"),
      description: formText(formData, "description"),
      unitMeasure: formText(formData, "unitMeasure"),
      retailPrice: formNumber(formData, "retailPrice"),
      wholesalePrice: formNullableNumber(formData, "wholesalePrice"),
      wholesaleMinQuantity: formNullableNumber(formData, "wholesaleMinQuantity"),
      weightKg: formNumber(formData, "weightKg"),
      heightCm: formNumber(formData, "heightCm"),
      widthCm: formNumber(formData, "widthCm"),
      depthCm: formNumber(formData, "depthCm"),
      allowExport: formText(formData, "allowExport") !== "false",
      technicalSpecs: parseTechnicalSpecs(formText(formData, "technicalSpecs")),
      variationName: formText(formData, "variationName") || "Padrao",
      variationEan13: formText(formData, "variationEan13").replace(/\D/g, ""),
      variationStock: formNumber(formData, "variationStock"),
    },
    images,
  };
}

async function uploadProductImages(images: File[], productId: string, merchantId: string, supabase: ReturnType<typeof getAuthenticatedMerchant> extends Promise<infer T> ? T extends { supabase: infer S } ? S : never : never) {
  const urls: string[] = [];

  for (const image of images.slice(0, 5)) {
    const extension = image.name.split(".").pop() || "jpg";
    const path = `${merchantId}/${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error } = await supabase.storage.from("products").upload(path, image, {
      contentType: image.type,
      upsert: true,
    });

    if (error) {
      throw new Error(`Falha ao enviar imagem para o bucket products: ${error.message}`);
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

export async function POST(request: NextRequest) {
  const merchant = await getAuthenticatedMerchant(request);

  if ("error" in merchant) {
    return NextResponse.json({ error: merchant.error }, { status: merchant.status });
  }

  const { payload, images } = await parsePayload(request);

  if (!payload.name?.trim() || !payload.sku?.trim() || !payload.categoryId || !payload.retailPrice) {
    return NextResponse.json({ error: "Preencha categoria, nome, SKU e preco unitario." }, { status: 400 });
  }

  if (
    !Number.isFinite(payload.weightKg) ||
    !Number.isFinite(payload.heightCm) ||
    !Number.isFinite(payload.widthCm) ||
    !Number.isFinite(payload.depthCm) ||
    payload.weightKg <= 0 ||
    payload.heightCm <= 0 ||
    payload.widthCm <= 0 ||
    payload.depthCm <= 0
  ) {
    return NextResponse.json({ error: "Informe peso e dimensoes validas para calculo de frete." }, { status: 400 });
  }

  if (!allowedUnits.has(payload.unitMeasure)) {
    return NextResponse.json({ error: "Unidade de medida invalida." }, { status: 400 });
  }

  const variationEan13 = String(payload.variationEan13 || "").replace(/\D/g, "");

  if (!/^\d{13}$/.test(variationEan13)) {
    return NextResponse.json({ error: "Informe um codigo de barras EAN-13 valido com 13 numeros para a variacao inicial." }, { status: 400 });
  }

  const technicalData = {
    categoria_mestre_id: payload.categoryId,
    categoria_nome: payload.categoryName,
    atributos: payload.technicalSpecs || {},
    unidade_medida: payload.unitMeasure,
    preco_atacado: payload.wholesalePrice,
    quantidade_minima_atacado: payload.wholesaleMinQuantity,
    frete_marketplaces: {
      peso_kg: payload.weightKg,
      altura_cm: payload.heightCm,
      largura_cm: payload.widthCm,
      profundidade_cm: payload.depthCm,
    },
    exportacao_marketplaces: {
      permite_exportacao: payload.allowExport,
      exige_ean13_variacao: payload.allowExport,
    },
  };

  const { data, error } = await merchant.supabase
    .from("produtos")
    .insert({
      lojista_id: merchant.store.id,
      codigo_referencia_sku: payload.sku.trim(),
      nome_produto: payload.name.trim(),
      descricao_completa: payload.description?.trim() || null,
      preco_base_varejo: payload.retailPrice,
      peso_kg: payload.weightKg,
      dimensoes_cm: {
        A: payload.heightCm,
        L: payload.widthCm,
        P: payload.depthCm,
        C: payload.depthCm,
      },
      unidade_medida: payload.unitMeasure,
      especificacoes_tecnicas: technicalData,
      vendido_e_entregue_por: merchant.store.nome_fantasia,
      permite_exportacao: payload.allowExport,
      imagens_url: [],
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Nao foi possivel salvar o produto." }, { status: 400 });
  }

  const warnings: string[] = [];

  if (images.length) {
    try {
      const imageUrls = await uploadProductImages(images, data.id, merchant.store.id, merchant.supabase);
      await merchant.supabase.from("produtos").update({ imagens_url: imageUrls }).eq("id", data.id);
    } catch (uploadError) {
      return NextResponse.json({ error: uploadError instanceof Error ? uploadError.message : "Falha ao enviar imagens." }, { status: 400 });
    }
  }

  const { error: variationError } = await merchant.supabase.from("variacoes_produto").insert({
    produto_id: data.id,
    nome_variacao: payload.variationName || "Padrao",
    codigo_barras_ean: variationEan13,
    estoque_atual: Number.isFinite(payload.variationStock) ? payload.variationStock : 0,
  });

  if (variationError) {
    return NextResponse.json({ error: `Produto salvo, mas a variacao com EAN-13 nao foi criada: ${variationError.message}` }, { status: 400 });
  }

  if (payload.wholesalePrice && payload.wholesaleMinQuantity) {
    const { error: priceError } = await merchant.supabase.from("precificacao_atacado").insert({
      produto_id: data.id,
      quantidade_minima: payload.wholesaleMinQuantity,
      preco_unitario_atacado: payload.wholesalePrice,
    });

    if (priceError) {
      warnings.push(`Preco de atacado nao gravado em precificacao_atacado: ${priceError.message}`);
    }
  }

  return NextResponse.json({ id: data.id, warnings });
}
