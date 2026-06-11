import Image from "next/image";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { VerifiedBadge } from "@/components/common/verified-badge";
import { isIdentityVerified } from "@/lib/data/verification";
import type { LojistaResumo, ProdutoVitrine } from "@/types/database";

type ProductCardProps = {
  product: ProdutoVitrine;
};

function getStoreName(store: ProdutoVitrine["lojistas"]) {
  if (!store) {
    return "Loja Caruano";
  }

  if (Array.isArray(store)) {
    return store[0]?.nome_fantasia ?? "Loja Caruano";
  }

  return (store as LojistaResumo).nome_fantasia;
}

function getStore(store: ProdutoVitrine["lojistas"]) {
  if (!store) return null;
  return Array.isArray(store) ? store[0] || null : (store as LojistaResumo);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imagens_url?.[0];
  const description = product.descricao_completa || "Produto disponivel no catalogo Caruano.";
  const store = getStore(product.lojistas);
  const verified = isIdentityVerified(store?.usuarios);

  return (
    <article className="flex h-[360px] w-full min-w-0 flex-col overflow-hidden rounded-[6px] border border-neutral-300 bg-white shadow-sm md:h-[420px]">
      <div className="relative grid h-[170px] place-items-center bg-neutral-300 md:h-[230px]">
        {imageUrl ? (
          <Image
            alt={product.nome_produto}
            className="object-cover"
            fill
            placeholder="blur"
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            sizes="265px"
            src={imageUrl}
          />
        ) : (
          <div className="text-center text-[10px] font-black uppercase text-neutral-600 md:text-xs">
            Area do card
            <br />
            do produto
            <br />
            265x420 pixel
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 py-2">
        <p className="flex items-center gap-1 text-[9px] font-black uppercase text-neutral-600 md:text-[10px]">
          <span className="line-clamp-1">Vendido e entregue por {product.vendido_e_entregue_por || getStoreName(product.lojistas)}</span>
          {verified ? <VerifiedBadge size="sm" /> : null}
        </p>
        <h3 className="line-clamp-1 text-[13px] font-black uppercase leading-tight text-neutral-950 md:text-[15px]">
          {product.nome_produto}
        </h3>
        <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-neutral-700 md:text-[11px]">{description}</p>
        <p className="mt-2 text-[10px] font-bold text-neutral-950 md:text-[11px]">4.8 *****</p>

        <div className="mt-auto">
          <div className="flex items-end gap-3">
            <span className="text-[10px] font-bold text-neutral-500 line-through md:text-[11px]">R$ 69,90</span>
            <span className="text-lg font-black text-[#f58220] md:text-2xl">{formatPrice(product.preco_base_varejo)}</span>
          </div>
          <div className="mt-2 grid grid-cols-[64px_1fr] gap-2 sm:grid-cols-[78px_1fr]">
            <a
              className="grid h-9 place-items-center rounded-[3px] bg-neutral-950 text-xs font-black uppercase text-white"
              href={`/product/${product.id}`}
            >
              Ver
            </a>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}
