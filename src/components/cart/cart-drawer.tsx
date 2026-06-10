"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/cart/cart-store";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function CartDrawer() {
  const { items, isOpen, closeCart, increment, decrement, removeItem } = useCartStore();
  const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <button className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={closeCart} type="button" />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
          <h2 className="text-xl font-black uppercase text-neutral-950">Carrinho</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-neutral-950 text-white" onClick={closeCart} type="button">
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length ? (
            <div className="space-y-4">
              {items.map((item) => (
                <article className="grid grid-cols-[72px_1fr] gap-3 border-b border-neutral-200 pb-4" key={item.cartId}>
                  <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded border border-neutral-300 bg-neutral-200 text-xs font-black text-neutral-500">
                    {item.imageUrl ? (
                      <Image
                        alt={item.name}
                        blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                        className="object-cover"
                        fill
                        placeholder="blur"
                        sizes="80px"
                        src={item.imageUrl}
                      />
                    ) : "IMG"}
                  </div>
                  <div>
                    <h3 className="line-clamp-1 text-sm font-black uppercase text-neutral-950">{item.name}</h3>
                    <p className="mt-1 text-xs text-neutral-600">SKU {item.sku}</p>
                    <p className="mt-1 text-xs text-neutral-700">
                      {[item.size, item.color, item.extras].filter(Boolean).join(" | ") || "Sem variacao"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="grid h-7 w-7 place-items-center border border-neutral-400 font-black" onClick={() => decrement(item.cartId)} type="button">
                          -
                        </button>
                        <span className="font-black">{item.quantity}</span>
                        <button className="grid h-7 w-7 place-items-center border border-neutral-400 font-black" onClick={() => increment(item.cartId)} type="button">
                          +
                        </button>
                      </div>
                      <button className="text-xs font-black text-red-600" onClick={() => removeItem(item.cartId)} type="button">
                        Remover
                      </button>
                    </div>
                    <p className="mt-2 text-right text-base font-black text-neutral-950">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center text-neutral-500">
              <p className="font-black uppercase">Seu carrinho esta vazio.</p>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 p-5">
          <div className="mb-4 flex justify-between text-xl font-black">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <a className="grid h-12 place-items-center rounded-[4px] bg-[#f6b900] text-base font-black uppercase text-neutral-950" href="/checkout">
            Ir para o checkout
          </a>
        </div>
      </aside>
    </div>
  );
}
