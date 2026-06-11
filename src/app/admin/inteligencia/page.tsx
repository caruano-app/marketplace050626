import { redirect } from "next/navigation";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getServerSessionClient } from "@/lib/auth/server-session";
import { getAdminIntelligenceData } from "@/lib/data/admin-intelligence";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default async function AdminIntelligencePage() {
  const session = await getServerSessionClient();

  if (!session || session.profile.is_admin !== true) {
    redirect("/login?next=/admin/inteligencia");
  }

  const data = await getAdminIntelligenceData(session.supabase);
  const maxSeriesValue = Math.max(...data.salesSeries.map((item) => item.total), 1);
  const maxCityValue = Math.max(...data.cityHeatmap.map((item) => item.total), 1);
  const funnelTotal = data.funnel.pendingAlerts + data.funnel.convertedAlerts;
  const convertedValue = data.funnel.convertedAlerts || data.funnel.supplyOrders;
  const csvRows = [
    ...data.sales.map((sale) => ({
      tipo: "venda_pdv",
      data: formatDate(sale.criado_em),
      loja: sale.storeName,
      cidade: sale.city,
      produto: sale.productName,
      ean: sale.ean || "",
      quantidade: sale.quantidade,
      valor: sale.valor_total || 0,
      status: "",
    })),
    ...data.orders.map((order) => ({
      tipo: "ordem_b2b",
      data: formatDate(order.criado_em),
      loja: order.buyerName,
      cidade: "",
      produto: order.productName,
      ean: "",
      quantidade: order.quantity || "",
      valor: order.valor_total || 0,
      status: order.status || "pendente",
    })),
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-[#ffd700]">Inteligencia operacional</p>
              <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Torre de controle master</h1>
              <p className="mt-2 max-w-3xl text-sm font-bold text-neutral-300">
                Movimento do dinheiro, funil de abastecimento e produtos mais bipados no Agreste.
              </p>
            </div>
            <ExportCsvButton fileName="caruano-inteligencia.csv" rows={csvRows} />
          </div>
        </section>

        <section className="mt-4 flex gap-3 overflow-x-auto pb-2">
          <article className="min-w-[240px] rounded-[8px] bg-[#ffd700] p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase">GMV local</p>
            <p className="mt-2 text-2xl font-black">{formatPrice(data.totalPdvRevenue)}</p>
            <p className="mt-1 text-xs font-bold uppercase">Volume de vendas no balcao via PDV</p>
          </article>
          <article className="min-w-[190px] rounded-[8px] bg-white p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Vendas PDV</p>
            <p className="mt-2 text-3xl font-black">{data.totalPdvSales}</p>
          </article>
          <article className="min-w-[190px] rounded-[8px] bg-white p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Alertas pendentes</p>
            <p className="mt-2 text-3xl font-black">{data.funnel.pendingAlerts}</p>
          </article>
          <article className="min-w-[190px] rounded-[8px] bg-[#00a86b] p-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase">Convertidos em ordem</p>
            <p className="mt-2 text-3xl font-black">{convertedValue}</p>
          </article>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <h2 className="text-xl font-black uppercase text-neutral-950">Crescimento das vendas locais</h2>
            <div className="mt-4 flex h-52 items-end gap-3 border-b border-neutral-200 pb-2">
              {data.salesSeries.map((item) => (
                <div className="flex h-full flex-1 flex-col justify-end gap-2 text-center" key={item.label}>
                  <div
                    className="mx-auto w-full rounded-t-[6px] bg-[#ffd700]"
                    style={{ height: `${Math.max(8, (item.total / maxSeriesValue) * 100)}%` }}
                    title={`${item.label}: ${formatPrice(item.total)}`}
                  />
                  <span className="text-[10px] font-black text-neutral-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <h2 className="text-xl font-black uppercase text-neutral-950">Funil de reabastecimento</h2>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm font-black uppercase text-neutral-700">
                  <span>Pendentes</span>
                  <span>{data.funnel.pendingAlerts}</span>
                </div>
                <div className="mt-2 h-4 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-[#ffd700]" style={{ width: `${Math.max(4, percentage(data.funnel.pendingAlerts, funnelTotal))}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-black uppercase text-neutral-700">
                  <span>Convertidos</span>
                  <span>{convertedValue}</span>
                </div>
                <div className="mt-2 h-4 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-[#00a86b]" style={{ width: `${Math.max(4, percentage(convertedValue, funnelTotal || convertedValue))}%` }} />
                </div>
              </div>
              <p className="rounded-[6px] bg-neutral-100 p-3 text-xs font-bold text-neutral-600">
                A conversao sobe quando o lojista aceita a melhor oferta e gera uma ordem B2B.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Mapa de calor por cidade</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {data.cityHeatmap.map((city) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={city.city}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-black uppercase text-neutral-950">{city.label}</p>
                  <span className="rounded-full bg-[#fff8d6] px-3 py-1 text-xs font-black text-neutral-950">{city.quantity} un</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-[#ffd700]" style={{ width: `${Math.max(8, (city.total / maxCityValue) * 100)}%` }} />
                </div>
                <p className="mt-2 text-lg font-black text-[#f58220]">{formatPrice(city.total)}</p>
              </article>
            ))}
            {!data.cityHeatmap.length ? (
              <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500 md:col-span-3">
                O mapa sera preenchido quando as vendas PDV tiverem cidade vinculada ao lojista.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Monitor de reabastecimento</h2>
          <div className="mt-4 grid gap-3">
            {data.orders.map((order) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={order.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black uppercase text-neutral-950">{order.buyerName}</p>
                    <p className="mt-1 text-sm font-bold text-neutral-600">
                      comprou {order.quantity ? `${order.quantity} un de ` : ""}{order.productName} da {order.supplierName}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff8d6] px-3 py-2 text-xs font-black uppercase text-neutral-950">{order.status || "pendente"}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm font-bold text-neutral-700 sm:grid-cols-2">
                  <p>Valor: {formatPrice(order.valor_total)}</p>
                  <p>Criado em: {formatDate(order.criado_em)}</p>
                </div>
              </article>
            ))}
            {!data.orders.length ? (
              <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500">
                Nenhuma ordem de abastecimento registrada.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <h2 className="text-xl font-black uppercase text-neutral-950">Dashboard de vendas locais</h2>
            <div className="mt-4 grid gap-3">
              {data.sales.map((sale) => (
                <article className="rounded-[8px] border border-neutral-200 p-4" key={sale.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase text-neutral-950">{sale.productName}</p>
                      <p className="mt-1 text-xs font-bold text-neutral-500">{sale.storeName} | SKU {sale.sku || "-"} | EAN {sale.ean || "-"}</p>
                    </div>
                    <p className="text-lg font-black text-[#f58220]">{formatPrice(sale.valor_total)}</p>
                  </div>
                  <p className="mt-2 text-sm font-bold text-neutral-700">
                    Quantidade: {sale.quantidade} | {sale.city} | {formatDate(sale.criado_em)}
                  </p>
                </article>
              ))}
              {!data.sales.length ? (
                <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500">
                  Nenhuma venda PDV registrada.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <h2 className="text-xl font-black uppercase text-neutral-950">Top 10 produtos bipados</h2>
            <div className="mt-4 grid gap-3">
              {data.ranking.map((item, index) => (
                <article className="flex items-center justify-between gap-3 rounded-[8px] border border-neutral-200 p-4" key={item.productId}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ffd700] text-sm font-black text-neutral-950">{index + 1}</span>
                    <div>
                      <p className="text-sm font-black uppercase text-neutral-950">{item.productName}</p>
                      <p className="text-xs font-bold text-neutral-500">SKU {item.sku || "-"} | EAN {item.ean || "-"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-neutral-950">{item.quantity} un</p>
                    <p className="text-xs font-bold text-neutral-500">{formatPrice(item.total)}</p>
                  </div>
                </article>
              ))}
              {!data.ranking.length ? (
                <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500">
                  Ranking sera exibido apos as primeiras vendas.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
