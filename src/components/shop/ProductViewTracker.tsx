"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";

interface Props {
  slug: string;
  name: string;
  priceWithVat: number;
}

export default function ProductViewTracker({ slug, name, priceWithVat }: Props) {
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
  }, [slug, name, priceWithVat]);

  return null;
}
