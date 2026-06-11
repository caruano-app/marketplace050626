"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  cartId: string;
  productId: string;
  lojistaId: string;
  storeName: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  variationId?: string | null;
  size?: string;
  color?: string;
  colorValue?: string;
  extras?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "cartId" | "quantity"> & { quantity?: number }) => void;
  increment: (cartId: string) => void;
  decrement: (cartId: string) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
};

function makeCartId(item: Omit<CartItem, "cartId" | "quantity">) {
  return [item.productId, item.variationId || "", item.size || "", item.color || "", item.extras || ""].join("|");
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) =>
        set((state) => {
          const cartId = makeCartId(item);
          const quantity = item.quantity || 1;
          const existing = state.items.find((cartItem) => cartItem.cartId === cartId);

          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((cartItem) =>
                cartItem.cartId === cartId ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem,
              ),
            };
          }

          return {
            isOpen: true,
            items: [...state.items, { ...item, cartId, quantity }],
          };
        }),
      increment: (cartId) =>
        set((state) => ({
          items: state.items.map((item) => (item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item)),
        })),
      decrement: (cartId) =>
        set((state) => ({
          items: state.items.map((item) => (item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item)),
        })),
      removeItem: (cartId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartId !== cartId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "caruano-cart",
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => ({
        ...current,
        items: Array.isArray((persisted as Partial<CartState> | undefined)?.items)
          ? (persisted as Partial<CartState>).items || []
          : [],
        isOpen: false,
      }),
    },
  ),
);
