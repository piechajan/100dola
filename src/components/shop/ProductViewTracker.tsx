"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import { useRecentlyViewed } from "@/lib/recently-viewed-store";

interface Props {
  slug: string;
  name: string;
  priceWithVat: number;
  // Volitelné — pokud dodáme, dostaneme produkt do Recently Viewed.
  id?: number;
  brand?: string;
  photo?: string;
}

export default function ProductViewTracker({
  slug,
  name,
  priceWithVat,
  id,
  brand,
  photo,
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

    // Recently viewed (jen pokud máme všechna nutná data)
    if (id !== undefined && brand && photo) {
      pushRecent({ id, slug, name, brand, priceWithVat, photo });
    }
  }, [slug, name, priceWithVat, id, brand, photo, pushRecent]);

  return null;
}
