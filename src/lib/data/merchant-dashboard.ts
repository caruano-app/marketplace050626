import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getManagedStockByStore, type ManagedStockItem } from "@/lib/data/managed-stock";

export type MerchantLeadMetric = {
  total: number;
  newLeads: number;
};

export type PendingQuote = {
  id: string;
  valor_proposto: number;
  valor_comissao_caruano: number;
  observacoes: string | null;
  criado_em: string | null;
};

export type MerchantProductItem = {
  id: string;
  nome_produto: string;
  preco_base_varejo: number;
  imagens_url: string[] | null;
  status_moderacao: string | null;
};

export type MerchantStoreQr = {
  nome_fantasia: string;
  slug: string;
};

export type MerchantReviewItem = {
  id: string;
  nota: number;
  comentario: string | null;
  criado_em: string | null;
  productName: string;
  customerName: string;
};

export type MerchantReviewSummary = {
  averageRating: number;
  totalReviews: number;
  latest: MerchantReviewItem[];
};

export async function getMerchantManagedStock(): Promise<ManagedStockItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data: store } = await supabase
    .from("lojistas")
    .select("id")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!store?.id) {
    return [];
  }

  return getManagedStockByStore(store.id, 10);
}

export async function getMerchantLeadMetric(): Promise<MerchantLeadMetric> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { total: 0, newLeads: 0 };
  }

  const [{ count: total }, { count: newLeads }] = await Promise.all([
    supabase.from("leads_atendimento").select("id", { count: "exact", head: true }),
    supabase.from("leads_atendimento").select("id", { count: "exact", head: true }).eq("status", "novo"),
  ]);

  return {
    total: total || 0,
    newLeads: newLeads || 0,
  };
}

export async function getPendingQuotes(): Promise<PendingQuote[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("respostas_cotacao")
    .select("id,valor_proposto,valor_comissao_caruano,observacoes,criado_em")
    .eq("aceita_pelo_cliente", false)
    .order("criado_em", { ascending: false })
    .limit(10);

  if (error || !data) {
    return [];
  }

  return data as PendingQuote[];
}

export async function getMerchantProducts(): Promise<MerchantProductItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("produtos")
    .select("id,nome_produto,preco_base_varejo,imagens_url,status_moderacao")
    .order("criado_em", { ascending: false })
    .limit(12);

  if (error || !data) {
    return [];
  }

  return data as MerchantProductItem[];
}

export async function getMerchantStoreQr(): Promise<MerchantStoreQr> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      nome_fantasia: "Loja Caruano",
      slug: "loja-caruano",
    };
  }

  const { data, error } = await supabase
    .from("lojistas")
    .select("nome_fantasia,slug")
    .order("criado_em", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return {
      nome_fantasia: "Loja Caruano",
      slug: "loja-caruano",
    };
  }

  return data as MerchantStoreQr;
}

export async function getMerchantReviewSummary(): Promise<MerchantReviewSummary> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { averageRating: 0, totalReviews: 0, latest: [] };
  }

  const { data: store } = await supabase
    .from("lojistas")
    .select("id")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!store?.id) {
    return { averageRating: 0, totalReviews: 0, latest: [] };
  }

  const { data, error } = await supabase
    .from("avaliacoes_comentarios")
    .select("id,nota,comentario,criado_em,produtos(nome_produto),usuarios(nome_completo)")
    .eq("lojista_id", store.id)
    .eq("status", "aprovado")
    .order("criado_em", { ascending: false })
    .limit(30);

  if (error || !data) {
    return { averageRating: 0, totalReviews: 0, latest: [] };
  }

  const reviews = data.map((review) => {
    const product = Array.isArray(review.produtos) ? review.produtos[0] || null : review.produtos;
    const user = Array.isArray(review.usuarios) ? review.usuarios[0] || null : review.usuarios;

    return {
      id: String(review.id),
      nota: Number(review.nota || 0),
      comentario: review.comentario || null,
      criado_em: review.criado_em || null,
      productName: product?.nome_produto || "Produto Caruano",
      customerName: user?.nome_completo || "Cliente Caruano",
    };
  });

  return {
    averageRating: reviews.length ? reviews.reduce((sum, review) => sum + review.nota, 0) / reviews.length : 0,
    totalReviews: reviews.length,
    latest: reviews.slice(0, 3),
  };
}
