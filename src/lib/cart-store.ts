"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/data/products";

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  priceWithVat: number;
  vatRate: number;
  bulky: boolean;
  photo: string;
  qty: number;
  /** "own" — skladem u nás; "supplier" — objednáme u dodavatele. Default "own". */
  fulfillment?: "own" | "supplier";
  /** UUID supplier_products pro hand-off dodavateli. */
  supplierProductId?: string;
  /** Brand slug (pro mail Janovi: „Sportimport / ISAAC / Boson…"). */
  brand?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Inkrementuje při změně, použité pro animace v UI. */
  lastAddedAt: number | null;

  add: (product: Product, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;

  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      lastAddedAt: null,

      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, qty: i.qty + qty } : i,
              ),
              lastAddedAt: Date.now(),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceWithVat: product.priceWithVat,
                vatRate: product.vatRate,
                bulky: product.bulky,
                photo: product.photo,
                qty,
                fulfillment: product.fulfillment ?? "own",
                supplierProductId: product.supplierProductId,
                brand: product.brand,
              },
            ],
            lastAddedAt: Date.now(),
          };
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        })),

      clear: () => set({ items: [] }),

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "100dola-cart",
      storage: createJSONStorage(() => localStorage),
      // Otevřený drawer state nepřežívá refresh (frustrující UX).
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// ── Derived helpers ──────────────────────────────────────────────────────────

export function getCartTotals(items: CartItem[]) {
  const subtotalWithVat = items.reduce((sum, i) => sum + i.priceWithVat * i.qty, 0);
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const hasBulky = items.some((i) => i.bulky);
  // Spočítáme částku bez DPH a samotnou DPH (sečteno přes položky s různými sazbami).
  const subtotalWithoutVat = items.reduce(
    (sum, i) => sum + Math.round(i.priceWithVat / (1 + i.vatRate / 100)) * i.qty,
    0,
  );
  const vatAmount = subtotalWithVat - subtotalWithoutVat;

  return { subtotalWithVat, subtotalWithoutVat, vatAmount, totalItems, hasBulky };
}
