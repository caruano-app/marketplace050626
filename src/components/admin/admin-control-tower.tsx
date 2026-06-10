"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminMetrics, AdminProduct, AdminStore, AuditLog, CategorySuggestion } from "@/lib/data/admin-dashboard";
import type { AtendimentoLead } from "@/lib/data/leads";

type AdminControlTowerProps = {
  metrics: AdminMetrics;
  leads: AtendimentoLead[];
  categorySuggestions: CategorySuggestion[];
  stores: AdminStore[];
  products: AdminProduct[];
  logs: AuditLog[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

function SkeletonRows() {
  return (
    <div className="grid gap-2">
      {[0, 1, 2].map((item) => (
        <div className="h-20 animate-pulse rounded-[8px] bg-neutral-200" key={item} />
      ))}
    </div>
  );
}

export function AdminControlTower({ metrics, leads, categorySuggestions, stores, products, logs }: AdminControlTowerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function refresh(messageText = "Dados atualizados.") {
    setMessage(messageText);
    startTransition(() => router.refresh());
  }

  async function patchAction(url: string, body: Record<string, string>, successMessage: string) {
    setMessage("Processando...");
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel concluir a acao.");
      return;
    }

    refresh(successMessage);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-[#ffd700]">Master control</p>
            <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Admin Caruano</h1>
            <p className="mt-2 text-sm font-bold text-neutral-300">Torre de controle para leads, categorias, lojistas e produtos.</p>
          </div>
          <button className="min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" onClick={() => refresh()} type="button">
            Refresh
          </button>
        </div>
        {message ? <p className="mt-3 rounded-[6px] bg-white/10 p-3 text-sm font-black text-white">{message}</p> : null}
      </section>

      <section className="flex gap-3 overflow-x-auto pb-2">
        {[
          { label: "Leads hoje/total", value: `${metrics.todayLeads}/${metrics.totalLeads}`, tone: "bg-[#ffd700] text-neutral-950" },
          { label: "Lojistas ativos", value: String(metrics.activeStores), tone: "bg-white text-neutral-950" },
          { label: "Produtos cadastrados", value: String(metrics.productsCount), tone: "bg-white text-neutral-950" },
          { label: "Volume vendas", value: formatPrice(metrics.volume), tone: "bg-[#00a86b] text-white" },
        ].map((card) => (
          <article className={`min-w-[190px] rounded-[8px] p-4 shadow-sm ${card.tone}`} key={card.label}>
            <p className="text-xs font-black uppercase opacity-70">{card.label}</p>
            <p className="mt-2 text-2xl font-black">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-neutral-950">Leads atendimento</h2>
        <div className="mt-3 space-y-3">
          {isPending ? <SkeletonRows /> : null}
          {!isPending && leads.map((lead) => (
            <article className="rounded-[8px] border border-neutral-200 p-4" key={lead.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black uppercase text-neutral-950">{lead.nome}</p>
                  <p className="text-xs font-bold uppercase text-neutral-500">{lead.origem || "origem nao informada"} | {formatDate(lead.criado_em)}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black uppercase text-neutral-700">{lead.status || "novo"}</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr]">
                <a className="grid min-h-11 place-items-center rounded-[6px] bg-[#00a86b] px-3 text-sm font-black uppercase text-white" href={whatsappHref(lead.whatsapp)} rel="noreferrer" target="_blank">
                  WhatsApp
                </a>
                <button className="min-h-11 rounded-[6px] bg-[#ffd700] px-3 text-sm font-black uppercase text-neutral-950" onClick={() => patchAction(`/api/admin/leads/${lead.id}/status`, { status: "em_atendimento" }, "Lead em atendimento.")} type="button">
                  Em atendimento
                </button>
                <button className="min-h-11 rounded-[6px] bg-neutral-950 px-3 text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/leads/${lead.id}/status`, { status: "convertido" }, "Lead convertido.")} type="button">
                  Convertido
                </button>
              </div>
            </article>
          ))}
          {!isPending && !leads.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Nenhum lead encontrado.</p> : null}
        </div>
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-neutral-950">Curadoria de categorias</h2>
        <div className="mt-3 space-y-3">
          {categorySuggestions.map((suggestion) => (
            <article className="rounded-[8px] border border-neutral-200 p-4" key={suggestion.id}>
              <p className="text-base font-black uppercase text-neutral-950">{suggestion.nome_sugerido}</p>
              <p className="mt-1 text-xs font-bold uppercase text-neutral-500">{suggestion.nicho_sugerido || "geral"} | {suggestion.lojistas?.nome_fantasia || "Lojista"}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="min-h-11 rounded-[6px] bg-[#00a86b] text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/category-suggestions/${suggestion.id}`, { action: "aprovar" }, "Categoria aprovada.")} type="button">
                  Aprovar
                </button>
                <button className="min-h-11 rounded-[6px] bg-red-600 text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/category-suggestions/${suggestion.id}`, { action: "rejeitar" }, "Categoria rejeitada.")} type="button">
                  Rejeitar
                </button>
              </div>
            </article>
          ))}
          {!categorySuggestions.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem sugestoes pendentes.</p> : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Lojistas em analise</h2>
          <div className="mt-3 space-y-3">
            {stores.map((store) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={store.id}>
                <p className="font-black uppercase text-neutral-950">{store.nome_fantasia}</p>
                <p className="text-xs font-bold text-neutral-500">{store.status_operacao}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="min-h-11 rounded-[6px] bg-[#00a86b] text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/stores/${store.id}/status`, { status: "ativo" }, "Lojista aprovado.")} type="button">Aprovar</button>
                  <button className="min-h-11 rounded-[6px] bg-red-600 text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/stores/${store.id}/status`, { status: "rejeitado" }, "Lojista rejeitado.")} type="button">Rejeitar</button>
                </div>
              </article>
            ))}
            {!stores.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem lojistas em analise.</p> : null}
          </div>
        </div>

        <div className="rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Produtos pendentes</h2>
          <div className="mt-3 space-y-3">
            {products.map((product) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={product.id}>
                <p className="font-black uppercase text-neutral-950">{product.nome_produto}</p>
                <p className="text-xs font-bold text-neutral-500">SKU {product.codigo_referencia_sku}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="min-h-11 rounded-[6px] bg-[#00a86b] text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/products/${product.id}/status`, { status: "aprovado" }, "Produto aprovado.")} type="button">Aprovar</button>
                  <button className="min-h-11 rounded-[6px] bg-red-600 text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/products/${product.id}/status`, { status: "rejeitado" }, "Produto rejeitado.")} type="button">Rejeitar</button>
                </div>
              </article>
            ))}
            {!products.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem produtos pendentes.</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-neutral-950">Seguranca e logs</h2>
        <div className="mt-3 space-y-2">
          {logs.map((log) => (
            <div className="rounded-[6px] bg-neutral-100 p-3 text-sm" key={log.id}>
              <p className="font-black text-neutral-950">{log.acao_executada}</p>
              <p className="text-xs font-bold text-neutral-500">{log.rota_acessada}</p>
            </div>
          ))}
          {!logs.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem logs recentes.</p> : null}
        </div>
      </section>
    </div>
  );
}
