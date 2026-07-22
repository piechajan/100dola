"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/data/products";

/** Volitelná varianta (velikost / barva) zvolená na PDP. */
export interface CartVariant {
  size?: string;
  color?: string;
  /** Foto varianty (barvy) — přepíše product.photo v košíku. */
  photo?: string;
}

export interface CartItem {
  /** Unikátní klíč řádku = productId + varianta (aby šly různé barvy/velikosti vedle sebe). */
  lineId: string;
  productId: number;
  slug: string;
  name: string;
  priceWithVat: number;
  vatRate: number;
  bulky: boolean;
  photo: string;
  qty: number;
  size?: string;
  color?: string;
  /** "own" — skladem u nás; "supplier" — objednáme u dodavatele. Default "own". */
  fulfillment?: "own" | "supplier";
  /** UUID supplier_products pro hand-off dodavateli. */
  supplierProductId?: string;
  /** Brand slug (pro mail Janovi: „Sportimport / ISAAC / Boson…"). */
  brand?: string;
}

/** Stabilní klíč řádku košíku z produktu + varianty. */
export function cartLineId(productId: number, variant?: CartVariant): string {
  return `${productId}|${variant?.size ?? ""}|${variant?.color ?? ""}`;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Inkrementuje při změně, použité pro animace v UI. */
  lastAddedAt: number | null;

  add: (product: Product, qty?: number, variant?: CartVariant) => void;
  remove: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
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

      add: (product, qty = 1, variant) =>
        set((state) => {
          const lineId = cartLineId(product.id, variant);
          const existing = state.items.find((i) => i.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === lineId ? { ...i, qty: i.qty + qty } : i,
              ),
              lastAddedAt: Date.now(),
            };
          }
          return {
            items: [
              ...state.items,
              {
                lineId,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceWithVat: product.priceWithVat,
                vatRate: product.vatRate,
                bulky: product.bulky,
                photo: variant?.photo ?? product.photo,
                qty,
                size: variant?.size,
                color: variant?.color,
                fulfillment: product.fulfillment ?? "own",
                supplierProductId: product.supplierProductId,
                brand: product.brand,
              },
            ],
            lastAddedAt: Date.now(),
          };
        }),

      remove: (lineId) =>
        set((state) => ({
          items: state.items.filter((i) => i.lineId !== lineId),
        })),

      setQty: (lineId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.lineId === lineId ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        })),

      clear: () => set({ items: [] }),

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "100dola-cart",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // Otevřený drawer state nepřežívá refresh (frustrující UX).
      partialize: (state) => ({ items: state.items }),
      // Staré položky (v1) nemají lineId → dopočítej z productId, ať fungují qty/remove.
      migrate: (persisted: unknown, version) => {
        const state = persisted as { items?: CartItem[] } | undefined;
        if (state?.items && version < 2) {
          state.items = state.items.map((i) => ({
            ...i,
            lineId: i.lineId ?? cartLineId(i.productId, { size: i.size, color: i.color }),
          }));
        }
        return state as { items: CartItem[] };
      },
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
