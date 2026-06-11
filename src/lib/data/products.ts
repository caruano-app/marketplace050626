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

function onlyVerifiedProducts(products: ProdutoVitrine[]) {
  return products.filter((product) => {
    const store = Array.isArray(product.lojistas) ? product.lojistas[0] : product.lojistas;
    const user = Array.isArray(store?.usuarios) ? store?.usuarios[0] : store?.usuarios;
    return user?.status_verificacao_identidade === "aprovado";
  });
}

export async function getFeaturedProducts(): Promise<ProdutoVitrine[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackProducts;
  }

  const { data, error } = await supabase
    .from("produtos")
    .select(
      "id,lojista_id,codigo_referencia_sku,nome_produto,descricao_completa,preco_base_varejo,unidade_medida,especificacoes_tecnicas,vendido_e_entregue_por,permite_exportacao,imagens_url,lojistas(nome_fantasia,slug,usuarios(status_verificacao_identidade))",
    )
    .order("criado_em", { ascending: false })
    .limit(25);

  if (error || !data?.length) {
    return fallbackProducts;
  }

  const verifiedProducts = onlyVerifiedProducts(data as ProdutoVitrine[]).slice(0, 5);
  return verifiedProducts.length ? verifiedProducts : fallbackProducts;
}

export async function getDailyOfferProducts(): Promise<ProdutoVitrine[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return fallbackProducts;
  }

  const { data, error } = await supabase
    .from("produtos")
    .select(
      "id,lojista_id,codigo_referencia_sku,nome_produto,descricao_completa,preco_base_varejo,unidade_medida,especificacoes_tecnicas,vendido_e_entregue_por,permite_exportacao,imagens_url,lojistas(nome_fantasia,slug,usuarios(status_verificacao_identidade))",
    )
    .order("preco_base_varejo", { ascending: true })
    .limit(25);

  if (error || !data?.length) {
    return fallbackProducts;
  }

  const verifiedProducts = onlyVerifiedProducts(data as ProdutoVitrine[]).slice(0, 5);
  return verifiedProducts.length ? verifiedProducts : fallbackProducts;
}
