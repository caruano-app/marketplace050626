import type { JsonRecord } from "@/lib/modules/shared";

export type PartialRefundStatus = "solicitado" | "aprovado" | "processado" | "negado";

export type PartialRefund = {
  id: string;
  transacao_id: string;
  sub_pedido_id: string | null;
  valor_estorno: number;
  motivo: string;
  status: PartialRefundStatus | string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type RegisterPartialRefundInput = {
  transacao_id: string;
  sub_pedido_id?: string | null;
  valor_estorno: number;
  motivo: string;
  metadata?: JsonRecord;
};
