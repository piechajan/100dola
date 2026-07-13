"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatPrice, type Product } from "@/data/products";
import { isProxiedImage } from "@/lib/shop/image-utils";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";

/**
 * Sticky bottom bar pro PDP mobile.
 * Zobrazí se až user odscrolluje pod fold (foto + cena už není vidět).
 * Bypassne ConfiguratorUI produkty (mají vlastní inline CTA).
 */
export default function MobileStickyCTA({ product }: { product: Product }) {
  const addToCart = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      // Zobrazit po 600 px scroll (typicky pod hero fold mobile)
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Skip pro configurator products (mají vlastní inline CTA)
  if (product.hasConfigurator) return null;

  function handleAdd() {
    addToCart(product, 1);
    openDrawer();
    trackMetaEvent("AddToCart", {
      content_ids: [product.slug],
      content_name: product.name,
      content_type: "product",
      value: product.priceWithVat,
      currency: "CZK",
      contents: [{ id: product.slug, quantity: 1, item_price: product.priceWithVat }],
    });
    trackGoogleEvent("add_to_cart", {
      currency: "CZK",
      value: product.priceWithVat,
      items: [
        {
          item_id: product.slug,
          item_name: product.name,
          price: product.priceWithVat,
          quantity: 1,
        },
      ],
    });
  }

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-[#E2E6F3] transition-transform duration-200 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3 safe-bottom">
        <div className="relative w-12 h-12 rounded-lg bg-[#F0F2FA] overflow-hidden shrink-0">
          <Image
            src={product.photo}
            alt={product.name}
            fill
            sizes="48px"
            className="object-contain p-1"
            unoptimized={isProxiedImage(product.photo)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#1a1a2e] line-clamp-1">{product.name}</div>
          <div className="text-sm font-black text-[#1a1a2e]">{formatPrice(product.priceWithVat)}</div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="shrink-0 px-5 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Do košíku
        </button>
      </div>
    </div>
  );
}
