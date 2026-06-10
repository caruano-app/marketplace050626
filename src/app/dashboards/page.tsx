import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { getAtendimentoLeads } from "@/lib/data/leads";

export default async function DashboardsPage() {
  const leads = await getAtendimentoLeads();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-8">
        <div className="mb-6">
          <p className="text-sm font-black uppercase text-[#f58220]">Auditoria operacional</p>
          <h1 className="text-4xl font-black uppercase text-neutral-950">Dashboards Caruano e Lojistas</h1>
          <p className="mt-2 max-w-4xl text-base font-bold text-neutral-600">
            Visualizacao real da tabela leads_atendimento para acompanhamento dos contatos capturados no checkout, PDP e paginas de lojistas.
          </p>
        </div>

        <LeadsTable leads={leads} />

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[8px] border border-neutral-300 bg-white p-5">
            <h2 className="text-2xl font-black uppercase text-neutral-950">Admin Caruano</h2>
            <p className="mt-2 text-sm font-bold text-neutral-600">
              Deve consolidar leads, transacoes_mestre, sub_pedidos_loja, itens_pedido, comissao da plataforma e origem dos contatos.
            </p>
          </div>
          <div className="rounded-[8px] border border-neutral-300 bg-white p-5">
            <h2 className="text-2xl font-black uppercase text-neutral-950">Dashboard do lojista</h2>
            <p className="mt-2 text-sm font-bold text-neutral-600">
              Deve filtrar leads e subpedidos por lojista_id, incluindo contatos do widget Converse com o lojista, produtos do carrinho e status de atendimento.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
