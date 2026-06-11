"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminMetrics, AdminProduct, AdminReview, AdminStore, AuditLog, CategorySuggestion } from "@/lib/data/admin-dashboard";
import { documentLabels, type SignedIdentityDocument } from "@/lib/data/kyc";
import type { AtendimentoLead } from "@/lib/data/leads";
import { NotificationBell } from "@/components/smart-tools/notification-badge";
import { VerifiedBadge } from "@/components/common/verified-badge";
import { isIdentityVerified } from "@/lib/data/verification";

type AdminControlTowerProps = {
  metrics: AdminMetrics;
  leads: AtendimentoLead[];
  categorySuggestions: CategorySuggestion[];
  reviews: AdminReview[];
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

function isOlderThan24Hours(value: string | null) {
  if (!value) return false;
  return Date.now() - new Date(value).getTime() > 24 * 60 * 60 * 1000;
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

function ReviewStars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          aria-hidden="true"
          className={star <= Math.round(value) ? "fill-[#FFC300] text-[#FFC300]" : "fill-none text-neutral-400"}
          height="18"
          key={star}
          viewBox="0 0 24 24"
          width="18"
        >
          <path d="m12 2.5 2.95 6 6.62.96-4.79 4.67 1.13 6.59L12 17.62l-5.91 3.1 1.13-6.59-4.79-4.67 6.62-.96L12 2.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      ))}
    </span>
  );
}

export function AdminControlTower({ metrics, leads, categorySuggestions, reviews, stores, products, logs }: AdminControlTowerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [identityStore, setIdentityStore] = useState<AdminStore | null>(null);
  const [identityDocuments, setIdentityDocuments] = useState<SignedIdentityDocument[]>([]);
  const [identityStatus, setIdentityStatus] = useState("nao_enviado");
  const [rejectReason, setRejectReason] = useState("");
  const [loadingIdentity, setLoadingIdentity] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const urgentLeads = leads.filter((lead) => (lead.status || "novo") === "novo");
  const urgentStores = stores.filter((store) => {
    const status = store.usuarios?.status_verificacao_identidade || "nao_enviado";
    return status !== "aprovado" && isOlderThan24Hours(store.criado_em);
  });
  const visibleLeads = urgentOnly ? urgentLeads : leads;
  const visibleStores = urgentOnly ? urgentStores : stores;

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

  async function loadIdentityDocuments(store: AdminStore) {
    setIdentityStore(store);
    setLoadingIdentity(true);
    setMessage("Gerando links temporarios dos documentos...");

    const response = await fetch(`/api/admin/identity/${store.usuario_id}`, { cache: "no-store" });
    const payload = (await response.json()) as { documents?: SignedIdentityDocument[]; status?: string; error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel carregar os documentos.");
      setLoadingIdentity(false);
      return;
    }

    setIdentityDocuments(payload.documents || []);
    setIdentityStatus(payload.status || "nao_enviado");
    setRejectReason("");
    setMessage("Documentos carregados para analise.");
    setLoadingIdentity(false);
  }

  async function updateIdentityStatus(status: "aprovado" | "rejeitado") {
    if (!identityStore) return;

    if (status === "rejeitado" && !rejectReason.trim()) {
      setMessage("Informe o motivo da rejeicao.");
      return;
    }

    setMessage("Atualizando verificacao de identidade...");
    const response = await fetch(`/api/admin/identity/${identityStore.usuario_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, motivo: rejectReason }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel atualizar a verificacao.");
      return;
    }

    setIdentityStatus(status);
    refresh(status === "aprovado" ? "Identidade aprovada." : "Identidade rejeitada.");
  }

  function renderDocumentPreview(documentItem: SignedIdentityDocument) {
    const isPdf = documentItem.url_arquivo.toLowerCase().endsWith(".pdf");

    return (
      <article className="rounded-[8px] border border-neutral-200 bg-white p-3" key={documentItem.id}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black uppercase text-neutral-950">{documentLabels[documentItem.tipo] || documentItem.tipo}</p>
          <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-black uppercase text-neutral-600">{documentItem.status}</span>
        </div>
        {documentItem.signed_url ? (
          <div className="mt-3 overflow-hidden rounded-[6px] border border-neutral-200 bg-neutral-100">
            {isPdf ? (
              <iframe className="h-64 w-full" src={documentItem.signed_url} title={documentLabels[documentItem.tipo] || documentItem.tipo} />
            ) : (
              <iframe className="h-64 w-full" src={documentItem.signed_url} title={documentLabels[documentItem.tipo] || documentItem.tipo} />
            )}
          </div>
        ) : (
          <p className="mt-3 rounded-[6px] bg-red-50 p-3 text-xs font-black uppercase text-red-700">Link temporario indisponivel.</p>
        )}
      </article>
    );
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
          <div className="flex items-center gap-2">
            <NotificationBell placement="inline" />
            <button className="min-h-11 rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" onClick={() => refresh()} type="button">
              Refresh
            </button>
          </div>
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

      <section className="rounded-[8px] border border-[#FFC300] bg-[#fff8d6] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-zinc-900">Pendencias urgentes</p>
            <p className="mt-1 text-sm font-bold text-neutral-700">
              {urgentLeads.length} leads nao atendidos | {urgentStores.length} lojistas aguardando KYC ha mais de 24h
            </p>
          </div>
          <button
            className={`min-h-11 rounded-[6px] px-4 text-sm font-black uppercase ${
              urgentOnly ? "bg-zinc-900 text-white" : "bg-[#FFC300] text-zinc-900"
            }`}
            onClick={() => setUrgentOnly((current) => !current)}
            type="button"
          >
            {urgentOnly ? "Mostrar tudo" : "Filtrar urgentes"}
          </button>
        </div>
      </section>

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-neutral-950">Leads atendimento</h2>
        <div className="mt-3 space-y-3">
          {isPending ? <SkeletonRows /> : null}
          {!isPending && visibleLeads.map((lead) => (
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
          {!isPending && !visibleLeads.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Nenhum lead encontrado.</p> : null}
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

      <section className="rounded-[8px] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black uppercase text-neutral-950">Moderacao de comentarios</h2>
        <div className="mt-3 space-y-3">
          {reviews.map((review) => (
            <article className="rounded-[8px] border border-neutral-200 p-4" key={review.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black uppercase text-neutral-950">{review.produtos?.nome_produto || "Produto Caruano"}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-neutral-500">
                    {review.usuarios?.nome_completo || "Cliente"} | {review.lojistas?.nome_fantasia || "Loja"} | {formatDate(review.criado_em)}
                  </p>
                </div>
                <ReviewStars value={Number(review.nota || 0)} />
              </div>
              <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-bold leading-relaxed text-neutral-700">
                {review.comentario || "Sem comentario."}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="min-h-11 rounded-[6px] bg-[#00a86b] text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/reviews/${review.id}`, { status: "aprovado" }, "Comentario aprovado.")} type="button">
                  Aprovar
                </button>
                <button className="min-h-11 rounded-[6px] bg-red-600 text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/reviews/${review.id}`, { status: "rejeitado" }, "Comentario reprovado.")} type="button">
                  Reprovar
                </button>
              </div>
            </article>
          ))}
          {!reviews.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem comentarios pendentes.</p> : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Lojistas em analise</h2>
          <div className="mt-3 space-y-3">
            {visibleStores.map((store) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={store.id}>
                <p className="font-black uppercase text-neutral-950">{store.nome_fantasia}</p>
                <p className="text-xs font-bold text-neutral-500">
                  {store.status_operacao} | KYC {store.usuarios?.status_verificacao_identidade || "nao_enviado"}
                </p>
                <div className="mt-2 flex min-h-11 items-center justify-between rounded-[6px] bg-neutral-100 px-3 text-xs font-black uppercase text-neutral-700">
                  <span>Selo</span>
                  {isIdentityVerified(store.usuarios) ? <VerifiedBadge size="sm" label /> : <span>Sem selo</span>}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <button className="min-h-11 rounded-[6px] bg-[#ffd700] text-sm font-black uppercase text-neutral-950" onClick={() => loadIdentityDocuments(store)} type="button">
                    Ver documentos
                  </button>
                  <button className="min-h-11 rounded-[6px] bg-[#00a86b] text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/stores/${store.id}/status`, { status: "ativo" }, "Lojista aprovado.")} type="button">Aprovar</button>
                  <button className="min-h-11 rounded-[6px] bg-red-600 text-sm font-black uppercase text-white" onClick={() => patchAction(`/api/admin/stores/${store.id}/status`, { status: "rejeitado" }, "Lojista rejeitado.")} type="button">Rejeitar</button>
                </div>
              </article>
            ))}
            {!visibleStores.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem lojistas em analise.</p> : null}
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

      {identityStore ? (
        <section className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[12px] border border-neutral-200 bg-neutral-100 p-4 shadow-2xl md:left-1/2 md:max-w-5xl md:-translate-x-1/2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-orange-600">Verificacao de identidade</p>
              <h2 className="text-2xl font-black uppercase text-neutral-950">{identityStore.nome_fantasia}</h2>
              <p className="text-sm font-bold uppercase text-neutral-600">Status: {identityStatus}</p>
            </div>
            <button className="min-h-11 rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" onClick={() => setIdentityStore(null)} type="button">
              Fechar
            </button>
          </div>

          {loadingIdentity ? <SkeletonRows /> : null}

          {!loadingIdentity ? (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {identityDocuments.map((documentItem) => renderDocumentPreview(documentItem))}
              </div>
              {!identityDocuments.length ? (
                <p className="mt-4 rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">
                  Nenhum documento enviado.
                </p>
              ) : null}

              <label className="mt-4 block rounded-[8px] bg-white p-3 text-sm font-black uppercase text-neutral-950">
                Motivo da rejeicao
                <textarea
                  className="mt-2 min-h-24 w-full rounded-[6px] border border-neutral-300 p-3 text-sm font-bold normal-case outline-none focus:border-neutral-950"
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Explique o que o lojista precisa reenviar."
                  value={rejectReason}
                />
              </label>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button className="min-h-11 rounded-[6px] bg-[#00a86b] text-sm font-black uppercase text-white" onClick={() => updateIdentityStatus("aprovado")} type="button">
                  Aprovar identidade
                </button>
                <button className="min-h-11 rounded-[6px] bg-red-600 text-sm font-black uppercase text-white" onClick={() => updateIdentityStatus("rejeitado")} type="button">
                  Rejeitar identidade
                </button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
