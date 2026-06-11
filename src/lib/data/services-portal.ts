import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ServiceProviderCard = {
  id: string;
  category: string;
  description: string;
  city: string;
  isPro: boolean;
};

export type JobListingCard = {
  id: string;
  title: string;
  storeName: string;
  city: string;
  contractType: string;
  description: string;
};

const fallbackProviders: ServiceProviderCard[] = [
  {
    id: "mecanico-maquina-costura",
    category: "Mecanico de maquinas",
    description: "Conserto preventivo e emergencial para reta, overlock, galoneira e maquinas industriais.",
    city: "Caruaru",
    isPro: true,
  },
  {
    id: "costureira-freela",
    category: "Costureira freela",
    description: "Diaristas e faccionistas para reforco de producao em moda feminina, jeans e infantil.",
    city: "Toritama",
    isPro: false,
  },
  {
    id: "grafica-etiquetas",
    category: "Grafica e etiquetas",
    description: "Tags, etiquetas, sacolas personalizadas e materiais para lojas do Polo.",
    city: "Santa Cruz",
    isPro: true,
  },
  {
    id: "freteiro-carga",
    category: "Freteiro e carga",
    description: "Coleta em lojas, entrega em excursao, vans, toyotas e fretes intermunicipais.",
    city: "Caruaru",
    isPro: false,
  },
];

const fallbackJobs: JobListingCard[] = [
  {
    id: "vaga-costureira-overlock",
    title: "Costureira overlock",
    storeName: "Loja parceira Caruano",
    city: "Caruaru",
    contractType: "Freela",
    description: "Servico por producao para acabamento de moda feminina. Inicio imediato.",
  },
  {
    id: "vaga-atendente-feira",
    title: "Atendente de feira",
    storeName: "Box do Polo",
    city: "Santa Cruz",
    contractType: "Diaria",
    description: "Atendimento, separacao de pedidos e apoio em WhatsApp durante feira.",
  },
  {
    id: "vaga-cortador-jeans",
    title: "Cortador de jeans",
    storeName: "Confeccao parceira",
    city: "Toritama",
    contractType: "CLT",
    description: "Corte de jeans e organizacao de grade. Experiencia em producao sera diferencial.",
  },
];

function cityLabel(value: string | null | undefined) {
  if (value === "toritama") return "Toritama";
  if (value === "santa_cruz_do_capibaribe") return "Santa Cruz";
  return "Caruaru";
}

export async function getServiceProviders(): Promise<ServiceProviderCard[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) return fallbackProviders;

  const { data, error } = await supabase
    .from("prestadores_servico")
    .select("id,categoria_servico,descricao_portfolio")
    .limit(12);

  if (error || !data?.length) return fallbackProviders;

  return data.map((provider) => ({
    id: String(provider.id),
    category: provider.categoria_servico || "Servico do Polo",
    description: provider.descricao_portfolio || "Prestador cadastrado para atender lojistas e compradores do Caruano.",
    city: "Caruaru",
    isPro: false,
  }));
}

export async function getJobListings(): Promise<JobListingCard[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) return fallbackJobs;

  const { data, error } = await supabase
    .from("central_demandas")
    .select("id,titulo_demanda,descricao_detalhada,cidade,detalhes_tecnicos,usuarios(nome_completo)")
    .eq("tipo_demanda", "vaga_emprego")
    .order("criado_em", { ascending: false })
    .limit(20);

  if (error || !data?.length) return fallbackJobs;

  return data.map((job) => {
    const metadata = (job.detalhes_tecnicos || {}) as Record<string, unknown>;
    const user = Array.isArray(job.usuarios) ? job.usuarios[0] : job.usuarios;

    return {
      id: String(job.id),
      title: job.titulo_demanda || "Vaga no Polo",
      storeName: typeof metadata.lojista === "string" ? metadata.lojista : user?.nome_completo || "Lojista Caruano",
      city: cityLabel(job.cidade),
      contractType: typeof metadata.tipo_contrato === "string" ? metadata.tipo_contrato : "A combinar",
      description: job.descricao_detalhada || "Vaga publicada por lojista parceiro do Caruano.",
    };
  });
}
