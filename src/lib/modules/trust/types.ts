import type { JsonRecord } from "@/lib/modules/shared";

export type ReviewStatus = "pendente" | "aprovado" | "rejeitado";

export type ProductReview = {
  id: string;
  produto_id: string;
  usuario_id: string | null;
  lojista_id: string | null;
  nota: number;
  comentario: string | null;
  status: ReviewStatus | string | null;
  metadata: JsonRecord | null;
  criado_em: string | null;
};

export type SubmitReviewInput = {
  produto_id: string;
  usuario_id?: string | null;
  lojista_id?: string | null;
  nota: number;
  comentario?: string | null;
  metadata?: JsonRecord;
};
