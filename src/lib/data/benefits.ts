import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BenefitOffer = {
  id: string;
  titulo: string;
  categoria: string | null;
  parceiro_id: string | null;
  desconto_percentual: number | null;
  descricao_beneficio: string | null;
  link_adesao: string | null;
  ativo: boolean | null;
  lojistas?: {
    nome_fantasia: string | null;
    slug: string | null;
  } | null;
};

function normalizeBenefit(benefit: BenefitOffer): BenefitOffer {
  return {
    ...benefit,
    lojistas: Array.isArray(benefit.lojistas) ? benefit.lojistas[0] || null : benefit.lojistas,
  };
}

export async function getActiveBenefits(): Promise<BenefitOffer[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("clube_beneficios")
    .select("id,titulo,categoria,parceiro_id,desconto_percentual,descricao_beneficio,link_adesao,ativo,lojistas(nome_fantasia,slug)")
    .eq("ativo", true)
    .order("categoria", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as BenefitOffer[]).map(normalizeBenefit);
}

export async function getAdminBenefits(limit = 20): Promise<BenefitOffer[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("clube_beneficios")
    .select("id,titulo,categoria,parceiro_id,desconto_percentual,descricao_beneficio,link_adesao,ativo,lojistas(nome_fantasia,slug)")
    .order("categoria", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as BenefitOffer[]).map(normalizeBenefit);
}
