"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Recently viewed: posledních 12 produktů co user navštívil v PDP.
 * Push při open PDP (přes ProductViewTracker).
 * LRU — nejnovější nahoře, duplicity dedupované.
 */
const MAX_ITEMS = 12;

export interface RecentItem {
  id: number;
  slug: string;
  name: string;
  brand: string;
  priceWithVat: number;
  photo: string;
  viewedAt: number;
}

interface RecentState {
  items: RecentItem[];
  push: (item: Omit<RecentItem, "viewedAt">) => void;
  remove: (id: number) => void;
  clear: () => void;
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      push: (item) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== item.id);
          const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
          return { items: next };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "100dola-recently-viewed",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
