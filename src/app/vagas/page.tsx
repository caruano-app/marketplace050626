import Link from "next/link";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DemandActionButton } from "@/components/services/demand-action-button";
import { getJobListings } from "@/lib/data/services-portal";

export const dynamic = "force-dynamic";

function cityToValue(city: string) {
  if (city.toLowerCase().includes("toritama")) return "toritama";
  if (city.toLowerCase().includes("santa")) return "santa_cruz_do_capibaribe";
  return "caruaru";
}

export default async function JobsPage() {
  const jobs = await getJobListings();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Vagas do Polo</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight md:text-5xl">Trabalho, diaria e freela no Agreste</h1>
          <p className="mt-3 max-w-3xl text-sm font-bold text-neutral-300 md:text-base">
            Um ponto unico para lojistas divulgarem oportunidades e profissionais encontrarem vagas de costura, atendimento, corte, entrega e apoio de feira.
          </p>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { title: "CLT e fixo", text: "Vagas para loja, fabrica, estoque e atendimento." },
            { title: "Freela e diaria", text: "Reforco rapido para producao, feira e separacao de pedidos." },
            { title: "Postagem mobile", text: "Lojista publica pelo celular e recebe candidatos no WhatsApp." },
          ].map((item) => (
            <article className="rounded-[8px] border border-neutral-200 bg-white p-4 shadow-sm" key={item.title}>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-[#ffd700] text-neutral-950">
                  <span className="text-lg font-black">V</span>
                </span>
                <div>
                  <h2 className="text-base font-black uppercase text-neutral-950">{item.title}</h2>
                  <p className="mt-1 text-sm font-bold text-neutral-600">{item.text}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black uppercase text-neutral-950">Vagas abertas</h2>
                <p className="mt-1 text-sm font-bold text-neutral-500">As candidaturas entram como demanda para triagem do Caruano.</p>
              </div>
              <Link className="grid min-h-11 place-items-center rounded-[8px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950 transition hover:bg-[#f0c400] active:scale-95" href="/login?next=/vagas">
                Postar vaga
              </Link>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {jobs.map((job) => (
                <article className="rounded-[8px] border border-neutral-200 bg-neutral-50 p-4" key={job.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase text-[#f58220]">{job.contractType}</p>
                      <h3 className="mt-1 text-xl font-black uppercase text-neutral-950">{job.title}</h3>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ffd700] text-neutral-950">
                      <span className="text-sm font-black">JOB</span>
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-black text-neutral-700">{job.storeName}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-neutral-600">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-neutral-200 text-[10px] font-black">P</span> {job.city}
                  </p>
                  <p className="mt-3 min-h-16 text-sm font-bold leading-relaxed text-neutral-700">{job.description}</p>
                  <DemandActionButton
                    label="Tenho interesse"
                    payload={{
                      tipo: "vaga_emprego",
                      segmento: "servicos",
                      cidade: cityToValue(job.city),
                      titulo: `Interesse na vaga: ${job.title}`,
                      descricao: job.description,
                      detalhes: {
                        vaga_id: job.id,
                        lojista: job.storeName,
                        tipo_contrato: job.contractType,
                      },
                    }}
                    successLabel="Interesse enviado"
                  />
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[8px] bg-neutral-950 p-4 text-white shadow-sm">
            <div className="flex items-center gap-2 text-[#ffd700]">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ffd700] text-sm font-black text-neutral-950">OK</span>
              <p className="text-sm font-black uppercase">Para lojistas</p>
            </div>
            <h2 className="mt-2 text-2xl font-black uppercase leading-tight">Publique pelo celular</h2>
            <p className="mt-3 text-sm font-bold leading-relaxed text-neutral-300">
              A versao inicial registra o interesse dos candidatos na central de demandas. Na proxima etapa, o painel do lojista tera postagem direta de vagas.
            </p>
            <Link className="mt-4 grid min-h-12 place-items-center rounded-[8px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950 transition hover:bg-[#f0c400] active:scale-95" href="/dashboard/lojista">
              Ir para painel
            </Link>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
