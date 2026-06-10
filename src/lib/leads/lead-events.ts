"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type LeadEventItem = {
  productId: string;
  lojistaId: string;
  storeName: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  color?: string;
  extras?: string;
};

export type LeadEvent = {
  id: string;
  createdAt: string;
  origin: "checkout" | "contato_lojista" | "pdp_direto" | "rfq_tecido";
  status: "pending_db" | "saved_db" | "whatsapp_opened";
  customerName: string;
  whatsapp: string;
  email?: string;
  message: string;
  total?: number;
  lojistaId?: string;
  storeName?: string;
  categoryId?: number | null;
  productId?: string | null;
  items?: LeadEventItem[];
  affiliate?: {
    afiliadoId: string;
    usuarioId: string;
    codigoAfiliado: string;
    nomeAfiliado: string;
    commissionPercent: number;
  } | null;
};

const outboxKey = "caruano-leads-outbox";

function safeReadOutbox() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(outboxKey) || "[]") as LeadEvent[];
  } catch {
    return [];
  }
}

export function getLocalLeadEvents() {
  return safeReadOutbox();
}

export function saveLocalLeadEvent(event: LeadEvent) {
  if (typeof window === "undefined") {
    return;
  }

  const current = safeReadOutbox();
  const next = [event, ...current.filter((item) => item.id !== event.id)].slice(0, 100);
  window.localStorage.setItem(outboxKey, JSON.stringify(next));
}

export function updateLocalLeadEventStatus(id: string, status: LeadEvent["status"]) {
  if (typeof window === "undefined") {
    return;
  }

  const next = safeReadOutbox().map((event) => (event.id === id ? { ...event, status } : event));
  window.localStorage.setItem(outboxKey, JSON.stringify(next));
}

export function makeLeadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `lead-${Date.now()}`;
}

export async function trySaveLeadEventToSupabase(event: LeadEvent) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return false;
  }

  const productIds = event.items?.map((item) => item.productId).filter(Boolean) || (event.productId ? [event.productId] : []);
  const { data: lead, error } = await supabase.from("leads_atendimento").insert({
    nome: event.customerName,
    whatsapp: event.whatsapp,
    email: event.email || null,
    origem: event.origin,
    mensagem: event.message,
    status: "novo",
    lojista_id: event.lojistaId || null,
    metadata: {
      id: event.id,
      total: event.total || 0,
      productIds,
      storeName: event.storeName || null,
      items: event.items || [],
      affiliate: event.affiliate || null,
      createdAt: event.createdAt,
    },
    utm_source: "site",
  }).select("id").single();

  if (error || !lead) {
    return false;
  }

  const interests = [
    ...productIds.map((productId) => ({
      lead_id: lead.id,
      produto_id: productId,
      categoria_id: null,
      cliques: 1,
    })),
    ...(event.categoryId
      ? [{
          lead_id: lead.id,
          produto_id: null,
          categoria_id: event.categoryId,
          cliques: 1,
        }]
      : []),
  ];

  if (interests.length) {
    await supabase.from("leads_interesses").insert(interests);
  }

  return true;
}

export async function persistLeadEvent(event: LeadEvent) {
  saveLocalLeadEvent(event);
  const saved = await trySaveLeadEventToSupabase(event);

  if (saved) {
    updateLocalLeadEventStatus(event.id, "saved_db");
  }

  return saved;
}
