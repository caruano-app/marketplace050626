import { redirect } from "next/navigation";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getServerSessionClient } from "@/lib/auth/server-session";
import { getAdminWarehouseData } from "@/lib/data/admin-warehouse";

export const dynamic = "force-dynamic";

type AdminWarehousePageProps = {
  searchParams?: {
    distribuidora?: string;
  };
};

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default async function AdminWarehousePage({ searchParams }: AdminWarehousePageProps) {
  const session = await getServerSessionClient();

  if (!session || session.profile.is_admin !== true) {
    redirect("/login?next=/admin/galpao-virtual");
  }

  const selectedDistributor = searchParams?.distribuidora || "";
  const data = await getAdminWarehouseData(session.supabase, selectedDistributor || null);
  const csvRows = data.items.map((item) => ({
    distribuidora: item.distributorName,
    ean: item.codigo_ean,
    produto: item.nome_produto || "",
    preco_b2b: item.preco_venda_b2b || 0,
    estoque: item.estoque_disponivel,
    valor_estimado: item.estoque_disponivel * Number(item.preco_venda_b2b || 0),
    atualizado_em: formatDate(item.ultima_atualizacao_pdf),
  }));

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-[#ffd700]">Galpao virtual</p>
              <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Estoque das distribuidoras</h1>
              <p className="mt-2 max-w-3xl text-sm font-bold text-neutral-300">
                Inventario consolidado a partir das listas importadas via PDF/IA.
              </p>
            </div>
            <ExportCsvButton fileName="caruano-galpao-virtual.csv" rows={csvRows} />
          </div>
        </section>

        <section className="mt-4 flex gap-3 overflow-x-auto pb-2">
          <article className="min-w-[190px] rounded-[8px] bg-[#ffd700] p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase">SKUs monitorados</p>
            <p className="mt-2 text-3xl font-black">{data.totalSku}</p>
          </article>
          <article className="min-w-[190px] rounded-[8px] bg-white p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Unidades disponiveis</p>
            <p className="mt-2 text-3xl font-black">{data.totalUnits}</p>
          </article>
          <article className="min-w-[220px] rounded-[8px] bg-[#00a86b] p-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase">Valor estimado B2B</p>
            <p className="mt-2 text-2xl font-black">{formatPrice(data.totalValue)}</p>
          </article>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <form className="grid gap-3 md:grid-cols-[1fr_180px]" action="/admin/galpao-virtual">
            <label className="block">
              <span className="text-sm font-black uppercase text-neutral-700">Filtrar por distribuidora</span>
              <select
                className="mt-2 min-h-11 w-full rounded-[6px] border border-neutral-300 bg-white px-3 text-base font-bold"
                defaultValue={selectedDistributor}
                name="distribuidora"
              >
                <option value="">Todas as distribuidoras</option>
                {data.distributors.map((distributor) => (
                  <option key={distributor.id} value={distributor.id}>
                    {distributor.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="mt-7 min-h-11 rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" type="submit">
              Aplicar filtro
            </button>
          </form>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Inventario consolidado</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-[#ffd700] text-neutral-950">
                <tr>
                  <th className="p-3">Distribuidora</th>
                  <th className="p-3">EAN</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Preco B2B</th>
                  <th className="p-3">Estoque</th>
                  <th className="p-3">Atualizacao</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr className="border-b border-neutral-200" key={item.id}>
                    <td className="p-3 font-black text-neutral-950">{item.distributorName}</td>
                    <td className="p-3 font-bold text-neutral-700">{item.codigo_ean}</td>
                    <td className="p-3 text-neutral-700">{item.nome_produto || "Produto sem nome"}</td>
                    <td className="p-3 font-black text-[#f58220]">{formatPrice(item.preco_venda_b2b)}</td>
                    <td className="p-3 font-black text-neutral-950">{item.estoque_disponivel}</td>
                    <td className="p-3 text-neutral-600">{formatDate(item.ultima_atualizacao_pdf)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length ? (
            <p className="mt-4 rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500">
              Nenhum estoque importado encontrado para este filtro.
            </p>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
