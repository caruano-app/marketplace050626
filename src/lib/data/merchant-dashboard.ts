import { createSupabaseServerClient } from "@/lib/supabase/server";

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
