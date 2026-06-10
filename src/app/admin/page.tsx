import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function AdminPage() {
  const { stores, products, logs, volume } = await getAdminDashboardData();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Master control</p>
          <h1 className="mt-1 text-3xl font-black uppercase">Admin Caruano</h1>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Novos lojistas</p>
            <div className="mt-4 flex h-24 items-end gap-2">
              {[stores.length, stores.length + 1, stores.length + 2, stores.length].map((value, index) => (
                <span className="flex-1 rounded-t bg-[#ffd700]" key={index} style={{ height: `${Math.max(16, value * 18)}px` }} />
              ))}
            </div>
          </div>
          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-500">Volume transacionado</p>
            <p className="mt-4 text-3xl font-black text-[#00a86b]">{formatPrice(volume)}</p>
          </div>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Fila de aprovacao</h2>
          <div className="mt-3 space-y-3">
            {stores.map((store) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={store.id}>
                <p className="font-black uppercase text-neutral-950">{store.nome_fantasia}</p>
                <p className="text-xs font-bold text-neutral-500">{store.status_operacao}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="min-h-11 rounded-[6px] bg-[#00a86b] text-sm font-black uppercase text-white" type="button">Aprovar</button>
                  <button className="min-h-11 rounded-[6px] bg-red-600 text-sm font-black uppercase text-white" type="button">Rejeitar</button>
                </div>
              </article>
            ))}
            {!stores.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem lojistas em analise.</p> : null}
          </div>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Produtos pendentes</h2>
          <div className="mt-3 space-y-3">
            {products.map((product) => (
              <article className="rounded-[8px] border border-neutral-200 p-4" key={product.id}>
                <p className="font-black uppercase text-neutral-950">{product.nome_produto}</p>
                <p className="text-xs font-bold text-neutral-500">SKU {product.codigo_referencia_sku}</p>
              </article>
            ))}
            {!products.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem produtos pendentes.</p> : null}
          </div>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <h2 className="text-xl font-black uppercase text-neutral-950">Banners e destaques</h2>
            <button className="mt-3 min-h-11 w-full rounded-[6px] bg-[#ffd700] text-sm font-black uppercase text-neutral-950" type="button">Trocar banner home</button>
          </div>
          <div className="rounded-[8px] bg-white p-4 shadow-sm">
            <h2 className="text-xl font-black uppercase text-neutral-950">Modo Feira</h2>
            <button className="mt-3 min-h-11 w-full rounded-[6px] bg-neutral-950 text-sm font-black uppercase text-white" type="button">Ativar aviso global</button>
          </div>
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black uppercase text-neutral-950">Seguranca e logs</h2>
          <div className="mt-3 space-y-2">
            {logs.map((log) => (
              <div className="rounded-[6px] bg-neutral-100 p-3 text-sm" key={log.id}>
                <p className="font-black text-neutral-950">{log.acao_executada}</p>
                <p className="text-xs font-bold text-neutral-500">{log.rota_acessada}</p>
              </div>
            ))}
            {!logs.length ? <p className="rounded-[8px] border border-dashed border-neutral-300 p-5 text-center text-sm font-black uppercase text-neutral-500">Sem logs recentes.</p> : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
