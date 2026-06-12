import { redirect } from "next/navigation";
import Link from "next/link";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { isCaruanoAdmin } from "@/lib/auth/admin";
import { getServerSessionClient } from "@/lib/auth/server-session";
import { getAdminIntelligenceData, type AdminIntelligenceFilters } from "@/lib/data/admin-intelligence";

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

function orderStatusLabel(status: string | null) {
  if (status === "em_transito") return "Em transito";
  if (status === "entregue") return "Entregue";
  if (status === "concluido") return "Concluido";
  return "Aguardando Distribuidora";
}

function buildFilterHref(filters: AdminIntelligenceFilters, changes: Partial<AdminIntelligenceFilters>) {
  const params = new URLSearchParams();
  const next = { ...filters, ...changes };

  if (next.period) params.set("periodo", next.period);
  if (next.city) params.set("cidade", next.city);
  if (next.segment) params.set("segmento", next.segment);

  return `/admin/inteligencia${params.size ? `?${params.toString()}` : ""}`;
}

const periodOptions = [
  { value: "7d", label: "Ultimos 7 dias" },
  { value: "hoje", label: "Hoje" },
  { value: "mes", label: "Mes atual" },
] as const;

const cityOptions = [
  { value: "", label: "Todas as cidades" },
  { value: "caruaru", label: "Caruaru" },
  { value: "toritama", label: "Toritama" },
  { value: "santa_cruz_do_capibaribe", label: "Santa Cruz" },
] as const;

type AdminIntelligencePageProps = {
  searchParams?: {
    periodo?: string;
    cidade?: string;
    segmento?: string;
  };
};

export default async function AdminIntelligencePage({ searchParams }: AdminIntelligencePageProps) {
  const session = await getServerSessionClient();

  if (!session || !isCaruanoAdmin(session.profile)) {
    redirect("/login?next=/admin/inteligencia");
  }

  const filters: AdminIntelligenceFilters = {
    period: searchParams?.periodo === "hoje" || searchParams?.periodo === "mes" ? searchParams.periodo : "7d",
    city: searchParams?.cidade || undefined,
    segment: searchParams?.segmento || undefined,
  };
  const data = await getAdminIntelligenceData(session.supabase, filters);
  const maxSeriesValue = Math.max(...data.salesSeries.map((item) => item.total), 1);
  const maxCityValue = Math.max(...data.cityHeatmap.map((item) => item.total), 1);
  const funnelTotal = data.funnel.pendingAlerts + data.funnel.convertedAlerts;
  const convertedValue = data.funnel.convertedAlerts || data.funnel.supplyOrders;
  const segmentOptions = [
    { value: "", label: "Todos os segmentos" },
    ...data.segmentDistribution.map((item) => ({ value: item.segment, label: item.label })),
  ];
  const csvRows = [
    ...data.sales.map((sale) => ({
      tipo: "venda_pdv",
      data: formatDate(sale.criado_em),
      loja: sale.storeName,
      cidade: sale.cityLabel,
      segmento: sale.segmentLabel,
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
                GMV do balcao, segmentos que mais giram e produtos mais bipados no Agreste.
              </p>
            </div>
            <ExportCsvButton fileName="caruano-inteligencia.csv" rows={csvRows} />
          </div>
        </section>

        <form action="/admin/inteligencia" className="mt-4 grid gap-3 rounded-[8px] bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="text-xs font-black uppercase text-neutral-600">
            Periodo
            <select className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 bg-white px-3 text-sm font-bold text-neutral-950" defaultValue={filters.period} name="periodo">
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black uppercase text-neutral-600">
            Cidade
            <select className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 bg-white px-3 text-sm font-bold text-neutral-950" defaultValue={filters.city || ""} name="cidade">
              {cityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black uppercase text-neutral-600">
            Segmento
            <select className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 bg-white px-3 text-sm font-bold text-neutral-950" defaultValue={filters.segment || ""} name="segmento">
              {segmentOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <button className="h-12 self-end rounded-[8px] bg-neutral-950 px-5 text-sm font-black uppercase text-white transition hover:bg-neutral-800 active:scale-95" type="submit">
            Filtrar
          </button>
        </form>

        <section className="mt-4 flex gap-3 overflow-x-auto pb-2">
          <article className="min-w-[240px] rounded-[8px] bg-[#ffd700] p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase">GMV total balcao</p>
            <p className="mt-2 text-2xl font-black">{formatPrice(data.totalPdvRevenue)}</p>
            <p className="mt-1 text-xs font-bold uppercase">Soma de vendas PDV filtradas</p>
          </article>
          <article className="min-w-[210px] rounded-[8px] bg-white p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Ticket medio</p>
            <p className="mt-2 text-2xl font-black">{formatPrice(data.averageTicket)}</p>
            <p className="mt-1 text-xs font-bold uppercase text-neutral-500">{data.totalPdvSales} vendas no periodo</p>
          </article>
          <article className="min-w-[210px] rounded-[8px] bg-white p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Produtos bipados</p>
            <p className="mt-2 text-3xl font-black">{data.totalItemsScanned}</p>
            <p className="mt-1 text-xs font-bold uppercase text-neutral-500">Itens processados por EAN</p>
          </article>
          <article className="min-w-[210px] rounded-[8px] bg-neutral-950 p-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase text-[#ffd700]">Reabastecimento</p>
            <p className="mt-2 text-3xl font-black">{convertedValue}</p>
            <p className="mt-1 text-xs font-bold uppercase text-neutral-300">Ordens ou alertas convertidos</p>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black uppercase text-neutral-950">Volume por segmento</h2>
              <p className="mt-1 text-sm font-bold text-neutral-500">Clique em um segmento para filtrar o ranking, mapa e vendas abaixo.</p>
            </div>
            {filters.segment ? (
              <Link className="grid h-11 place-items-center rounded-[8px] border border-neutral-300 px-4 text-sm font-black uppercase text-neutral-950 transition hover:bg-neutral-100 active:scale-95" href={buildFilterHref(filters, { segment: undefined })}>
                Limpar segmento
              </Link>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {data.segmentDistribution.map((segment) => (
              <Link
                className={`rounded-[8px] border p-4 transition active:scale-[0.98] ${filters.segment === segment.segment ? "border-neutral-950 bg-[#ffd700]" : "border-neutral-200 bg-white hover:border-[#ffd700]"}`}
                href={buildFilterHref(filters, { segment: segment.segment })}
                key={segment.segment}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black uppercase text-neutral-950">{segment.label}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-neutral-500">{segment.salesCount} vendas | {segment.quantity} itens</p>
                  </div>
                  <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-black text-white">{segment.percentage}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-[#f58220]" style={{ width: `${Math.max(4, segment.percentage)}%` }} />
                </div>
                <p className="mt-3 text-xl font-black text-neutral-950">{formatPrice(segment.total)}</p>
              </Link>
            ))}
            {!data.segmentDistribution.length ? (
              <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500 md:col-span-2 xl:col-span-4">
                A distribuicao por segmento sera exibida apos as primeiras vendas PDV.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Mapa de calor por cidade</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {data.cityHeatmap.map((city) => (
              <Link className="rounded-[8px] border border-neutral-200 p-4 transition hover:border-[#ffd700] active:scale-[0.98]" href={buildFilterHref(filters, { city: city.city })} key={city.city}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-black uppercase text-neutral-950">{city.label}</p>
                  <span className="rounded-full bg-[#fff8d6] px-3 py-1 text-xs font-black text-neutral-950">{city.quantity} un</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-[#ffd700]" style={{ width: `${Math.max(8, (city.total / maxCityValue) * 100)}%` }} />
                </div>
                <p className="mt-2 text-lg font-black text-[#f58220]">{formatPrice(city.total)}</p>
              </Link>
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
                  <span className="rounded-full bg-[#fff8d6] px-3 py-2 text-xs font-black uppercase text-neutral-950">{orderStatusLabel(order.status)}</span>
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
                    Quantidade: {sale.quantidade} | {sale.cityLabel} | {sale.segmentLabel} | {formatDate(sale.criado_em)}
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
            <h2 className="text-xl font-black uppercase text-neutral-950">Top performance por EAN</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[680px] w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-xs font-black uppercase text-neutral-500">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Produto</th>
                    <th className="px-3 py-2">EAN-13</th>
                    <th className="px-3 py-2">Qtd</th>
                    <th className="px-3 py-2">Valor</th>
                    <th className="px-3 py-2">Loja lider</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ranking.map((item, index) => (
                    <tr className="rounded-[8px] bg-neutral-50 align-top" key={item.productId}>
                      <td className="rounded-l-[8px] px-3 py-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ffd700] text-xs font-black text-neutral-950">{index + 1}</span>
                      </td>
                      <td className="px-3 py-3">
                        <Link className="font-black uppercase text-neutral-950 underline-offset-4 hover:underline" href={`/product/${item.productId}`}>
                          {item.productName}
                        </Link>
                        <p className="mt-1 text-xs font-bold text-neutral-500">SKU {item.sku || "-"}</p>
                      </td>
                      <td className="px-3 py-3 font-bold text-neutral-700">{item.ean || "Nao informado"}</td>
                      <td className="px-3 py-3 font-black text-neutral-950">{item.quantity}</td>
                      <td className="px-3 py-3 font-black text-[#f58220]">{formatPrice(item.total)}</td>
                      <td className="rounded-r-[8px] px-3 py-3">
                        <p className="font-black text-neutral-950">{item.topStoreName}</p>
                        <p className="text-xs font-bold text-neutral-500">{item.topStoreQuantity} un | {formatPrice(item.topStoreTotal)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
