"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";

interface Props {
  /** Identifikátor kategorie, např. „trenazery-chytre". */
  categoryId: string;
  /** Lidsky čitelný název pro reporting („Chytré trenažéry"). */
  name: string;
  /** Slugy produktů v kategorii — Meta je použije pro remarketing. */
  productSlugs: string[];
}

/**
 * ViewContent na stránce kategorie.
 *
 * Doteď se událost pouštěla jen z detailu produktu. Reklamy ale často míří
 * na výpis kategorie („všechny trenažéry") a tam Meta nedostávala signál —
 * kampaň optimalizovaná na Zobrazení obsahu se pak učila naslepo.
 *
 * `content_type: "product_group"` schválně odlišuje tuhle událost od detailu
 * produktu, ať jde ve vyhodnocení poznat, co byl jen rozhled po kategorii
 * a co skutečný zájem o konkrétní kus.
 */
export default function CategoryViewTracker({ categoryId, name, productSlugs }: Props) {
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_ids: productSlugs.slice(0, 20),
      content_name: name,
      content_category: categoryId,
      content_type: "product_group",
    });
    trackGoogleEvent("view_item_list", {
      item_list_id: categoryId,
      item_list_name: name,
    });
    // Jen při změně kategorie, ne při každém překreslení filtrů.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  return null;
}
