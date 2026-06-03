"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { isProxiedImage } from "@/lib/shop/image-utils";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { PRODUCTS, formatPrice } from "@/data/products";

/**
 * Cross-sell modal — zobrazí se po prvním kliku na "K objednávce".
 * Doporučí 2-3 produkty, které ještě nejsou v košíku, na základě jednoduché heuristiky:
 *  - vyjma produktů už v košíku
 *  - prioritně produkty s "Doporučuje tým" badge
 *  - kategorie doplňky / výživa (low-friction add)
 *
 * Pokud klient klik na "Pokračovat k objednávce", přesměrujeme na /objednavka.
 */

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CrossSellModal({ open, onClose }: Props) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);

  const recommendations = useMemo(() => {
    const inCart = new Set(items.map((i) => i.productId));
    return PRODUCTS.filter((p) => !inCart.has(p.id))
      .sort((a, b) => {
        const aTeam = a.badges.includes("Doporučuje tým") ? -1 : 0;
        const bTeam = b.badges.includes("Doporučuje tým") ? -1 : 0;
        if (aTeam !== bTeam) return aTeam - bTeam;
        return a.priceWithVat - b.priceWithVat;
      })
      .slice(0, 3);
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleProceed = () => {
    onClose();
    router.push("/objednavka");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ animation: "scaleIn 200ms ease-out" }}
      >
        <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>

        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#F0F2FA] text-[#5A6480]"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-7 md:p-10">
          <div className="text-xs tracking-[0.18em] uppercase font-bold text-[#3B7CF4] mb-2">
            Než dokončíš objednávku
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-2 leading-tight">
            Hodilo by se ti i tohle?
          </h2>
          <p className="text-sm text-[#5A6480] mb-6">
            Pár věcí, které sami používáme a hodí se k tomu, co máš v košíku.
          </p>

          {recommendations.length === 0 ? (
            <p className="text-sm text-[#9AA3C2] py-4">
              Máš v košíku všechno, co aktuálně doporučujeme. Pojďme dál.
            </p>
          ) : (
            <div className="space-y-3 mb-7">
              {recommendations.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 rounded-2xl border border-[#E2E6F3] hover:border-[#3B7CF4]/40 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-xl bg-[#F0F2FA] overflow-hidden shrink-0">
                    <Image src={p.photo} alt={p.name} fill sizes="64px" className="object-contain p-1" unoptimized={isProxiedImage(p.photo)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#1a1a2e] leading-tight">{p.name}</div>
                    {p.note && (
                      <div className="text-[11px] text-[#E8431A] italic mt-0.5 line-clamp-1">{p.note}</div>
                    )}
                    <div className="text-sm font-black text-[#1a1a2e] mt-1">
                      {formatPrice(p.priceWithVat)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => add(p, 1)}
                    className="shrink-0 px-4 py-2 text-xs font-bold rounded-full border border-[#3B7CF4] text-[#3B7CF4] hover:bg-[#3B7CF4] hover:text-white transition-colors"
                  >
                    Přidat
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 text-sm font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4] transition-colors"
            >
              Vrátit se do košíku
            </button>
            <button
              type="button"
              onClick={handleProceed}
              className="flex-1 py-3.5 text-sm font-bold text-white rounded-full bg-[#3B7CF4] hover:opacity-90 transition-opacity"
              style={{ boxShadow: "0 4px 14px #3B7CF440" }}
            >
              Pokračovat k objednávce →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
