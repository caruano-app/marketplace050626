import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MerchantDashboardApp } from "@/components/dashboard/merchant-dashboard-app";
import { NotificationBell } from "@/components/smart-tools/notification-badge";
import { TrackableQrCode } from "@/components/qrcode/trackable-qr-code";
import { getMerchantLeadMetric, getMerchantProducts, getMerchantReviewSummary, getMerchantStoreQr, getPendingQuotes } from "@/lib/data/merchant-dashboard";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
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

export default async function MerchantDashboardPage() {
  const [metrics, quotes, products, storeQr, reviewSummary] = await Promise.all([
    getMerchantLeadMetric(),
    getPendingQuotes(),
    getMerchantProducts(),
    getMerchantStoreQr(),
    getMerchantReviewSummary(),
  ]);
  const totalSales = quotes.reduce((sum, quote) => sum + Number(quote.valor_proposto || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-[#f6b900]">Dashboard do lojista</p>
              <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Painel rapido</h1>
              <p className="mt-2 text-sm font-bold text-neutral-300">
                Acompanhe leads, vendas e cotacoes pendentes em uma visao pensada para celular.
              </p>
            </div>
            <NotificationBell placement="inline" />
          </div>
        </section>

        <section className="mt-4 flex gap-3 overflow-x-auto pb-2">
          <div className="min-w-[180px] rounded-[8px] bg-[#00a86b] p-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase">Vendas hoje</p>
            <p className="mt-2 text-2xl font-black">{formatPrice(totalSales)}</p>
          </div>
          <div className="min-w-[180px] rounded-[8px] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Pedidos novos</p>
            <p className="mt-2 text-3xl font-black text-neutral-950">{metrics.newLeads}</p>
          </div>
          <div className="min-w-[180px] rounded-[8px] bg-[#ffd700] p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-950">Cotacoes pendentes</p>
            <p className="mt-2 text-3xl font-black text-neutral-950">{quotes.length}</p>
          </div>
          <div className="min-w-[180px] rounded-[8px] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Leads total</p>
            <p className="mt-2 text-3xl font-black text-neutral-950">{metrics.total}</p>
          </div>
          <div className="min-w-[180px] rounded-[8px] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Nota media</p>
            <p className="mt-2 text-3xl font-black text-neutral-950">{reviewSummary.averageRating ? reviewSummary.averageRating.toFixed(1) : "-"}</p>
          </div>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black uppercase text-neutral-950">Feedback dos clientes</h2>
              <p className="mt-1 text-sm font-bold text-neutral-500">{reviewSummary.totalReviews} avaliacoes aprovadas</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#fff8d6] px-4 py-2 text-sm font-black text-neutral-950">
              <ReviewStars value={reviewSummary.averageRating || 0} />
              <span>{reviewSummary.averageRating ? reviewSummary.averageRating.toFixed(1) : "Sem nota"}</span>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            {reviewSummary.latest.map((review) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={review.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black uppercase text-neutral-950">{review.productName}</p>
                  <ReviewStars value={review.nota} />
                </div>
                <p className="mt-2 text-sm font-bold leading-relaxed text-neutral-700">{review.comentario || "Cliente recomendou este produto."}</p>
              </article>
            ))}
            {!reviewSummary.latest.length ? (
              <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">
                Ainda nao ha comentarios aprovados.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase text-neutral-950">Cotacoes pendentes</h2>
            <a className="grid min-h-11 place-items-center rounded-[6px] bg-[#f6b900] px-4 text-sm font-black uppercase text-neutral-950" href="/dashboard/lojista">
              Atualizar
            </a>
          </div>

          <div className="space-y-3">
            {quotes.map((quote) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={quote.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase text-neutral-950">Cotacao #{quote.id.slice(0, 8)}</p>
                    <p className="mt-1 text-xs font-bold text-neutral-500">{formatDate(quote.criado_em)}</p>
                  </div>
                  <p className="text-right text-lg font-black text-[#f58220]">{formatPrice(Number(quote.valor_proposto || 0))}</p>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-neutral-700">{quote.observacoes || "Sem observacoes."}</p>
                <button className="mt-3 min-h-11 w-full rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" type="button">
                  Ver detalhes
                </button>
              </article>
            ))}

            {!quotes.length ? (
              <div className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center">
                <p className="text-sm font-black uppercase text-neutral-500">Nenhuma cotacao pendente encontrada.</p>
              </div>
            ) : null}
          </div>
        </section>
        <MerchantDashboardApp products={products} quotes={quotes} />
        <div className="mt-4">
          <TrackableQrCode
            fileName={`qr-loja-${storeQr.slug}`}
            title="Minha Loja"
            url={`https://caruano.com/loja/${storeQr.slug}`}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
