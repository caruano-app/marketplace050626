import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LojistaPerfil, ProdutoVitrine } from "@/types/database";

const fallbackStore: LojistaPerfil = {
  id: "fallback-store",
  usuario_id: "fallback-user",
  nome_fantasia: "Nome da loja",
  slug: "nome-da-loja",
  segmento: "moda",
  modalidade_coleta: "por_fardo",
  valor_parametro_coleta: 5,
  forma_comissionamento: "porcentagem",
  valor_comissao_plataforma: 10,
  status_operacao: "aprovado_ativo",
  status_funcionamento: "aberto",
  is_partner: false,
  partner_level: "standard",
  usuarios: {
    status_verificacao_identidade: "aprovado",
  },
  valor_minimo_pedido_atacado: 0,
  criado_em: new Date(0).toISOString(),
};

const fallbackStoreProducts: ProdutoVitrine[] = Array.from({ length: 5 }, (_, index) => ({
  id: `fallback-store-product-${index + 1}`,
  lojista_id: fallbackStore.id,
  codigo_referencia_sku: `LOJA-SKU-${index + 1}`,
  nome_produto: "Nome do produto",
  descricao_completa: "Breve descricao do produto descricao do produto descricao do produto.",
  preco_base_varejo: 69.9,
  imagens_url: [],
  lojistas: {
    nome_fantasia: fallbackStore.nome_fantasia,
    slug: fallbackStore.slug,
    is_partner: false,
    partner_level: "standard",
  },
}));

export async function getStoreProfile(slug: string): Promise<{
  store: LojistaPerfil;
  products: ProdutoVitrine[];
}> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      store: fallbackStore,
      products: fallbackStoreProducts,
    };
  }

  const { data: store, error } = await supabase
    .from("lojistas")
    .select(
      "id,usuario_id,nome_fantasia,slug,segmento,modalidade_coleta,valor_parametro_coleta,forma_comissionamento,valor_comissao_plataforma,status_operacao,status_funcionamento,is_partner,partner_level,valor_minimo_pedido_atacado,criado_em,usuarios(status_verificacao_identidade)",
    )
    .eq("slug", slug)
    .single();

  if (error || !store) {
    return {
      store: fallbackStore,
      products: fallbackStoreProducts,
    };
  }

  const normalizedStore = {
    ...store,
    usuarios: Array.isArray(store.usuarios) ? store.usuarios[0] || null : store.usuarios,
  } as LojistaPerfil;

  const normalizedStoreUser = Array.isArray(normalizedStore.usuarios) ? normalizedStore.usuarios[0] : normalizedStore.usuarios;

  if (normalizedStoreUser?.status_verificacao_identidade !== "aprovado") {
    return {
      store: normalizedStore,
      products: [],
    };
  }

  const { data: products, error: productsError } = await supabase
    .from("produtos")
    .select(
      "id,lojista_id,subcategoria_id,codigo_referencia_sku,nome_produto,descricao_completa,preco_base_varejo,unidade_medida,especificacoes_tecnicas,vendido_e_entregue_por,permite_exportacao,imagens_url,lojistas(id,nome_fantasia,slug,is_partner,partner_level,usuarios(status_verificacao_identidade))",
    )
    .eq("lojista_id", store.id)
    .order("criado_em", { ascending: false })
    .limit(10);

  return {
    store: normalizedStore,
    products: productsError || !products?.length ? fallbackStoreProducts : (products as ProdutoVitrine[]),
  };
}
