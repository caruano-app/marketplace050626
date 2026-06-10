import { ProductCard } from "@/components/product/product-card";
import type { ProdutoVitrine } from "@/types/database";

type StoreProductSectionProps = {
  title: string;
  note?: string;
  products: ProdutoVitrine[];
};

export function StoreProductSection({ title, note = "Area para adicionar os cards dos produtos 1132x482 pixel", products }: StoreProductSectionProps) {
  return (
    <section className="mt-3 rounded-[6px] border border-neutral-300 bg-white p-2">
      <div className="mb-2 flex h-8 items-center gap-4">
        <h2 className="text-xl font-black text-neutral-950">{title}</h2>
        <p className="hidden flex-1 text-center text-sm font-black uppercase text-neutral-500 md:block">{note}</p>
        <a className="text-lg font-black text-neutral-950" href="/produtos">Ver todos v</a>
      </div>
      <div className="caruano-product-grid pb-1">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
