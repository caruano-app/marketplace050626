import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProdutoVitrine } from "@/types/database";

const fallbackProducts: ProdutoVitrine[] = Array.from({ length: 5 }, (_, index) => ({
  id: `fallback-${index + 1}`,
  codigo_referencia_sku: `SKU-CARUANO-${index + 1}`,
  nome_produto: "Nome do produto",
  descricao_completa: "Breve descricao do produto para a vitrine do marketplace Caruano.",
  preco_base_varejo: 69.9,
  imagens_url: [],
  lojistas: {
    nome_fantasia: "Loja Caruano",
    slug: "loja-caruano",
  },
}));

export async function getFeaturedProducts(): Promise<ProdutoVitrine[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackProducts;
  }

  const { data, error } = await supabase
    .from("produtos")
    .select(
      "id,lojista_id,codigo_referencia_sku,nome_produto,descricao_completa,preco_base_varejo,unidade_medida,especificacoes_tecnicas,vendido_e_entregue_por,permite_exportacao,imagens_url,lojistas(nome_fantasia,slug)",
    )
    .order("criado_em", { ascending: false })
    .limit(5);

  if (error || !data?.length) {
    return fallbackProducts;
  }

  return data as ProdutoVitrine[];
}

export async function getDailyOfferProducts(): Promise<ProdutoVitrine[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackProducts;
  }

  const { data, error } = await supabase
    .from("produtos")
    .select(
      "id,lojista_id,codigo_referencia_sku,nome_produto,descricao_completa,preco_base_varejo,unidade_medida,especificacoes_tecnicas,vendido_e_entregue_por,permite_exportacao,imagens_url,lojistas(nome_fantasia,slug)",
    )
    .order("preco_base_varejo", { ascending: true })
    .limit(5);

  if (error || !data?.length) {
    return fallbackProducts;
  }

  return data as ProdutoVitrine[];
}
