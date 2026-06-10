import Image from "next/image";
import { getFeaturedProducts } from "@/lib/data/products";
import type { ProdutoVitrine } from "@/types/database";

type OfferTileProps = {
  product: ProdutoVitrine;
  size: "mini" | "wide" | "tall";
};

function imageUrl(product: ProdutoVitrine) {
  return product.imagens_url?.[0] || null;
}

function OfferBadge() {
  return (
    <span className="absolute bottom-2 right-2 rounded-[3px] bg-[#ff314f] px-2 py-1 text-[11px] font-black uppercase text-white">
      35% OFF
    </span>
  );
}

function OfferTile({ product, size }: OfferTileProps) {
  const src = imageUrl(product);
  const sizeClass =
    size === "tall"
      ? "h-[368px] w-[320px]"
      : size === "wide"
        ? "h-[180px] w-[320px]"
        : "h-[180px] w-[156px]";

  return (
    <a
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[3px] border border-neutral-300 bg-neutral-200 ${sizeClass}`}
      href={`/product/${product.id}`}
    >
      {src ? (
        <Image
          alt={product.nome_produto}
          blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          className="object-cover"
          fill
          placeholder="blur"
          sizes={size === "mini" ? "156px" : "320px"}
          src={src}
        />
      ) : (
        <div className="text-center text-[9px] font-black uppercase leading-tight text-neutral-500">
          Imagem do produto
          <br />
          {size === "tall" ? "320x368 pixel" : size === "wide" ? "320x180 pixel" : "156x180 pixel"}
        </div>
      )}
      <OfferBadge />
    </a>
  );
}

function QuadOfferBlock({ products }: { products: ProdutoVitrine[] }) {
  return (
    <div className="rounded-[5px] border border-neutral-300 bg-white p-2">
      <h3 className="mb-2 text-center text-sm font-black text-neutral-950">Ofertas para assinantes</h3>
      <div className="grid grid-cols-2 justify-items-center gap-2">
        {products.slice(0, 4).map((product) => (
          <OfferTile key={product.id} product={product} size="mini" />
        ))}
      </div>
    </div>
  );
}

function LargeOfferBlock({ products }: { products: ProdutoVitrine[] }) {
  const mainProduct = products[0];

  return (
    <div className="rounded-[5px] border border-neutral-300 bg-white p-2">
      <h3 className="mb-2 text-center text-sm font-black text-neutral-950">Ofertas para assinantes</h3>
      <div className="relative mx-auto h-[368px] w-[320px]">
        <OfferTile product={mainProduct} size="tall" />
        <div className="pointer-events-none absolute left-4 top-[130px] rotate-[-18deg] text-center text-[11px] font-black uppercase leading-tight text-neutral-700">
          Area do card
          <br />
          do produto
          <br />
          335x430 pixel
        </div>
      </div>
    </div>
  );
}

function WideOfferBlock({ products }: { products: ProdutoVitrine[] }) {
  return (
    <div className="rounded-[5px] border border-neutral-300 bg-white p-2">
      <h3 className="mb-2 text-center text-sm font-black text-neutral-950">Ofertas para assinantes</h3>
      <div className="relative mx-auto grid h-[368px] w-[320px] grid-rows-2 gap-2">
        {products.slice(0, 2).map((product) => (
          <OfferTile key={product.id} product={product} size="wide" />
        ))}
        <div className="pointer-events-none absolute left-2 top-[140px] rotate-[-18deg] text-center text-[11px] font-black uppercase leading-tight text-neutral-700">
          Area do card
          <br />
          do produto
          <br />
          335x430 pixel
        </div>
      </div>
    </div>
  );
}

export async function MultiCardOffers() {
  const products = await getFeaturedProducts();
  const premiumProducts = products.length >= 8 ? products : [...products, ...products];

  return (
    <section className="mx-auto mt-3 max-w-[1412px] rounded-[6px] border border-neutral-300 bg-white p-2">
      <div className="mb-2 flex h-8 items-center gap-4">
        <h2 className="text-lg font-black text-neutral-950">Ofertas em multicards (Caruano)</h2>
        <p className="hidden flex-1 text-center text-sm font-black uppercase text-neutral-500 md:block">
          Area para adicionar os cards dos produtos 1412x482 pixel
        </p>
      </div>

      <div className="grid gap-2 lg:grid-cols-4">
        <QuadOfferBlock products={premiumProducts.slice(0, 4)} />
        <WideOfferBlock products={premiumProducts.slice(4, 6)} />
        <QuadOfferBlock products={premiumProducts.slice(2, 6)} />
        <LargeOfferBlock products={premiumProducts.slice(1, 2)} />
      </div>
    </section>
  );
}
