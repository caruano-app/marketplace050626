import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getServerSessionClient } from "@/lib/auth/server-session";
import { getMerchantReplenishment } from "@/lib/data/distributor-stock";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

export default async function MerchantReplenishmentPage() {
  const session = await getServerSessionClient();

  if (!session || session.profile.perfil_principal !== "lojista") {
    redirect("/login?next=/dashboard/lojista/reabastecimento");
  }

  const { data: store } = await session.supabase
    .from("lojistas")
    .select("id,nome_fantasia")
    .eq("usuario_id", session.user.id)
    .maybeSingle();

  if (!store?.id) {
    redirect("/dashboard/lojista");
  }

  const items = await getMerchantReplenishment(session.supabase, store.id);
  const lowStock = items.filter((item) => item.currentStock < 5);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5 pb-24">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Reabastecimento</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight">Produtos acabando</h1>
          <p className="mt-2 text-sm font-bold text-neutral-300">
            Compare seu estoque local com ofertas das distribuidoras via EAN.
          </p>
        </section>

        <section className="mt-4 flex gap-3 overflow-x-auto pb-2">
          <article className="min-w-[180px] rounded-[8px] bg-[#ffd700] p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase">Estoque baixo</p>
            <p className="mt-2 text-3xl font-black">{lowStock.length}</p>
          </article>
          <article className="min-w-[180px] rounded-[8px] bg-white p-4 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Produtos com EAN</p>
            <p className="mt-2 text-3xl font-black">{items.length}</p>
          </article>
        </section>

        <section className="mt-4 grid gap-3">
          {items.map((item) => (
            <article className="rounded-[8px] bg-white p-4 shadow-sm" key={`${item.productId}-${item.ean}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black uppercase text-neutral-950">{item.productName}</p>
                  <p className="mt-1 text-xs font-bold text-neutral-500">SKU {item.sku} | EAN {item.ean}</p>
                </div>
                <span className={`rounded-full px-3 py-2 text-xs font-black uppercase ${item.currentStock < 5 ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-700"}`}>
                  Estoque {item.currentStock}
                </span>
              </div>

              {item.bestOffer ? (
                <div className="mt-4 rounded-[8px] border border-[#ffd700] bg-[#fff8d6] p-3">
                  <p className="text-xs font-black uppercase text-neutral-600">Melhor oferta encontrada</p>
                  <p className="mt-1 text-lg font-black text-neutral-950">{item.bestOffer.nome_produto || item.productName}</p>
                  <p className="mt-1 text-sm font-bold text-neutral-700">
                    {item.bestOffer.lojistas?.nome_fantasia || "Distribuidora parceira"} - {formatPrice(item.bestOffer.preco_venda_b2b)} - estoque {item.bestOffer.estoque_disponivel}
                  </p>
                </div>
              ) : (
                <p className="mt-4 rounded-[8px] border border-dashed border-neutral-300 p-3 text-sm font-black uppercase text-neutral-500">
                  Nenhuma distribuidora com oferta para este EAN.
                </p>
              )}

              {item.alertStatus ? (
                <p className="mt-3 text-sm font-black text-[#f58220]">
                  Alerta {item.alertStatus}. Quantidade sugerida: {item.suggestedQuantity || "-"}.
                </p>
              ) : null}
            </article>
          ))}

          {!items.length ? (
            <p className="rounded-[8px] border border-dashed border-neutral-300 bg-white p-6 text-center text-sm font-black uppercase text-neutral-500">
              Nenhum produto com EAN encontrado para comparar.
            </p>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
