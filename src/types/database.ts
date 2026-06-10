export type CategoriaMestre = {
  id: number;
  nome_categoria: string;
  slug_categoria: string;
  tipo_nicho: string;
};

export type LojistaResumo = {
  nome_fantasia: string;
  slug: string;
  parceiro_premium?: boolean | null;
};

export type LojistaPerfil = {
  id: string;
  usuario_id: string;
  nome_fantasia: string;
  slug: string;
  segmento: string;
  modalidade_coleta: string;
  valor_parametro_coleta: number;
  forma_comissionamento: string;
  valor_comissao_plataforma: number;
  status_operacao: string | null;
  status_funcionamento: string | null;
  valor_minimo_pedido_atacado: number | null;
  criado_em: string;
};

export type CategoriaResumo = {
  nome_categoria: string;
  slug_categoria: string;
};

export type SubcategoriaResumo = {
  nome_subcategoria: string;
  slug_subcategoria: string;
  categorias_mestre: CategoriaResumo | CategoriaResumo[] | null;
};

export type ProdutoVitrine = {
  id: string;
  lojista_id?: string;
  subcategoria_id?: number;
  codigo_referencia_sku: string;
  nome_produto: string;
  descricao_completa: string | null;
  preco_base_varejo: number;
  unidade_medida?: string | null;
  especificacoes_tecnicas?: Record<string, unknown> | null;
  vendido_e_entregue_por?: string | null;
  permite_exportacao?: boolean | null;
  imagens_url: string[] | null;
  video_url?: string | null;
  peso_kg?: number;
  dimensoes_cm?: {
    L?: number;
    A?: number;
    C?: number;
    P?: number;
  } | null;
  lojistas: LojistaResumo | LojistaResumo[] | null;
  subcategorias_mestre?: SubcategoriaResumo | SubcategoriaResumo[] | null;
};

export type VariacaoProduto = {
  id: string;
  produto_id: string;
  nome_variacao: string;
  codigo_barras_ean: string;
  estoque_atual: number;
  criado_em: string;
};

export type StoryVideo = {
  id: string;
  lojista_id: string;
  produto_id: string | null;
  titulo: string | null;
  video_url: string;
  thumbnail_url: string | null;
  ativo: boolean;
  chamada_acao: string | null;
  visualizacoes: number | null;
  cliques: number | null;
  exibir_home: boolean;
  exibir_produto: boolean;
  exibir_categoria: boolean;
  criado_em: string;
};
