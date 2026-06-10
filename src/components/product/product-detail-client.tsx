"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { makeLeadId, persistLeadEvent, updateLocalLeadEventStatus } from "@/lib/leads/lead-events";
import type { ProdutoVitrine, VariacaoProduto } from "@/types/database";

type ProductDetailClientProps = {
  product: ProdutoVitrine;
  variations: VariacaoProduto[];
  storeName: string;
  categoryName: string;
};

const fallbackSizes = ["PP", "P", "M", "G", "GG", "XG"];
const colors = [
  { name: "Preto", value: "#171717" },
  { name: "Vermelho", value: "#ef3340" },
  { name: "Amarelo", value: "#ffe600" },
  { name: "Verde", value: "#00a86b" },
  { name: "Pink", value: "#e026a3" },
  { name: "Azul", value: "#353f9f" },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function variationToSize(variation: VariacaoProduto) {
  const normalized = variation.nome_variacao.toUpperCase();
  return fallbackSizes.find((size) => normalized.includes(size)) || variation.nome_variacao;
}

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ProductDetailClient({ product, variations, storeName, categoryName }: ProductDetailClientProps) {
  const sizes = useMemo(() => {
    const parsed = variations.map(variationToSize);
    return parsed.length ? Array.from(new Set(parsed)) : fallbackSizes;
  }, [variations]);

  const [selectedSize, setSelectedSize] = useState(sizes[0] || "P");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [hasPocket, setHasPocket] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [leadName, setLeadName] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [status, setStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  const selectedPrice = hasPocket ? product.preco_base_varejo : Math.max(product.preco_base_varejo - 10, 0);
  const subtotal = selectedPrice * quantity;
  const selectedVariation = variations.find((variation) => variationToSize(variation) === selectedSize);

  async function finalizeOrder() {
    if (!leadName || !leadWhatsapp) {
      setStatus("Informe nome e WhatsApp para finalizar.");
      return;
    }

    setProcessing(true);
    setStatus("Processando pedido...");

    const message = [
      "Pedido Caruano",
      `Cliente: ${leadName}`,
      `WhatsApp: ${leadWhatsapp}`,
      `Produto: ${product.nome_produto}`,
      `SKU: ${product.codigo_referencia_sku}`,
      `Loja: ${storeName}`,
      `Categoria: ${categoryName}`,
      `Tamanho: ${selectedSize}`,
      `Cor: ${selectedColor.name}`,
      `Opcao: ${hasPocket ? "Com Bolso" : "Sem Bolso"}`,
      `Quantidade: ${quantity}`,
      `Subtotal: ${formatPrice(subtotal)}`,
    ].join("\n");
    const leadId = makeLeadId();
    const saved = await persistLeadEvent({
      id: leadId,
      createdAt: new Date().toISOString(),
      origin: "pdp_direto",
      status: "pending_db",
      customerName: leadName,
      whatsapp: leadWhatsapp,
      message,
      total: subtotal,
      lojistaId: product.lojista_id,
      storeName,
      categoryId: product.subcategoria_id || null,
      productId: product.id,
      items: [{
        productId: product.id,
        lojistaId: product.lojista_id || "lojista-pendente",
        storeName,
        name: product.nome_produto,
        sku: product.codigo_referencia_sku,
        quantity,
        unitPrice: selectedPrice,
        size: selectedSize,
        color: selectedColor.name,
        extras: hasPocket ? "Com Bolso" : "Sem Bolso",
      }],
    });

    if (!saved) {
      updateLocalLeadEventStatus(leadId, "whatsapp_opened");
    }

    setProcessing(false);
    setStatus(saved ? "Lead salvo. Abrindo WhatsApp..." : "Lead salvo localmente. Abrindo WhatsApp...");
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-3">
      <div className="rounded-[10px] border border-neutral-400 bg-white p-5">
        <h2 className="text-xl font-black uppercase text-neutral-950">Variacoes do produto</h2>

        <div className="mt-3">
          <p className="text-base font-black uppercase text-neutral-950">Tamanhos</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                className={`grid h-9 min-w-10 place-items-center rounded-[3px] border px-3 text-base font-black ${selectedSize === size ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-400 bg-white text-neutral-950"}`}
                key={size}
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-base font-black uppercase text-neutral-950">Cores</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                className={`h-10 w-16 rounded-[4px] border-2 ${selectedColor.name === color.name ? "border-neutral-950" : "border-transparent"}`}
                key={color.name}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color.value }}
                title={color.name}
                type="button"
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-neutral-600">{selectedColor.name}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <button
            className={`rounded-[4px] px-4 py-2 text-left font-black ${hasPocket ? "bg-[#fff48a]" : "bg-neutral-100"}`}
            onClick={() => setHasPocket(true)}
            type="button"
          >
            <span className="block uppercase">Com bolso</span>
            <span className="text-2xl">{formatPrice(product.preco_base_varejo)}</span>
          </button>
          <button
            className={`rounded-[4px] px-4 py-2 text-left font-black ${!hasPocket ? "bg-[#fff48a]" : "bg-neutral-100"}`}
            onClick={() => setHasPocket(false)}
            type="button"
          >
            <span className="block uppercase">Sem bolso</span>
            <span className="text-2xl">{formatPrice(Math.max(product.preco_base_varejo - 10, 0))}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AddToCartButton
          className="h-12 rounded-[3px] bg-[#f6b900] text-base font-black uppercase text-neutral-950"
          color={selectedColor.name}
          colorValue={selectedColor.value}
          extras={hasPocket ? "Com Bolso" : "Sem Bolso"}
          product={product}
          quantity={quantity}
          size={selectedSize}
          unitPrice={selectedPrice}
          variationId={selectedVariation?.id || null}
        >
          Adicionar ao carrinho
        </AddToCartButton>
        <button className="h-12 rounded-[3px] bg-[#00a86b] text-base font-black uppercase text-white" type="button">
          Compartilhar
        </button>
      </div>

      <div className="rounded-[10px] border border-neutral-400 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-neutral-950">Resumo do pedido</h2>
          <span className="text-xs font-black">{quantity} Item</span>
        </div>

        <div className="grid grid-cols-[72px_1fr_auto] gap-3">
          <div className="grid h-16 place-items-center rounded-[4px] border border-neutral-300 bg-neutral-200 text-xs font-black text-neutral-500">
            IMG
          </div>
          <div>
            <p className="line-clamp-2 text-base leading-tight text-neutral-700">{product.descricao_completa || product.nome_produto}</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="grid h-6 min-w-6 place-items-center rounded border border-neutral-400 font-black">{selectedSize}</span>
              <span className="h-5 w-5 rounded-[2px]" style={{ backgroundColor: selectedColor.value }} />
              <span>{selectedColor.name}</span>
              <span>{hasPocket ? "Com Bolso" : "Sem Bolso"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded border border-neutral-400 text-xl font-black" onClick={() => setQuantity(Math.max(1, quantity - 1))} type="button">
              -
            </button>
            <span className="text-3xl font-black">{quantity}</span>
            <button className="grid h-9 w-9 place-items-center rounded border border-neutral-400 text-xl font-black" onClick={() => setQuantity(quantity + 1)} type="button">
              +
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-lg font-black">
          <span>Sub total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input className="h-11 border border-neutral-300 px-3 text-sm font-bold outline-none" onChange={(event) => setLeadName(event.target.value)} placeholder="Seu nome" value={leadName} />
          <input
            className="h-11 border border-neutral-300 px-3 text-sm font-bold outline-none"
            onChange={(event) => setLeadWhatsapp(formatWhatsapp(event.target.value))}
            placeholder="WhatsApp"
            value={leadWhatsapp}
          />
        </div>
        <button className="mt-3 h-12 w-full rounded-[4px] bg-[#f6b900] text-lg font-black uppercase text-neutral-950 disabled:opacity-70" disabled={processing} onClick={finalizeOrder} type="button">
          {processing ? "Processando pedido..." : "Finalizar pedido"}
        </button>
        {status ? <p className="mt-2 text-center text-xs font-bold text-red-700">{status}</p> : null}
        <p className="mt-2 text-center text-xs font-bold">Nenhum pagamento e cobrado nesta etapa.</p>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-neutral-300 bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] md:hidden">
        <button className="h-12 w-full rounded-[4px] bg-[#f6b900] text-lg font-black uppercase text-neutral-950 disabled:opacity-70" disabled={processing} onClick={finalizeOrder} type="button">
          {processing ? "Processando..." : "Finalizar pedido"}
        </button>
      </div>
    </div>
  );
}
