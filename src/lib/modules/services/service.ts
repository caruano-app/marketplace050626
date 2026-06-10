import { missingClientResult, resolveSupabaseClient, serviceError, type ModuleServiceResult, type SupabaseModuleClient } from "@/lib/modules/shared";
import type { PostServiceCallInput, ServiceCall, ServiceProposal, SubmitServiceProposalInput } from "./types";

export async function postServiceCall(input: PostServiceCallInput, client?: SupabaseModuleClient): Promise<ModuleServiceResult<ServiceCall>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientResult<ServiceCall>();

  if (!input.usuario_id || !input.titulo.trim() || !input.descricao.trim()) {
    return { data: null, error: "Informe usuario_id, titulo e descricao." };
  }

  const { data, error } = await supabase
    .from("chamados_servico")
    .insert({
      usuario_id: input.usuario_id,
      categoria_id: input.categoria_id || null,
      titulo: input.titulo.trim(),
      descricao: input.descricao.trim(),
      cidade: input.cidade || null,
      status: "aberto",
      metadata: input.metadata || {},
    })
    .select("id,usuario_id,categoria_id,titulo,descricao,cidade,status,metadata,criado_em")
    .single();

  if (error) {
    return { data: null, error: serviceError(error) };
  }

  return { data: data as ServiceCall, error: null };
}

export async function submitServiceProposal(input: SubmitServiceProposalInput, client?: SupabaseModuleClient): Promise<ModuleServiceResult<ServiceProposal>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientResult<ServiceProposal>();

  if (!input.chamado_id || !input.prestador_id) {
    return { data: null, error: "Informe chamado_id e prestador_id." };
  }

  const { data, error } = await supabase
    .from("propostas_servico")
    .insert({
      chamado_id: input.chamado_id,
      prestador_id: input.prestador_id,
      valor_proposta: input.valor_proposta || null,
      prazo_execucao: input.prazo_execucao || null,
      observacoes: input.observacoes || null,
      status: "enviada",
      metadata: input.metadata || {},
    })
    .select("id,chamado_id,prestador_id,valor_proposta,prazo_execucao,observacoes,status,metadata,criado_em")
    .single();

  if (error) {
    return { data: null, error: serviceError(error) };
  }

  return { data: data as ServiceProposal, error: null };
}
