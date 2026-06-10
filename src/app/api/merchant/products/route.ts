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
  allowExport: boolean;
  technicalSpecs: Record<string, string>;
};

const allowedUnits = new Set(["UN", "KG", "CX", "DZ", "FD", "LT"]);

export async function POST(request: NextRequest) {
  const merchant = await getAuthenticatedMerchant(request);

  if ("error" in merchant) {
    return NextResponse.json({ error: merchant.error }, { status: merchant.status });
  }

  const payload = (await request.json()) as ProductPayload;

  if (!payload.name?.trim() || !payload.sku?.trim() || !payload.categoryId || !payload.retailPrice) {
    return NextResponse.json({ error: "Preencha categoria, nome, SKU e preco unitario." }, { status: 400 });
  }

  if (!allowedUnits.has(payload.unitMeasure)) {
    return NextResponse.json({ error: "Unidade de medida invalida." }, { status: 400 });
  }

  const technicalData = {
    categoria_mestre_id: payload.categoryId,
    categoria_nome: payload.categoryName,
    atributos: payload.technicalSpecs || {},
    unidade_medida: payload.unitMeasure,
    preco_atacado: payload.wholesalePrice,
    quantidade_minima_atacado: payload.wholesaleMinQuantity,
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

  return NextResponse.json({ id: data.id });
}
