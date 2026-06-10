import type { SupabaseClient } from "@supabase/supabase-js";

export type JsonRecord = Record<string, unknown>;

export type ModuleServiceResult<T> = {
  data: T | null;
  error: string | null;
};

export type ModuleListResult<T> = {
  data: T[];
  error: string | null;
};

export type SupabaseModuleClient = SupabaseClient;
