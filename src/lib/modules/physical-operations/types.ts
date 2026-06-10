import type { JsonRecord } from "@/lib/modules/shared";

export type DistributionCenter = {
  id: string;
  nome: string;
  cidade: string | null;
  status: string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type InternalStockShelf = {
  id: string;
  centro_distribuicao_id: string;
  produto_id: string | null;
  codigo_gondola: string;
  quantidade_atual: number;
  status: string | null;
  metadata: JsonRecord | null;
  atualizado_em: string | null;
};

export type GateEntry = {
  id: string;
  centro_distribuicao_id: string;
  tipo_evento: string;
  referencia_id: string | null;
  responsavel_id: string | null;
  observacoes: string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type StockMovement = {
  id: string;
  centro_distribuicao_id: string;
  produto_id: string | null;
  tipo_movimentacao: string;
  quantidade: number;
  origem: string | null;
  destino: string | null;
  referencia_id: string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type RegisterGateEntryInput = {
  centro_distribuicao_id: string;
  tipo_evento: string;
  referencia_id?: string | null;
  responsavel_id?: string | null;
  observacoes?: string | null;
  metadata?: JsonRecord;
};

export type RegisterStockMovementInput = {
  centro_distribuicao_id: string;
  produto_id?: string | null;
  tipo_movimentacao: string;
  quantidade: number;
  origem?: string | null;
  destino?: string | null;
  referencia_id?: string | null;
  metadata?: JsonRecord;
};
