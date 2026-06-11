import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DriverProfile = {
  id: string;
  usuario_id: string;
  status_verificacao_identidade: string;
  nome: string;
};

export type DriverRoute = {
  id: string;
  cidade_origem: string;
  cidade_destino: string;
  dias_semana: string[] | null;
  valor_base_entrega: number | null;
};

export type AvailableFreight = {
  id: string;
  lojistaId: string;
  storeName: string;
  storeWhatsapp: string | null;
  storeCity: string | null;
  vehicleRequired: string;
  deliveryType: string | null;
  price: number;
  status: string | null;
  notes: string | null;
  createdAt: string | null;
};

export type DriverDashboardData = {
  profile: DriverProfile | null;
  routes: DriverRoute[];
  availableFreights: AvailableFreight[];
  metrics: {
    receivable: number;
    completed: number;
  };
};

type StoreJoin = {
  nome_fantasia?: string | null;
  usuarios?: { telefone?: string | null; cidade_base?: string | null } | Array<{ telefone?: string | null; cidade_base?: string | null }> | null;
};

type FreightRow = {
  id: string;
  lojista_id: string;
  veiculo_minimo_requerido?: string | null;
  preco_frete?: number | null;
  status_corrida?: string | null;
  tipo_entrega?: string | null;
  observacoes_coleta?: string | null;
  criado_em?: string | null;
  lojistas?: StoreJoin | StoreJoin[] | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
}

function freightFromRow(row: FreightRow): AvailableFreight {
  const store = first(row.lojistas);
  const storeUser = first(store?.usuarios);

  return {
    id: row.id,
    lojistaId: row.lojista_id,
    storeName: store?.nome_fantasia || "Loja Caruano",
    storeWhatsapp: storeUser?.telefone || null,
    storeCity: storeUser?.cidade_base || null,
    vehicleRequired: row.veiculo_minimo_requerido || "moto",
    deliveryType: row.tipo_entrega || "delivery_local",
    price: Number(row.preco_frete || 0),
    status: row.status_corrida || null,
    notes: row.observacoes_coleta || null,
    createdAt: row.criado_em || null,
  };
}

export async function getDriverDashboard(userId: string): Promise<DriverDashboardData> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { profile: null, routes: [], availableFreights: [], metrics: { receivable: 0, completed: 0 } };
  }

  const { data: driver } = await supabase
    .from("entregadores")
    .select("id,usuario_id,usuarios(nome_completo,status_verificacao_identidade)")
    .eq("usuario_id", userId)
    .maybeSingle();

  if (!driver) {
    return { profile: null, routes: [], availableFreights: [], metrics: { receivable: 0, completed: 0 } };
  }

  const user = first(driver.usuarios);
  const profile = {
    id: String(driver.id),
    usuario_id: String(driver.usuario_id),
    status_verificacao_identidade: user?.status_verificacao_identidade || "nao_enviado",
    nome: user?.nome_completo || "Entregador Caruano",
  };

  const [routesResult, availableResult, completedResult] = await Promise.all([
    supabase
      .from("rotas_entregadores")
      .select("id,cidade_origem,cidade_destino,dias_semana,valor_base_entrega")
      .eq("entregador_id", profile.id)
      .order("criado_em", { ascending: false })
      .limit(20),
    supabase
      .from("solicitacoes_frete")
      .select("id,lojista_id,veiculo_minimo_requerido,preco_frete,status_corrida,tipo_entrega,observacoes_coleta,criado_em,lojistas(nome_fantasia,usuarios(telefone,cidade_base))")
      .is("entregador_id", null)
      .eq("status_corrida", "aguardando_motorista")
      .order("criado_em", { ascending: false })
      .limit(30),
    supabase
      .from("solicitacoes_frete")
      .select("id,preco_frete,status_corrida")
      .eq("entregador_id", profile.id)
      .limit(100),
  ]);

  const completedRows = completedResult.data || [];
  const completed = completedRows.filter((item) => item.status_corrida === "entregue" || item.status_corrida === "finalizado");

  return {
    profile,
    routes: (routesResult.data || []) as DriverRoute[],
    availableFreights: availableResult.error || !availableResult.data ? [] : (availableResult.data as unknown as FreightRow[]).map(freightFromRow),
    metrics: {
      receivable: completedRows.reduce((sum, item) => sum + Number(item.preco_frete || 0), 0),
      completed: completed.length,
    },
  };
}
