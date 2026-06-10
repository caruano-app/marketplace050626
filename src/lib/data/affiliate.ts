import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProdutoVitrine } from "@/types/database";

export type AffiliateProfile = {
  id: string;
  usuarioId: string;
  codigoAfiliado: string;
  nomeAfiliado: string;
  commissionPercent: number;
  status: string;
  isReal: boolean;
};

export type AffiliateStoreSummary = {
  id: string;
  nomeFantasia: string;
  slug: string;
};

export type AffiliateShowcase = {
  affiliate: AffiliateProfile;
  stores: AffiliateStoreSummary[];
  products: ProdutoVitrine[];
};

export type AffiliateCommission = {
  id: string;
  valorComissao: number;
  statusPagamento: string;
  dataPrevistaPagamento: string | null;
  criadoEm: string;
  transacaoId: string | null;
};

export type AffiliateDashboardData = {
  affiliate: AffiliateProfile;
  shareUrl: string;
  pendingBalance: number;
  salesCount: number;
  approvedStoresCount: number;
  commissions: AffiliateCommission[];
};

type JoinedUser = {
  nome_completo?: string | null;
};

type JoinedStore = {
  id?: string;
  nome_fantasia?: string | null;
  slug?: string | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function fallbackAffiliate(codigoAfiliado = "caruano"): AffiliateProfile {
  return {
    id: "fallback-afiliado",
    usuarioId: "fallback-usuario",
    codigoAfiliado,
    nomeAfiliado: "Afiliado Caruano",
    commissionPercent: 5,
    status: "demonstrativo",
    isReal: false,
  };
}

function fallbackProducts(): ProdutoVitrine[] {
  return Array.from({ length: 5 }, (_, index) => ({
    id: `fallback-afiliado-produto-${index + 1}`,
    codigo_referencia_sku: `AF-CARUANO-${index + 1}`,
    nome_produto: "Nome do produto",
    descricao_completa: "Produto autorizado para revenda na vitrine do afiliado Caruano.",
    preco_base_varejo: 69.9,
    imagens_url: [],
    lojistas: {
      nome_fantasia: "Loja Caruano",
      slug: "loja-caruano",
    },
  }));
}

function normalizeAffiliate(row: Record<string, unknown>, isReal: boolean): AffiliateProfile {
  const user = first(row.usuarios as JoinedUser | JoinedUser[] | null);

  return {
    id: String(row.id),
    usuarioId: String(row.usuario_id),
    codigoAfiliado: String(row.codigo_afiliado),
    nomeAfiliado: user?.nome_completo || String(row.codigo_afiliado),
    commissionPercent: Number(row.comissao_padrao_percentual || 5),
    status: String(row.status_aprovacao || "pendente_analise"),
    isReal,
  };
}

export async function getAffiliateShowcase(codigoAfiliado: string): Promise<AffiliateShowcase> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      affiliate: fallbackAffiliate(codigoAfiliado),
      stores: [],
      products: fallbackProducts(),
    };
  }

  const { data: affiliateData, error: affiliateError } = await supabase
    .from("afiliados")
    .select("id,usuario_id,codigo_afiliado,status_aprovacao,comissao_padrao_percentual,usuarios(nome_completo)")
    .eq("codigo_afiliado", codigoAfiliado)
    .maybeSingle();

  if (affiliateError || !affiliateData || affiliateData.status_aprovacao !== "aprovado") {
    return {
      affiliate: fallbackAffiliate(codigoAfiliado),
      stores: [],
      products: fallbackProducts(),
    };
  }

  const affiliate = normalizeAffiliate(affiliateData as Record<string, unknown>, true);

  const { data: storeLinks } = await supabase
    .from("afiliados_lojas_aprovados")
    .select("lojista_id,lojistas(id,nome_fantasia,slug)")
    .eq("afiliado_id", affiliate.id);

  const stores = (storeLinks || [])
    .map((link) => first((link as Record<string, unknown>).lojistas as JoinedStore | JoinedStore[] | null))
    .filter((store): store is JoinedStore => Boolean(store?.id))
    .map((store) => ({
      id: String(store.id),
      nomeFantasia: store.nome_fantasia || "Loja Caruano",
      slug: store.slug || "loja-caruano",
    }));

  const storeIds = stores.map((store) => store.id);

  if (!storeIds.length) {
    return {
      affiliate,
      stores,
      products: fallbackProducts(),
    };
  }

  const { data: products, error: productsError } = await supabase
    .from("produtos")
    .select("id,lojista_id,codigo_referencia_sku,nome_produto,descricao_completa,preco_base_varejo,imagens_url,lojistas(nome_fantasia,slug)")
    .in("lojista_id", storeIds)
    .order("criado_em", { ascending: false })
    .limit(20);

  return {
    affiliate,
    stores,
    products: productsError || !products?.length ? fallbackProducts() : (products as ProdutoVitrine[]),
  };
}

export async function getAffiliateDashboardData(): Promise<AffiliateDashboardData> {
  const supabase = createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://caruano.com";

  if (!supabase) {
    const affiliate = fallbackAffiliate("meu-codigo");
    return {
      affiliate,
      shareUrl: `${siteUrl}/vitrine/${affiliate.codigoAfiliado}`,
      pendingBalance: 0,
      salesCount: 0,
      approvedStoresCount: 0,
      commissions: [],
    };
  }

  const { data: affiliateData } = await supabase
    .from("afiliados")
    .select("id,usuario_id,codigo_afiliado,status_aprovacao,comissao_padrao_percentual,usuarios(nome_completo)")
    .eq("status_aprovacao", "aprovado")
    .limit(1)
    .maybeSingle();

  const affiliate = affiliateData
    ? normalizeAffiliate(affiliateData as Record<string, unknown>, true)
    : fallbackAffiliate("meu-codigo");

  const { data: storeLinks } = affiliate.isReal
    ? await supabase.from("afiliados_lojas_aprovados").select("id").eq("afiliado_id", affiliate.id)
    : { data: [] };

  const { data: commissionsData } = affiliate.isReal
    ? await supabase
        .from("comissoes_afiliados")
        .select("id,transacao_id,valor_comissao,status_pagamento,data_prevista_pagamento,criado_em")
        .eq("afiliado_id", affiliate.id)
        .order("criado_em", { ascending: false })
        .limit(12)
    : { data: [] };

  const commissions = (commissionsData || []).map((commission) => ({
    id: String(commission.id),
    transacaoId: commission.transacao_id ? String(commission.transacao_id) : null,
    valorComissao: Number(commission.valor_comissao || 0),
    statusPagamento: String(commission.status_pagamento || "pendente_liberacao"),
    dataPrevistaPagamento: commission.data_prevista_pagamento ? String(commission.data_prevista_pagamento) : null,
    criadoEm: String(commission.criado_em),
  }));

  return {
    affiliate,
    shareUrl: `${siteUrl}/vitrine/${affiliate.codigoAfiliado}`,
    pendingBalance: commissions
      .filter((commission) => commission.statusPagamento === "pendente_liberacao")
      .reduce((sum, commission) => sum + commission.valorComissao, 0),
    salesCount: commissions.length,
    approvedStoresCount: storeLinks?.length || 0,
    commissions,
  };
}
