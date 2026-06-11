import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getServerSessionClient } from "@/lib/auth/server-session";
import { getCityLabel, getManagerDashboardData, getPermissionLabel, getSegmentLabel } from "@/lib/data/management";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

export default async function ManagerDashboardPage() {
  const session = await getServerSessionClient();

  if (!session) {
    redirect("/login?next=/dashboard/gerente");
  }

  const { scopes, demands, leads } = await getManagerDashboardData(session.supabase, session.user.id).catch(() => ({
    scopes: [],
    demands: [],
    leads: [],
  }));

  const urgentDemands = demands.filter((demand) => demand.urgente || demand.status === "triagem");
  const openLeads = leads.filter((lead) => (lead.status || "novo") === "novo");

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Dashboard do gerente</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Central de demandas</h1>
          <p className="mt-2 max-w-3xl text-sm font-bold text-neutral-300">
            Leads e demandas filtrados pelo seu escopo operacional no Caruano.
          </p>
        </section>

        {!scopes.length ? (
          <section className="mt-4 rounded-[8px] border border-dashed border-neutral-300 bg-white p-6 text-center">
            <p className="text-sm font-black uppercase text-neutral-500">Nenhum escopo ativo encontrado.</p>
            <h2 className="mt-2 text-2xl font-black text-neutral-950">Solicite acesso ao Master Admin</h2>
            <p className="mt-2 text-sm font-bold text-neutral-600">
              Sua conta esta logada, mas ainda nao recebeu cidade, segmento e nivel de gerencia.
            </p>
          </section>
        ) : (
          <>
            <section className="mt-4 flex gap-3 overflow-x-auto pb-2">
              <article className="min-w-[180px] rounded-[8px] bg-[#ffd700] p-4 text-neutral-950 shadow-sm">
                <p className="text-xs font-black uppercase">Demandas urgentes</p>
                <p className="mt-2 text-3xl font-black">{urgentDemands.length}</p>
              </article>
              <article className="min-w-[180px] rounded-[8px] bg-white p-4 text-neutral-950 shadow-sm">
                <p className="text-xs font-black uppercase text-neutral-500">Demandas no escopo</p>
                <p className="mt-2 text-3xl font-black">{demands.length}</p>
              </article>
              <article className="min-w-[180px] rounded-[8px] bg-white p-4 text-neutral-950 shadow-sm">
                <p className="text-xs font-black uppercase text-neutral-500">Leads novos</p>
                <p className="mt-2 text-3xl font-black">{openLeads.length}</p>
              </article>
              <article className="min-w-[220px] rounded-[8px] bg-neutral-950 p-4 text-white shadow-sm">
                <p className="text-xs font-black uppercase text-[#ffd700]">Escopo principal</p>
                <p className="mt-2 text-sm font-black uppercase">
                  {getCityLabel(scopes[0]?.cidade_atuacao)} / {getSegmentLabel(scopes[0]?.segmento_atuacao)}
                </p>
              </article>
            </section>

            <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
              <h2 className="text-xl font-black uppercase text-neutral-950">Meus escopos</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {scopes.map((scope) => (
                  <article className="rounded-[8px] border border-neutral-200 p-4" key={scope.id}>
                    <p className="text-sm font-black uppercase text-neutral-500">{getPermissionLabel(scope.nivel_permissao)}</p>
                    <p className="mt-2 text-lg font-black text-neutral-950">
                      {getSegmentLabel(scope.segmento_atuacao)} em {getCityLabel(scope.cidade_atuacao)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black uppercase text-neutral-950">Demandas para triagem</h2>
                  <p className="text-sm font-bold text-neutral-500">Somente cidade e segmento permitidos para sua conta.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {demands.map((demand) => (
                  <article className="rounded-[8px] border border-neutral-200 p-4" key={demand.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-black uppercase text-neutral-950">{demand.titulo_demanda}</p>
                        <p className="mt-1 text-xs font-bold text-neutral-500">{formatDate(demand.criado_em)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-2 text-xs font-black uppercase ${demand.urgente ? "bg-red-100 text-red-700" : "bg-[#fff8d6] text-neutral-950"}`}>
                        {demand.urgente ? "Urgente" : demand.status || "triagem"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-neutral-700">{demand.descricao_detalhada || "Sem descricao detalhada."}</p>
                    <div className="mt-3 grid gap-2 text-sm font-black text-neutral-700 sm:grid-cols-3">
                      <p>Cidade: {getCityLabel(demand.cidade)}</p>
                      <p>Segmento: {getSegmentLabel(demand.segmento)}</p>
                      <p>Tipo: {demand.tipo_demanda || "-"}</p>
                    </div>
                  </article>
                ))}
                {!demands.length ? (
                  <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500">
                    Nenhuma demanda encontrada para seu escopo.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
              <h2 className="text-xl font-black uppercase text-neutral-950">Leads compativeis</h2>
              <div className="mt-4 grid gap-3">
                {leads.map((lead) => (
                  <article className="rounded-[8px] border border-neutral-200 p-4" key={lead.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-black uppercase text-neutral-950">{lead.nome}</p>
                        <p className="mt-1 text-xs font-bold text-neutral-500">{lead.origem || "origem nao informada"} - {formatDate(lead.criado_em)}</p>
                      </div>
                      <span className="rounded-full bg-[#fff8d6] px-3 py-2 text-xs font-black uppercase text-neutral-950">{lead.status || "novo"}</span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-neutral-700">{lead.mensagem || "Lead sem mensagem."}</p>
                    <a
                      className="mt-4 grid min-h-11 place-items-center rounded-[6px] bg-[#00a86b] px-4 text-sm font-black uppercase text-white"
                      href={whatsappHref(lead.whatsapp)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Chamar no Zap
                    </a>
                  </article>
                ))}
                {!leads.length ? (
                  <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500">
                    Nenhum lead com metadata compativel com seu escopo.
                  </p>
                ) : null}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
