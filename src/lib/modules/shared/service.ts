import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ModuleListResult, ModuleServiceResult, SupabaseModuleClient } from "@/lib/modules/shared/types";

export function resolveSupabaseClient(client?: SupabaseModuleClient) {
  return client || createSupabaseServerClient();
}

export function missingClientResult<T>(): ModuleServiceResult<T> {
  return {
    data: null,
    error: "Supabase nao configurado.",
  };
}

export function missingClientListResult<T>(): ModuleListResult<T> {
  return {
    data: [],
    error: "Supabase nao configurado.",
  };
}

export function serviceError(error: unknown) {
  if (!error) return "Erro desconhecido.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message);
  return "Erro desconhecido.";
}
