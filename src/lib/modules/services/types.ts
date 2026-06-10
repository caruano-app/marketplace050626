import type { JsonRecord } from "@/lib/modules/shared";

export type ServiceCallStatus = "aberto" | "em_negociacao" | "contratado" | "cancelado" | "concluido";
export type ServiceProposalStatus = "enviada" | "aceita" | "recusada" | "cancelada";

export type ServiceCall = {
  id: string;
  usuario_id: string;
  categoria_id: number | null;
  titulo: string;
  descricao: string;
  cidade: string | null;
  status: ServiceCallStatus | string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type ServiceProposal = {
  id: string;
  chamado_id: string;
  prestador_id: string;
  valor_proposta: number | null;
  prazo_execucao: string | null;
  observacoes: string | null;
  status: ServiceProposalStatus | string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type PostServiceCallInput = {
  usuario_id: string;
  categoria_id?: number | null;
  titulo: string;
  descricao: string;
  cidade?: string | null;
  metadata?: JsonRecord;
};

export type SubmitServiceProposalInput = {
  chamado_id: string;
  prestador_id: string;
  valor_proposta?: number | null;
  prazo_execucao?: string | null;
  observacoes?: string | null;
  metadata?: JsonRecord;
};
