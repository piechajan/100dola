"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import { trackSemEvent } from "@/components/analytics/SeznamSem";
import { netPrice } from "@/lib/seznam-sem";
import { useRecentlyViewed } from "@/lib/recently-viewed-store";

interface Props {
  slug: string;
  name: string;
  priceWithVat: number;
  // Volitelné — pokud dodáme, dostaneme produkt do Recently Viewed.
  id?: number;
  brand?: string;
  photo?: string;
  /** Sazba DPH (pro SEM hodnotu bez DPH); default 21. */
  vatRate?: number;
  /** Kategorie pro SEM „A | B | C" (volitelné). */
  categoryText?: string;
}

export default function ProductViewTracker({
  slug,
  name,
  priceWithVat,
  id,
  brand,
  photo,
  vatRate = 21,
  categoryText,
}: Props) {
  const pushRecent = useRecentlyViewed((s) => s.push);

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_ids: [slug],
      content_name: name,
      content_type: "product",
      value: priceWithVat,
      currency: "CZK",
    });
    trackGoogleEvent("view_item", {
      currency: "CZK",
      value: priceWithVat,
      items: [{ item_id: slug, item_name: name, price: priceWithVat, quantity: 1 }],
    });

    trackSemEvent("ViewContent", {
      content_type: "product",
      currency: "CZK",
      value: netPrice(priceWithVat, vatRate),
      contents: [
        {
          id: slug,
          quantity: 1,
          unit_price: priceWithVat,
          content_name: name,
          ...(categoryText ? { content_category: categoryText } : {}),
        },
      ],
    });

    // Recently viewed (jen pokud máme všechna nutná data)
    if (id !== undefined && brand && photo) {
      pushRecent({ id, slug, name, brand, priceWithVat, photo });
    }
  }, [slug, name, priceWithVat, id, brand, photo, vatRate, categoryText, pushRecent]);

  return null;
}
