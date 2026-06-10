import { missingClientListResult, missingClientResult, resolveSupabaseClient, serviceError, type ModuleListResult, type ModuleServiceResult, type SupabaseModuleClient } from "@/lib/modules/shared";
import type { ChatMessage, ChatRoom, CreateChatRoomInput, SendChatMessageInput } from "./types";

export async function createChatRoom(input: CreateChatRoomInput, client?: SupabaseModuleClient): Promise<ModuleServiceResult<ChatRoom>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientResult<ChatRoom>();

  if (!input.participantes.length) {
    return { data: null, error: "Informe ao menos um participante." };
  }

  const { data: room, error: roomError } = await supabase
    .from("salas_chat_master")
    .insert({
      assunto: input.assunto || null,
      contexto_tipo: input.contexto_tipo || null,
      contexto_id: input.contexto_id || null,
      status: "aberta",
      metadata: input.metadata || {},
    })
    .select("id,assunto,status,contexto_tipo,contexto_id,metadata,criado_em")
    .single();

  if (roomError || !room) {
    return { data: null, error: serviceError(roomError) };
  }

  const { error: participantError } = await supabase
    .from("participantes_sala_chat")
    .insert(input.participantes.map((participant) => ({
      sala_id: room.id,
      usuario_id: participant.usuario_id,
      papel: participant.papel || null,
    })));

  if (participantError) {
    return { data: room as ChatRoom, error: `Sala criada, mas participantes nao foram vinculados: ${participantError.message}` };
  }

  return { data: room as ChatRoom, error: null };
}

export async function listChatMessages(salaId: string, client?: SupabaseModuleClient): Promise<ModuleListResult<ChatMessage>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientListResult<ChatMessage>();

  const { data, error } = await supabase
    .from("mensagens_chat_master")
    .select("id,sala_id,usuario_id,tipo,mensagem,midia_url,metadata,criado_em")
    .eq("sala_id", salaId)
    .order("criado_em", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as ChatMessage[], error: null };
}

export async function sendChatMessage(input: SendChatMessageInput, client?: SupabaseModuleClient): Promise<ModuleServiceResult<ChatMessage>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientResult<ChatMessage>();

  if (!input.sala_id || !input.usuario_id || (!input.mensagem && !input.midia_url)) {
    return { data: null, error: "Informe sala_id, usuario_id e texto ou midia." };
  }

  const { data, error } = await supabase
    .from("mensagens_chat_master")
    .insert({
      sala_id: input.sala_id,
      usuario_id: input.usuario_id,
      tipo: input.tipo || (input.midia_url ? "midia" : "texto"),
      mensagem: input.mensagem || null,
      midia_url: input.midia_url || null,
      metadata: input.metadata || {},
    })
    .select("id,sala_id,usuario_id,tipo,mensagem,midia_url,metadata,criado_em")
    .single();

  if (error) {
    return { data: null, error: serviceError(error) };
  }

  return { data: data as ChatMessage, error: null };
}
