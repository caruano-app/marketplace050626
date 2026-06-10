import { missingClientListResult, missingClientResult, resolveSupabaseClient, serviceError, type ModuleListResult, type ModuleServiceResult, type SupabaseModuleClient } from "@/lib/modules/shared";
import type { ProductReview, SubmitReviewInput } from "./types";

export async function getReviewsByProduct(produtoId: string, client?: SupabaseModuleClient): Promise<ModuleListResult<ProductReview>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientListResult<ProductReview>();

  const { data, error } = await supabase
    .from("avaliacoes_comentarios")
    .select("id,produto_id,usuario_id,lojista_id,nota,comentario,status,metadata,criado_em")
    .eq("produto_id", produtoId)
    .order("criado_em", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as ProductReview[], error: null };
}

export async function submitReview(input: SubmitReviewInput, client?: SupabaseModuleClient): Promise<ModuleServiceResult<ProductReview>> {
  const supabase = resolveSupabaseClient(client);
  if (!supabase) return missingClientResult<ProductReview>();

  if (!input.produto_id || !Number.isFinite(input.nota) || input.nota < 1 || input.nota > 5) {
    return { data: null, error: "Informe produto_id e nota entre 1 e 5." };
  }

  const { data, error } = await supabase
    .from("avaliacoes_comentarios")
    .insert({
      produto_id: input.produto_id,
      usuario_id: input.usuario_id || null,
      lojista_id: input.lojista_id || null,
      nota: input.nota,
      comentario: input.comentario || null,
      status: "pendente",
      metadata: input.metadata || {},
    })
    .select("id,produto_id,usuario_id,lojista_id,nota,comentario,status,metadata,criado_em")
    .single();

  if (error) {
    return { data: null, error: serviceError(error) };
  }

  return { data: data as ProductReview, error: null };
}
