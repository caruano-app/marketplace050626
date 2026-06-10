"use client";

import { useCartStore } from "@/lib/cart/cart-store";

export function CartHeaderButton() {
  const openCart = useCartStore((state) => state.openCart);
  const count = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));

  return (
    <button className="relative grid h-11 w-11 place-items-center text-xs font-black uppercase leading-none text-neutral-950" onClick={openCart} type="button">
      Bag
      {count ? (
        <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
