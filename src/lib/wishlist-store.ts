"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Wishlist je client-side persisted (localStorage). Žádný backend zatím —
 * pokud user later registruje účet, lze migrovat do DB tabulky.
 *
 * Ukládáme pouze identifikační data (id + slug + jméno + foto + cena) jako
 * snapshot, ne celý Product (zachycuje stav v době přidání; když supplier
 * smaže produkt, zachová se aspoň základní info).
 */
export interface WishlistItem {
  id: number;
  slug: string;
  name: string;
  brand: string;
  priceWithVat: number;
  photo: string;
  addedAt: number; // unix ms
}

interface WishlistState {
  items: WishlistItem[];
  add: (item: Omit<WishlistItem, "addedAt">) => void;
  remove: (id: number) => void;
  toggle: (item: Omit<WishlistItem, "addedAt">) => void;
  has: (id: number) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [{ ...item, addedAt: Date.now() }, ...state.items] };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      toggle: (item) => {
        const cur = get();
        if (cur.has(item.id)) cur.remove(item.id);
        else cur.add(item);
      },
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    {
      name: "100dola-wishlist",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
