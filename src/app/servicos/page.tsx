import Link from "next/link";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DemandActionButton } from "@/components/services/demand-action-button";
import { getServiceProviders } from "@/lib/data/services-portal";

export const dynamic = "force-dynamic";

const serviceHighlights = [
  {
    title: "Conserto de maquinas",
    text: "Mecanicos para reta, overlock, galoneira e equipamentos de producao.",
    icon: "M",
    city: "caruaru",
  },
  {
    title: "Fretes e coletas",
    text: "Freteiros, vans, toyotas e apoio para excursao e entrega local.",
    icon: "F",
    city: "toritama",
  },
  {
    title: "Graficas e insumos",
    text: "Etiquetas, tags, sacolas, linhas, aviamentos e material de loja.",
    icon: "G",
    city: "santa_cruz_do_capibaribe",
  },
];

export default async function ServicesPage() {
  const providers = await getServiceProviders();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Portal de Servicos</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight md:text-5xl">O hub do Polo para resolver rapido</h1>
          <p className="mt-3 max-w-3xl text-sm font-bold text-neutral-300 md:text-base">
            Encontre mecanicos, costureiras, graficas, freteiros e prestadores que sustentam a rotina de Caruaru, Toritama e Santa Cruz.
          </p>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          {serviceHighlights.map((item) => {
            return (
              <article className="rounded-[8px] border border-neutral-200 bg-white p-4 shadow-sm" key={item.title}>
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-[#ffd700] text-neutral-950">
                    <span className="text-xl font-black">{item.icon}</span>
                  </span>
                  <div>
                    <h2 className="text-lg font-black uppercase text-neutral-950">{item.title}</h2>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-neutral-600">{item.text}</p>
                  </div>
                </div>
                <DemandActionButton
                  label="Solicitar servico"
                  payload={{
                    tipo: "servico_tecnico",
                    segmento: "servicos",
                    cidade: item.city,
                    titulo: item.title,
                    descricao: item.text,
                    urgente: false,
                    detalhes: { origem_card: item.title },
                  }}
                  successLabel="Demanda enviada"
                />
              </article>
            );
          })}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black uppercase text-neutral-950">Prestadores em destaque</h2>
                <p className="mt-1 text-sm font-bold text-neutral-500">Contatos completos ficam liberados para prestadores PRO e gerencia Caruano.</p>
              </div>
              <Link className="grid min-h-11 place-items-center rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white transition hover:bg-neutral-800 active:scale-95" href="/login?next=/servicos">
                Entrar
              </Link>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {providers.map((provider) => (
                <article className="rounded-[8px] border border-neutral-200 bg-neutral-50 p-4" key={provider.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase text-[#f58220]">{provider.city}</p>
                      <h3 className="mt-1 text-xl font-black uppercase text-neutral-950">{provider.category}</h3>
                    </div>
                    {provider.isPro ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 text-xs font-black uppercase text-[#ffd700]">
                        PRO
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 min-h-16 text-sm font-bold leading-relaxed text-neutral-700">{provider.description}</p>
                  <div className="mt-4 rounded-[8px] border border-dashed border-neutral-300 bg-white p-3">
                    <div className="flex items-center gap-2 text-sm font-black uppercase text-neutral-950">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-950 text-xs text-white">!</span>
                      Nova solicitacao em aberto
                    </div>
                    <p className="mt-2 text-xs font-bold text-neutral-600">
                      Seja PRO para ver o contato do cliente e responder chamados antes da concorrencia.
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <DemandActionButton
                      label="Solicitar servico"
                      payload={{
                        tipo: "servico_tecnico",
                        segmento: "servicos",
                        cidade: "caruaru",
                        titulo: `Solicitacao para ${provider.category}`,
                        descricao: provider.description,
                        detalhes: { prestador_id: provider.id, categoria: provider.category },
                      }}
                      successLabel="Solicitado"
                    />
                    <Link className="grid min-h-11 place-items-center rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white transition hover:bg-neutral-800 active:scale-95" href="/login?next=/servicos">
                      Seja PRO
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[8px] bg-[#ffd700] p-4 text-neutral-950 shadow-sm">
            <p className="text-sm font-black uppercase">Monetizacao PRO</p>
            <h2 className="mt-2 text-2xl font-black uppercase leading-tight">Receba chamados antes dos concorrentes</h2>
            <p className="mt-3 text-sm font-bold leading-relaxed">
              O prestador PRO aparece em destaque e desbloqueia contatos de clientes que precisam de manutencao, frete, costura, grafica e apoio operacional.
            </p>
            <Link className="mt-4 grid min-h-12 place-items-center rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase text-white transition hover:bg-neutral-800 active:scale-95" href="/login?next=/servicos">
              Assinar PRO
            </Link>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
