import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AtendimentoLead = {
  id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  origem: string | null;
  mensagem: string | null;
  status: string | null;
  lojista_id: string | null;
  metadata: Record<string, unknown> | null;
  criado_em: string | null;
  lojistas?: {
    nome_fantasia: string;
    slug: string;
  } | null;
};

export async function getAtendimentoLeads(): Promise<AtendimentoLead[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("leads_atendimento")
    .select("id,nome,whatsapp,email,origem,mensagem,status,lojista_id,metadata,criado_em,lojistas(nome_fantasia,slug)")
    .order("criado_em", { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  return data.map((lead) => ({
    ...lead,
    lojistas: Array.isArray(lead.lojistas) ? lead.lojistas[0] || null : lead.lojistas,
  })) as AtendimentoLead[];
}
