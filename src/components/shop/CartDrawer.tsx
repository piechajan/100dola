"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, getCartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/data/products";
import CrossSellModal from "./CrossSellModal";

export default function CartDrawer() {
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [showCrossSell, setShowCrossSell] = useState(false);

  const { subtotalWithVat, totalItems, hasBulky } = getCartTotals(items);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeDrawer]);

  return (
    <>
      <CrossSellModal open={showCrossSell} onClose={() => setShowCrossSell(false)} />
      {!isOpen ? null : (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="absolute top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
        style={{ animation: "slideIn 200ms ease-out" }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E6F3] flex items-center justify-between">
          <h2 id="cart-drawer-title" className="text-xl font-black text-[#1a1a2e]">
            Košík{totalItems > 0 && <span className="text-[#9AA3C2] font-medium ml-2">({totalItems})</span>}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-lg hover:bg-[#F0F2FA] text-[#5A6480]"
            aria-label="Zavřít košík"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <div className="text-lg font-black text-[#1a1a2e] mb-2">Košík je prázdný</div>
            <p className="text-sm text-[#5A6480] mb-6">
              Mrkni do shopu — máme tam vybrané produkty, které sami testujeme.
            </p>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-full bg-[#3B7CF4] hover:opacity-90 transition-opacity"
            >
              Do shopu
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 pb-4 border-b border-[#F0F2FA] last:border-b-0">
                  <div className="relative w-20 h-20 rounded-xl bg-[#F0F2FA] overflow-hidden shrink-0">
                    <Image
                      src={item.photo}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeDrawer}
                      className="text-sm font-bold text-[#1a1a2e] hover:text-[#3B7CF4] line-clamp-2 transition-colors block"
                    >
                      {item.name}
                    </Link>
                    {item.bulky && (
                      <div className="text-[10px] text-[#9AA3C2] mt-0.5">Velký balík (doprava 400 Kč)</div>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center border border-[#E2E6F3] rounded-full overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQty(item.productId, item.qty - 1)}
                          aria-label="Snížit množství"
                          className="w-7 h-7 flex items-center justify-center text-[#5A6480] hover:bg-[#F0F2FA] disabled:opacity-30"
                          disabled={item.qty <= 1}
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-[#1a1a2e]">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.productId, item.qty + 1)}
                          aria-label="Zvýšit množství"
                          className="w-7 h-7 flex items-center justify-center text-[#5A6480] hover:bg-[#F0F2FA]"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-sm font-black text-[#1a1a2e]">
                        {formatPrice(item.priceWithVat * item.qty)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    aria-label="Odebrat z košíku"
                    className="p-1 self-start text-[#C0C7D8] hover:text-[#E8431A] transition-colors"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}

              {hasBulky && (
                <div className="rounded-xl p-3 text-[11px] bg-[#FFF7ED] text-[#7A5615] border border-[#FBD38D]">
                  V košíku máš velký balík (kolo, lyže). Doprava bude 400 Kč.
                </div>
              )}

              <div className="rounded-xl p-3 text-[11px] bg-[#F0F4FF] text-[#1a1a2e] border border-[#D6E1FB]">
                Mnoho položek je u externích dodavatelů. Konkrétní termín dodání upřesníme po přijetí objednávky.
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E2E6F3] p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5A6480]">Mezisoučet (s DPH)</span>
                <span className="text-xl font-black text-[#1a1a2e]">{formatPrice(subtotalWithVat)}</span>
              </div>
              <div className="text-[11px] text-[#9AA3C2] -mt-2">
                Cena dopravy se přidá v dalším kroku.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="py-3 text-sm font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4] hover:text-[#3B7CF4] transition-colors"
                >
                  Pokračovat v nákupu
                </button>
                <button
                  type="button"
                  onClick={() => { closeDrawer(); setShowCrossSell(true); }}
                  className="py-3 text-sm font-bold rounded-full text-white text-center bg-[#3B7CF4] hover:opacity-90 transition-opacity"
                  style={{ boxShadow: "0 4px 14px #3B7CF440" }}
                >
                  K objednávce →
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
      )}
    </>
  );
}
