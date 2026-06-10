import { ProductCard } from "@/components/product/product-card";
import { getFeaturedProducts } from "@/lib/data/products";
import { SectionHeading } from "./section-heading";

export async function FairOffers() {
  const products = await getFeaturedProducts();

  return (
    <section className="mx-auto mt-3 max-w-[1412px] rounded-[6px] border border-neutral-300 bg-white p-2 lg:h-[482px]">
      <SectionHeading
        title="Ofertas da feira"
        note="Area do card para adicionar os produtos 1412x482 pixel"
        href="/ofertas-da-feira"
        actionLabel="Ver todas v"
      />

      <div className="caruano-product-grid pb-1">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
