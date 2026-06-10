import { missingClientListResult, missingClientResult, resolveSupabaseClient, serviceError, type ModuleListResult, type ModuleServiceResult, type SupabaseModuleClient } from "@/lib/modules/shared";
import type { DistributionCenter, GateEntry, InternalStockShelf, RegisterGateEntryInput, RegisterStockMovementInput, StockMovement } from "./types";

export const physicalOperationTables = {
  distributionCenters: "centros_distribuicao",
  internalStockShelves: "estoque_interno_gondolas",
  gateEntries: "portaria_cd",
  stockMovements: "movimentacoes_estoque",
} as const;

export async function listDistributionCenters(client?: SupabaseModuleClient): Promise<ModuleListResult<DistributionCenter>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientListResult<DistributionCenter>();

  const { data, error } = await supabase
    .from(physicalOperationTables.distributionCenters)
    .select("id,nome,cidade,status,metadata,criado_em")
    .order("nome", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as DistributionCenter[], error: null };
}

export async function getInternalStockByCenter(centroDistribuicaoId: string, client?: SupabaseModuleClient): Promise<ModuleListResult<InternalStockShelf>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientListResult<InternalStockShelf>();

  const { data, error } = await supabase
    .from(physicalOperationTables.internalStockShelves)
    .select("id,centro_distribuicao_id,produto_id,codigo_gondola,quantidade_atual,status,metadata,atualizado_em")
    .eq("centro_distribuicao_id", centroDistribuicaoId)
    .order("codigo_gondola", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as InternalStockShelf[], error: null };
}

export async function registerGateEntry(input: RegisterGateEntryInput, client?: SupabaseModuleClient): Promise<ModuleServiceResult<GateEntry>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientResult<GateEntry>();

  if (!input.centro_distribuicao_id || !input.tipo_evento) {
    return { data: null, error: "Informe centro_distribuicao_id e tipo_evento." };
  }

  const { data, error } = await supabase
    .from(physicalOperationTables.gateEntries)
    .insert({
      centro_distribuicao_id: input.centro_distribuicao_id,
      tipo_evento: input.tipo_evento,
      referencia_id: input.referencia_id || null,
      responsavel_id: input.responsavel_id || null,
      observacoes: input.observacoes || null,
      metadata: input.metadata || {},
    })
    .select("id,centro_distribuicao_id,tipo_evento,referencia_id,responsavel_id,observacoes,metadata,criado_em")
    .single();

  if (error) {
    return { data: null, error: serviceError(error) };
  }

  return { data: data as GateEntry, error: null };
}

export async function registerStockMovement(input: RegisterStockMovementInput, client?: SupabaseModuleClient): Promise<ModuleServiceResult<StockMovement>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientResult<StockMovement>();

  if (!input.centro_distribuicao_id || !input.tipo_movimentacao || !Number.isFinite(input.quantidade)) {
    return { data: null, error: "Informe centro_distribuicao_id, tipo_movimentacao e quantidade." };
  }

  const { data, error } = await supabase
    .from(physicalOperationTables.stockMovements)
    .insert({
      centro_distribuicao_id: input.centro_distribuicao_id,
      produto_id: input.produto_id || null,
      tipo_movimentacao: input.tipo_movimentacao,
      quantidade: input.quantidade,
      origem: input.origem || null,
      destino: input.destino || null,
      referencia_id: input.referencia_id || null,
      metadata: input.metadata || {},
    })
    .select("id,centro_distribuicao_id,produto_id,tipo_movimentacao,quantidade,origem,destino,referencia_id,metadata,criado_em")
    .single();

  if (error) {
    return { data: null, error: serviceError(error) };
  }

  return { data: data as StockMovement, error: null };
}
