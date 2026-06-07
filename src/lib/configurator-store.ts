"use client";

import { create } from "zustand";

/**
 * Per-product configurator state — sdílený mezi ConfiguratorUI (počítá total)
 * a PDP hero price / MobileStickyCTA / AddToCartButton (zobrazuje cenu).
 *
 * Není persisted — reset po refresh stránky je OK, user vybere znovu.
 */

interface ConfiguratorState {
  // Per-product: total cena (vč. modifiers) + selected tags pro cart line item
  totals: Record<number, number | undefined>;
  selectedTags: Record<number, Record<string, string> | undefined>;

  setTotal: (productId: number, total: number, selectedTags: Record<string, string>) => void;
  clear: (productId: number) => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  totals: {},
  selectedTags: {},
  setTotal: (productId, total, selectedTags) =>
    set((state) => ({
      totals: { ...state.totals, [productId]: total },
      selectedTags: { ...state.selectedTags, [productId]: selectedTags },
    })),
  clear: (productId) =>
    set((state) => {
      const t = { ...state.totals };
      const s = { ...state.selectedTags };
      delete t[productId];
      delete s[productId];
      return { totals: t, selectedTags: s };
    }),
}));

/** Hook pro read effective price — vrátí configured total nebo undefined. */
export function useConfiguratorTotal(productId: number): number | undefined {
  return useConfiguratorStore((s) => s.totals[productId]);
}

export function useConfiguratorSelected(productId: number): Record<string, string> | undefined {
  return useConfiguratorStore((s) => s.selectedTags[productId]);
}
