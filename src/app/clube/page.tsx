import { cookies } from "next/headers";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { createSupabaseRequestClient } from "@/lib/auth/session";
import { getActiveBenefits, type BenefitOffer } from "@/lib/data/benefits";
import { getConsumptionProfileByUser, type ConsumptionProfile } from "@/lib/data/consumption-profile";

export const dynamic = "force-dynamic";

function formatPercent(value: number | null) {
  if (!value) return "Beneficio";
  return `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% OFF`;
}

function getTokenFromCookieStore(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const appCookie = cookieStore.get("caruano_session_access_token")?.value;

  if (appCookie) return appCookie;

  const authCookie = cookieStore.getAll().find((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));

  if (!authCookie?.value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(authCookie.value));
    return parsed?.access_token || parsed?.[0] || null;
  } catch {
    return null;
  }
}

function scoreBenefit(benefit: BenefitOffer, profile: ConsumptionProfile | null) {
  const category = (benefit.categoria || "").toLowerCase();

  if (!profile) return 0;
  if (category.includes("energia") && Number(profile.gasto_medio_energia || 0) >= 500) return 30;
  if (category.includes("seguro") && profile.possui_veiculo) return 30;
  if (category.includes("saude")) return 10;
  return 0;
}

async function getLoggedProfile() {
  const cookieStore = await cookies();
  const token = getTokenFromCookieStore(cookieStore);

  if (!token) return null;

  const supabase = createSupabaseRequestClient(token);
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser(token);
  if (!data.user) return null;

  return getConsumptionProfileByUser(data.user.id);
}

export default async function BenefitsClubPage() {
  const [benefits, profile] = await Promise.all([getActiveBenefits(), getLoggedProfile()]);
  const orderedBenefits = [...benefits].sort((a, b) => scoreBenefit(b, profile) - scoreBenefit(a, profile));

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Clube Caruano</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight md:text-5xl">Beneficios para a economia regional</h1>
          <p className="mt-3 max-w-3xl text-sm font-bold text-neutral-300 md:text-base">
            Seguros para motos, vans e caminhoes, planos de saude, energia solar e servicos especiais para quem compra, vende e transporta no Polo do Agreste.
          </p>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { title: "Energia Solar", text: "Reduza custo fixo da loja, fabrica ou galpao." },
            { title: "Seguros", text: "Protecao para moto, van, toyota, carro e carga." },
            { title: "Saude e Servicos", text: "Beneficios para equipes, lojistas e familias." },
          ].map((item) => (
            <article className="rounded-[8px] border border-neutral-200 bg-white p-4 shadow-sm" key={item.title}>
              <p className="text-xs font-black uppercase text-[#f58220]">{item.title}</p>
              <p className="mt-2 text-sm font-bold text-neutral-700">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase text-neutral-950">Ofertas do Clube</h2>
              <p className="mt-1 text-sm font-bold text-neutral-500">
                {profile ? "Ordenado pelo seu perfil de consumo." : "Entre na sua conta para receber recomendacoes mais certeiras."}
              </p>
            </div>
            <a className="grid min-h-11 place-items-center rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" href="/login?next=/clube">
              Minha conta
            </a>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {orderedBenefits.map((benefit) => (
              <article className="rounded-[8px] border border-neutral-200 bg-neutral-50 p-4" key={benefit.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-[#f58220]">{benefit.categoria || "Beneficio"}</p>
                    <h3 className="mt-1 text-xl font-black uppercase text-neutral-950">{benefit.titulo}</h3>
                  </div>
                  <span className="rounded-full bg-[#ffd700] px-3 py-1 text-xs font-black uppercase text-neutral-950">{formatPercent(benefit.desconto_percentual)}</span>
                </div>
                <p className="mt-3 min-h-16 text-sm font-bold leading-relaxed text-neutral-700">
                  {benefit.descricao_beneficio || "Beneficio especial negociado pelo Caruano para parceiros do Agreste."}
                </p>
                {benefit.lojistas?.nome_fantasia ? (
                  <p className="mt-3 text-xs font-black uppercase text-neutral-500">Parceiro: {benefit.lojistas.nome_fantasia}</p>
                ) : null}
                <a
                  className="mt-4 grid min-h-11 place-items-center rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white"
                  href={benefit.link_adesao || "/login?next=/clube"}
                  rel={benefit.link_adesao ? "noreferrer" : undefined}
                  target={benefit.link_adesao ? "_blank" : undefined}
                >
                  Quero aderir
                </a>
              </article>
            ))}
            {!orderedBenefits.length ? (
              <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500 md:col-span-2 xl:col-span-3">
                Beneficios em cadastramento. Aguarde as primeiras ofertas do Clube Caruano.
              </p>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
