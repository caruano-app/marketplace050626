import { AffiliateTracker } from "@/components/affiliate/affiliate-tracker";
import { SiteHeader } from "@/components/header/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/product/product-card";
import { getAffiliateShowcase } from "@/lib/data/affiliate";

type AffiliateShowcasePageProps = {
  params: {
    codigo_afiliado: string;
  };
};

export default async function AffiliateShowcasePage({ params }: AffiliateShowcasePageProps) {
  const showcase = await getAffiliateShowcase(params.codigo_afiliado);
  const trackingAffiliate = showcase.affiliate.isReal
    ? {
        afiliadoId: showcase.affiliate.id,
        usuarioId: showcase.affiliate.usuarioId,
        codigoAfiliado: showcase.affiliate.codigoAfiliado,
        nomeAfiliado: showcase.affiliate.nomeAfiliado,
        commissionPercent: showcase.affiliate.commissionPercent,
      }
    : null;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <AffiliateTracker affiliate={trackingAffiliate} />
      <main className="mx-auto max-w-[1412px] px-4 py-6">
        <section className="rounded-[12px] border border-neutral-300 bg-[#fff8d6] p-5">
          <p className="text-sm font-black uppercase text-[#f58220]">Vendido por</p>
          <h1 className="mt-1 text-3xl font-black uppercase text-neutral-950 md:text-5xl">
            Vitrine de {showcase.affiliate.nomeAfiliado} | Produtos fornecidos por Caruano
          </h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-neutral-700">
            <span className="rounded-full bg-white px-4 py-2">{showcase.products.length} produtos na vitrine</span>
            <span className="rounded-full bg-white px-4 py-2">{showcase.stores.length} lojas aprovadas</span>
            <span className="rounded-full bg-neutral-950 px-4 py-2 text-white">
              Comissao padrao {showcase.affiliate.commissionPercent}%
            </span>
          </div>
          {!showcase.affiliate.isReal ? (
            <p className="mt-4 rounded-[8px] border border-[#f6b900] bg-white px-4 py-3 text-sm font-bold text-neutral-800">
              Esta vitrine esta em modo demonstrativo ou o afiliado ainda nao foi aprovado.
            </p>
          ) : null}
        </section>

        <section className="mt-6 rounded-[10px] border border-neutral-300 bg-neutral-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black text-neutral-950">Produtos autorizados</h2>
            <span className="text-sm font-black uppercase text-neutral-500">Revenda afiliada</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {showcase.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
