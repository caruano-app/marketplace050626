import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAppearanceConfig = {
  primaryColor: string;
  logoUrl: string | null;
  heroBannerUrl: string | null;
  highlightBannerUrl: string | null;
  marqueeText: string;
  footer: FooterConfig;
  source: "database" | "fallback";
  message?: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterConfig = {
  institucional: FooterLink[];
  ajuda: FooterLink[];
  linksUteis: FooterLink[];
  copyright: string;
};

export type SiteCmsPatch = Partial<{
  primaryColor: string;
  logoUrl: string | null;
  heroBannerUrl: string | null;
  highlightBannerUrl: string | null;
  marqueeText: string;
  footer: FooterConfig;
}>;

const fallbackFooter: FooterConfig = {
  institucional: [
    { label: "Sobre o Caruano", href: "/sobre" },
    { label: "Seja Lojista", href: "/criar-loja" },
    { label: "Contato", href: "/contato" },
  ],
  ajuda: [
    { label: "FAQ", href: "/faq" },
    { label: "Trocas e Devolucoes", href: "/trocas-e-devolucoes" },
    { label: "Prazos de Entrega", href: "/prazos-de-entrega" },
    { label: "Frete", href: "/frete" },
    { label: "Rastrear Pedido", href: "/rastrear-pedido" },
  ],
  linksUteis: [
    { label: "Nota da Moda", href: "/nota-da-moda" },
    { label: "Bolg", href: "/blog" },
    { label: "Servicos em Destaques", href: "/servicos-em-destaques" },
    { label: "Lojas Premium", href: "/lojas-premium" },
    { label: "Entrevistas", href: "/entrevistas" },
    { label: "Lives", href: "/lives" },
  ],
  copyright: "Caruano | caruano.com - Direitos reservados",
};

const fallbackAppearance: AdminAppearanceConfig = {
  primaryColor: "#FFC300",
  logoUrl: null,
  heroBannerUrl: null,
  highlightBannerUrl: null,
  marqueeText: "Banner promocional | edita cor, imagem, texto animado se deslocando para esquerda, categorias, lojas, seleciona paginas onde aparece",
  footer: fallbackFooter,
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
    return key.includes("aparencia") || key.includes("appearance") || key.includes("cms") || key.includes("home") || key.includes("cor") || key.includes("primary");
  }) || rows[0] || null;
}

function rowObject(row: ConfigRow | null) {
  if (!row) return {};
  const result: Record<string, unknown> = {};

  for (const field of ["valor", "value", "metadata", "configuracoes", "config", "cores"]) {
    const current = objectValue(row[field]);
    if (current) Object.assign(result, current);
  }

  for (const key of Object.keys(row)) {
    if (!["id", "chave", "key", "nome", "name", "criado_em", "atualizado_em"].includes(key) && typeof row[key] !== "object") {
      result[key] = row[key];
    }
  }

  return result;
}

function extractPrimaryColor(row: ConfigRow | null) {
  if (!row) return null;
  const config = rowObject(row);

  const direct = normalizeColor(config.cor_primaria) || normalizeColor(config.primary_color) || normalizeColor(config.primaryColor);
  if (direct) return direct;

  return normalizeColor(config.primary);
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function linkList(value: unknown, fallback: FooterLink[]) {
  if (!Array.isArray(value)) return fallback;
  const links = value
    .map((item) => objectValue(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      label: textValue(item.label) || textValue(item.titulo) || "",
      href: textValue(item.href) || textValue(item.url) || "#",
    }))
    .filter((item) => item.label);

  return links.length ? links : fallback;
}

function extractConfig(row: ConfigRow | null): AdminAppearanceConfig {
  const config = rowObject(row);
  const footer = objectValue(config.footer) || objectValue(config.rodape) || {};

  return {
    primaryColor: extractPrimaryColor(row) || fallbackAppearance.primaryColor,
    logoUrl: textValue(config.logoUrl) || textValue(config.logo_url),
    heroBannerUrl: textValue(config.heroBannerUrl) || textValue(config.banner_principal_url) || textValue(config.hero_banner_url),
    highlightBannerUrl: textValue(config.highlightBannerUrl) || textValue(config.banner_destaque_url) || textValue(config.highlight_banner_url),
    marqueeText: textValue(config.marqueeText) || textValue(config.marquee_text) || textValue(config.letreiro) || fallbackAppearance.marqueeText,
    footer: {
      institucional: linkList(footer.institucional, fallbackFooter.institucional),
      ajuda: linkList(footer.ajuda, fallbackFooter.ajuda),
      linksUteis: linkList(footer.linksUteis || footer.links_uteis, fallbackFooter.linksUteis),
      copyright: textValue(footer.copyright) || textValue(config.copyright) || fallbackFooter.copyright,
    },
    source: row ? "database" : "fallback",
  };
}

function buildUpdatePayload(row: ConfigRow, patch: SiteCmsPatch) {
  const currentConfig = rowObject(row);
  const nextConfig = {
    ...currentConfig,
    ...patch,
    cor_primaria: patch.primaryColor || currentConfig.cor_primaria,
    primary: patch.primaryColor || currentConfig.primary,
  };

  if ("cor_primaria" in row && patch.primaryColor && Object.keys(patch).length === 1) return { cor_primaria: patch.primaryColor };
  if ("primary_color" in row && patch.primaryColor && Object.keys(patch).length === 1) return { primary_color: patch.primaryColor };
  if ("primaryColor" in row && patch.primaryColor && Object.keys(patch).length === 1) return { primaryColor: patch.primaryColor };
  for (const field of ["valor", "value", "metadata", "configuracoes", "cores"]) {
    if (field in row) return { [field]: nextConfig };
  }

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

  return extractConfig(pickRow((data || []) as ConfigRow[]));
}

export async function updateAdminAppearanceConfig(supabase: SupabaseClient, primaryColor: string) {
  return updateSiteCmsConfig(supabase, { primaryColor });
}

export async function updateSiteCmsConfig(supabase: SupabaseClient, patch: SiteCmsPatch) {
  const color = patch.primaryColor ? normalizeColor(patch.primaryColor) : null;
  if (patch.primaryColor && !color) return { error: "Cor primaria invalida. Use hexadecimal, exemplo #FFC300." };

  const normalizedPatch: SiteCmsPatch = {
    ...patch,
    primaryColor: color || patch.primaryColor,
  };

  const { data, error } = await supabase.from("configuracoes_home").select("*").limit(10);
  if (error) return { error: error.message };

  const rows = (data || []) as ConfigRow[];
  const row = pickRow(rows);

  if (row) {
    const payload = buildUpdatePayload(row, normalizedPatch);
    if (!payload) return { error: "Nao encontrei uma coluna JSON compativel para salvar configuracoes_home." };

    const result = await updateRow(supabase, row, payload);
    if (result.error) return { error: result.error.message };

    return { config: extractConfig({ ...row, ...payload }), primaryColor: color || extractPrimaryColor({ ...row, ...payload }) || fallbackAppearance.primaryColor };
  }

  const config = {
    ...fallbackAppearance,
    ...normalizedPatch,
    cor_primaria: normalizedPatch.primaryColor || fallbackAppearance.primaryColor,
    primary: normalizedPatch.primaryColor || fallbackAppearance.primaryColor,
  };

  const attempts = [
    { chave: "aparencia", valor: config },
    { key: "appearance", value: config },
    { nome: "aparencia", configuracoes: config },
  ];

  let lastError = "Nao foi possivel salvar em configuracoes_home.";
  for (const payload of attempts) {
    const { error: insertError } = await supabase.from("configuracoes_home").insert(payload as Record<string, unknown>);
    if (!insertError) return { config, primaryColor: config.primaryColor };
    lastError = insertError.message;
  }

  return { error: lastError };
}
