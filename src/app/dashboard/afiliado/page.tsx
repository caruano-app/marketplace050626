import { AffiliateSharePanel } from "@/components/affiliate/affiliate-share-panel";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAffiliateDashboardData } from "@/lib/data/affiliate";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function AffiliateDashboardPage() {
  const data = await getAffiliateDashboardData();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <div className="mb-5">
          <p className="text-sm font-black uppercase text-[#f58220]">Dashboard afiliado</p>
          <h1 className="text-3xl font-black text-neutral-950">Revenda Caruano</h1>
          <p className="mt-1 text-sm font-bold text-neutral-600">{data.affiliate.nomeAfiliado}</p>
        </div>

        <section className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          <article className="min-w-[210px] rounded-[12px] bg-[#13a05f] p-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase opacity-80">Saldo a receber</p>
            <p className="mt-3 text-3xl font-black">{formatPrice(data.pendingBalance)}</p>
          </article>
          <article className="min-w-[210px] rounded-[12px] bg-[#FFD700] p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase opacity-70">Vendas realizadas</p>
            <p className="mt-3 text-3xl font-black">{data.salesCount}</p>
          </article>
          <article className="min-w-[210px] rounded-[12px] bg-neutral-950 p-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase opacity-80">Lojas aprovadas</p>
            <p className="mt-3 text-3xl font-black">{data.approvedStoresCount}</p>
          </article>
        </section>

        <div className="mt-5 grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            <AffiliateSharePanel shareUrl={data.shareUrl} />
            <button
              className="h-12 w-full rounded-[8px] bg-[#FFD700] px-4 text-sm font-black uppercase text-neutral-950 shadow-sm active:scale-95"
              type="button"
            >
              Solicitar afiliacao em nova loja
            </button>
          </div>

          <section className="rounded-[12px] border border-neutral-300 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-neutral-950">Comissoes recentes</h2>
              <span className="text-xs font-black uppercase text-neutral-500">{data.affiliate.commissionPercent}% padrao</span>
            </div>
            <div className="space-y-3">
              {data.commissions.map((commission) => (
                <article className="rounded-[10px] border border-neutral-200 bg-neutral-50 p-3" key={commission.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-neutral-950">Venda {commission.transacaoId?.slice(0, 8) || "sem codigo"}</p>
                      <p className="mt-1 text-xs font-bold uppercase text-neutral-500">{commission.statusPagamento}</p>
                    </div>
                    <p className="text-lg font-black text-[#13a05f]">{formatPrice(commission.valorComissao)}</p>
                  </div>
                  {commission.dataPrevistaPagamento ? (
                    <p className="mt-2 text-xs font-bold text-neutral-500">Previsao: {commission.dataPrevistaPagamento}</p>
                  ) : null}
                </article>
              ))}
              {!data.commissions.length ? (
                <p className="rounded-[10px] border border-dashed border-neutral-300 p-5 text-center text-sm font-bold text-neutral-500">
                  Nenhuma comissao registrada ainda.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
