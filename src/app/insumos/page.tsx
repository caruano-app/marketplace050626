import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/product/product-card";
import { getFeaturedProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

const hubs = [
  {
    title: "Sacolas e embalagens",
    text: "Sacolas personalizadas, caixas, tags e embalagens para pronta entrega.",
  },
  {
    title: "Graficas e etiquetas",
    text: "Etiquetas, composicoes, tags, adesivos e material de ponto de venda.",
  },
  {
    title: "Ferragens e maquinas",
    text: "Pecas, manutencao, aviamentos, agulhas, linhas e suporte para producao.",
  },
];

export default async function SuppliesHubPage() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-[1412px] px-4 py-5">
        <section className="rounded-[8px] bg-neutral-950 p-5 text-white">
          <p className="text-sm font-black uppercase text-[#ffd700]">Hub B2B Caruano</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-tight md:text-5xl">Insumos para sua Fabrica</h1>
          <p className="mt-3 max-w-3xl text-sm font-bold text-neutral-300 md:text-base">
            Sacolas, etiquetas, graficas, ferragens, pecas de maquinas e fornecedores oficiais para manter sua producao girando.
          </p>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          {hubs.map((hub) => (
            <article className="rounded-[8px] border border-neutral-200 bg-white p-4 shadow-sm" key={hub.title}>
              <p className="text-xs font-black uppercase text-[#f58220]">Fornecedor oficial</p>
              <h2 className="mt-1 text-xl font-black uppercase text-neutral-950">{hub.title}</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-neutral-700">{hub.text}</p>
              <a className="mt-4 grid min-h-11 place-items-center rounded-[6px] bg-[#ffd700] px-4 text-sm font-black uppercase text-neutral-950" href="/clube">
                Solicitar parceiro
              </a>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-[8px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase text-neutral-950">Vitrine de parceiros</h2>
              <p className="mt-1 text-sm font-bold text-neutral-500">Produtos e parceiros podem ser marcados como fornecedor oficial no cadastro.</p>
            </div>
            <a className="grid min-h-11 place-items-center rounded-[6px] bg-neutral-950 px-4 text-sm font-black uppercase text-white" href="/dashboard/lojista/produtos/novo">
              Cadastrar insumo
            </a>
          </div>
          <div className="caruano-product-grid">
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
