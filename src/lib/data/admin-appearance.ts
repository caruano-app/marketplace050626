import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAppearanceConfig = {
  primaryColor: string;
  source: "database" | "fallback";
  message?: string;
};

const fallbackAppearance: AdminAppearanceConfig = {
  primaryColor: "#FFC300",
  source: "fallback",
};

type ConfigRow = Record<string, unknown>;

function normalizeColor(value: unknown) {
  if (typeof value !== "string") return null;
  const color = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toUpperCase() : null;
}

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function pickRow(rows: ConfigRow[]) {
  return rows.find((row) => {
    const key = String(row.chave || row.key || row.nome || row.name || "").toLowerCase();
    return key.includes("aparencia") || key.includes("appearance") || key.includes("cor") || key.includes("primary");
  }) || rows[0] || null;
}

function extractPrimaryColor(row: ConfigRow | null) {
  if (!row) return null;

  const direct = normalizeColor(row.cor_primaria) || normalizeColor(row.primary_color) || normalizeColor(row.primaryColor);
  if (direct) return direct;

  const jsonSources = [objectValue(row.valor), objectValue(row.value), objectValue(row.metadata), objectValue(row.configuracoes), objectValue(row.cores)];
  for (const source of jsonSources) {
    const color = normalizeColor(source?.cor_primaria) || normalizeColor(source?.primary_color) || normalizeColor(source?.primaryColor) || normalizeColor(source?.primary);
    if (color) return color;
  }

  if (String(row.chave || row.key || "").toLowerCase().includes("cor")) {
    return normalizeColor(row.valor) || normalizeColor(row.value);
  }

  return null;
}

function buildUpdatePayload(row: ConfigRow, primaryColor: string) {
  if ("cor_primaria" in row) return { cor_primaria: primaryColor };
  if ("primary_color" in row) return { primary_color: primaryColor };
  if ("primaryColor" in row) return { primaryColor };

  for (const field of ["valor", "value", "metadata", "configuracoes", "cores"]) {
    const current = objectValue(row[field]);
    if (current) {
      return { [field]: { ...current, cor_primaria: primaryColor, primary: primaryColor } };
    }
  }

  if ("valor" in row) return { valor: primaryColor };
  if ("value" in row) return { value: primaryColor };

  return null;
}

async function updateRow(supabase: SupabaseClient, row: ConfigRow, payload: Record<string, unknown>) {
  const query = supabase.from("configuracoes_home").update(payload);

  if (row.id) {
    return query.eq("id", row.id as string);
  }

  if (row.chave) {
    return query.eq("chave", row.chave as string);
  }

  if (row.key) {
    return query.eq("key", row.key as string);
  }

  return { error: new Error("Nao foi possivel identificar a linha de configuracoes_home.") };
}

export async function getAdminAppearanceConfig(client?: SupabaseClient): Promise<AdminAppearanceConfig> {
  const supabase = client || createSupabaseServerClient();
  if (!supabase) return fallbackAppearance;

  const { data, error } = await supabase.from("configuracoes_home").select("*").limit(10);

  if (error) {
    return { ...fallbackAppearance, message: error.message };
  }

  const color = extractPrimaryColor(pickRow((data || []) as ConfigRow[]));
  return {
    primaryColor: color || fallbackAppearance.primaryColor,
    source: color ? "database" : "fallback",
  };
}

export async function updateAdminAppearanceConfig(supabase: SupabaseClient, primaryColor: string) {
  const color = normalizeColor(primaryColor);
  if (!color) return { error: "Cor primaria invalida. Use hexadecimal, exemplo #FFC300." };

  const { data, error } = await supabase.from("configuracoes_home").select("*").limit(10);
  if (error) return { error: error.message };

  const rows = (data || []) as ConfigRow[];
  const row = pickRow(rows);

  if (row) {
    const payload = buildUpdatePayload(row, color);
    if (!payload) return { error: "Nao encontrei uma coluna compativel para salvar a cor em configuracoes_home." };

    const result = await updateRow(supabase, row, payload);
    if (result.error) return { error: result.error.message };

    return { primaryColor: color };
  }

  const attempts = [
    { cor_primaria: color },
    { chave: "aparencia", valor: { cor_primaria: color, primary: color } },
    { chave: "cor_primaria", valor: color },
  ];

  let lastError = "Nao foi possivel salvar em configuracoes_home.";
  for (const payload of attempts) {
    const { error: insertError } = await supabase.from("configuracoes_home").insert(payload as Record<string, unknown>);
    if (!insertError) return { primaryColor: color };
    lastError = insertError.message;
  }

  return { error: lastError };
}
