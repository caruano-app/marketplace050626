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

function categoryName(product: ProdutoVitrine) {
  const specs = product.especificacoes_tecnicas as { categoria_nome?: string; categoria_mestre_id?: number } | null | undefined;
  const subcategory = Array.isArray(product.subcategorias_mestre) ? product.subcategorias_mestre[0] : product.subcategorias_mestre;
  const category = Array.isArray(subcategory?.categorias_mestre) ? subcategory?.categorias_mestre[0] : subcategory?.categorias_mestre;
  return specs?.categoria_nome || category?.nome_categoria || null;
}

function segmentName(product: ProdutoVitrine) {
  const source = `${categoryName(product) || ""} ${product.nome_produto || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/(aliment|bebida|mercado|hortifruti|comida|mercearia|padaria)/.test(source)) return "alimentacao";
  if (/(tecido|rolo|aviamento|malha|algodao|gramatura)/.test(source)) return "tecidos";
  if (/(moda|femin|mascul|infantil|jeans|fitness|camisaria|calcado|textil|confeccao)/.test(source)) return "moda";
  return null;
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
          categoryName: categoryName(product),
          segment: segmentName(product),
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
