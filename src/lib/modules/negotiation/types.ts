import type { JsonRecord } from "@/lib/modules/shared";

export type ChatRoomStatus = "aberta" | "arquivada" | "bloqueada";
export type ChatMessageKind = "texto" | "midia";

export type ChatRoom = {
  id: string;
  assunto: string | null;
  status: ChatRoomStatus | string | null;
  contexto_tipo: string | null;
  contexto_id: string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type ChatParticipant = {
  id: string;
  sala_id: string;
  usuario_id: string;
  papel: string | null;
  criado_em: string | null;
};

export type ChatMessage = {
  id: string;
  sala_id: string;
  usuario_id: string;
  tipo: ChatMessageKind | string | null;
  mensagem: string | null;
  midia_url: string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type CreateChatRoomInput = {
  assunto?: string | null;
  contexto_tipo?: string | null;
  contexto_id?: string | null;
  participantes: Array<{
    usuario_id: string;
    papel?: string | null;
  }>;
  metadata?: JsonRecord;
};

export type SendChatMessageInput = {
  sala_id: string;
  usuario_id: string;
  mensagem?: string | null;
  midia_url?: string | null;
  tipo?: ChatMessageKind;
  metadata?: JsonRecord;
};
