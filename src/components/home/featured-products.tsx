import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="mx-auto mt-3 max-w-[1412px] rounded-[6px] border border-neutral-300 bg-white p-2">
      <div className="mb-2 flex h-8 items-center gap-4">
        <h2 className="text-lg font-black text-neutral-950">Destaques da semana</h2>
        <p className="hidden flex-1 text-center text-sm font-black uppercase text-neutral-500 md:block">
          Area para adicionar os cards dos produtos 1412x482 pixel
        </p>
        <a className="text-sm font-black text-neutral-950" href="/produtos">
          Ver todos v
        </a>
      </div>

      <div className="caruano-product-grid pb-1">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
