import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProdutoVitrine, VariacaoProduto } from "@/types/database";

const fallbackProduct: ProdutoVitrine = {
  id: "fallback-1",
  lojista_id: "fallback-lojista",
  subcategoria_id: 1,
  codigo_referencia_sku: "PR-241276",
  nome_produto: "Nome do produto do produto nome do produto do produto",
  descricao_completa:
    "Breve descricao do produto descricao do produto. Descricao completa para validar o layout da pagina de detalhes do produto Caruano.",
  preco_base_varejo: 59.9,
  imagens_url: [],
  peso_kg: 0.3,
  dimensoes_cm: {
    L: 30,
    A: 2,
    C: 40,
  },
  lojistas: {
    nome_fantasia: "Howem",
    slug: "howem",
  },
  subcategorias_mestre: {
    nome_subcategoria: "Short Masculino",
    slug_subcategoria: "short-masculino",
    categorias_mestre: {
      nome_categoria: "Moda Masculina",
      slug_categoria: "moda-masculina",
    },
  },
};

const fallbackVariations: VariacaoProduto[] = ["PP", "P", "M", "G", "GG", "XG"].map((size, index) => ({
  id: `fallback-variation-${size}`,
  produto_id: fallbackProduct.id,
  nome_variacao: `Tamanho ${size}`,
  codigo_barras_ean: `78900000000${index}`,
  estoque_atual: 10,
  criado_em: new Date(0).toISOString(),
}));

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function getProductDetail(slug: string): Promise<{
  product: ProdutoVitrine;
  variations: VariacaoProduto[];
}> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      product: fallbackProduct,
      variations: fallbackVariations,
    };
  }

  const query = supabase
    .from("produtos")
    .select(
      "id,lojista_id,subcategoria_id,codigo_referencia_sku,nome_produto,descricao_completa,preco_base_varejo,imagens_url,peso_kg,dimensoes_cm,lojistas(nome_fantasia,slug),subcategorias_mestre(nome_subcategoria,slug_subcategoria,categorias_mestre(nome_categoria,slug_categoria))",
    )
    .limit(1);

  const { data: product, error } = await (isUuid(slug)
    ? query.eq("id", slug).single()
    : query.eq("codigo_referencia_sku", slug).single());

  if (error || !product) {
    return {
      product: fallbackProduct,
      variations: fallbackVariations,
    };
  }

  const { data: variations, error: variationsError } = await supabase
    .from("variacoes_produto")
    .select("id,produto_id,nome_variacao,codigo_barras_ean,estoque_atual,criado_em")
    .eq("produto_id", product.id)
    .order("criado_em", { ascending: true });

  return {
    product: product as ProdutoVitrine,
    variations: variationsError || !variations?.length ? fallbackVariations : (variations as VariacaoProduto[]),
  };
}
