"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart/cart-store";
import { GlobalSearchOverlay } from "@/components/search/global-search-overlay";

function HomeIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 14.5-4 16 0" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 6h15l-2 9H8L6 3H3" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}

function NavLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-black leading-none text-neutral-950">{children}</span>;
}

export function BottomNavigation() {
  const [searchOpen, setSearchOpen] = useState(false);
  const openCart = useCartStore((state) => state.openCart);
  const count = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-5 border-t border-neutral-300 bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.08)] md:hidden">
        <a className="grid place-items-center gap-1 text-neutral-950" href="/">
          <HomeIcon />
          <NavLabel>Home</NavLabel>
        </a>
        <a className="grid place-items-center gap-1 text-neutral-950" href="/categorias">
          <CategoriesIcon />
          <NavLabel>Categorias</NavLabel>
        </a>
        <button
          aria-label="Abrir busca global"
          className="grid place-items-center gap-1 text-neutral-950"
          onClick={() => setSearchOpen(true)}
          type="button"
        >
          <SearchIcon />
          <NavLabel>Busca</NavLabel>
        </button>
        <a className="grid place-items-center gap-1 text-neutral-950" href="/login">
          <AccountIcon />
          <NavLabel>Conta</NavLabel>
        </a>
        <button className="relative grid place-items-center gap-1 text-neutral-950" onClick={openCart} type="button">
          <CartIcon />
          <NavLabel>Carrinho</NavLabel>
          {count ? (
            <span className="absolute right-3 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
              {count}
            </span>
          ) : null}
        </button>
      </nav>
      <GlobalSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
