import { missingClientResult, resolveSupabaseClient, serviceError, type ModuleServiceResult, type SupabaseModuleClient } from "@/lib/modules/shared";
import type { PartialRefund, RegisterPartialRefundInput } from "./types";

export async function registerPartialRefund(input: RegisterPartialRefundInput, client?: SupabaseModuleClient): Promise<ModuleServiceResult<PartialRefund>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientResult<PartialRefund>();

  if (!input.transacao_id || !Number.isFinite(input.valor_estorno) || input.valor_estorno <= 0 || !input.motivo.trim()) {
    return { data: null, error: "Informe transacao_id, valor_estorno positivo e motivo." };
  }

  const { data, error } = await supabase
    .from("estornos_parciais")
    .insert({
      transacao_id: input.transacao_id,
      sub_pedido_id: input.sub_pedido_id || null,
      valor_estorno: input.valor_estorno,
      motivo: input.motivo.trim(),
      status: "solicitado",
      metadata: input.metadata || {},
    })
    .select("id,transacao_id,sub_pedido_id,valor_estorno,motivo,status,metadata,criado_em")
    .single();

  if (error) {
    return { data: null, error: serviceError(error) };
  }

  return { data: data as PartialRefund, error: null };
}
