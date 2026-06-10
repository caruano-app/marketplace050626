"use client";

import type { ProdutoVitrine } from "@/types/database";
import { useCartStore } from "@/lib/cart/cart-store";

type AddToCartButtonProps = {
  product: ProdutoVitrine;
  quantity?: number;
  size?: string;
  color?: string;
  colorValue?: string;
  extras?: string;
  variationId?: string | null;
  unitPrice?: number;
  className?: string;
  children?: React.ReactNode;
};

function storeName(product: ProdutoVitrine) {
  const store = Array.isArray(product.lojistas) ? product.lojistas[0] : product.lojistas;
  return store?.nome_fantasia || "Loja Caruano";
}

export function AddToCartButton({
  product,
  quantity = 1,
  size,
  color,
  colorValue,
  extras,
  variationId,
  unitPrice,
  className = "h-9 rounded-[3px] bg-[#f6b900] text-xs font-black uppercase text-neutral-950",
  children = "Carrinho",
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      className={className}
      onClick={() =>
        addItem({
          productId: product.id,
          lojistaId: product.lojista_id || "lojista-pendente",
          storeName: storeName(product),
          name: product.nome_produto,
          sku: product.codigo_referencia_sku,
          imageUrl: product.imagens_url?.[0] || null,
          unitPrice: unitPrice || product.preco_base_varejo,
          quantity,
          variationId,
          size,
          color,
          colorValue,
          extras,
        })
      }
      type="button"
    >
      {children}
    </button>
  );
}
