"use client";

import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewed } from "@/lib/recently-viewed-store";

function formatPrice(n: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n) + " Kč";
}

/**
 * Sekce „Naposledy prohlíženo" — zobrazí se na PDP a /wishlist stránce.
 * Filtrujeme aktuální produkt aby nebyl mezi recentními.
 */
export default function RecentlyViewedSection({ excludeId }: { excludeId?: number }) {
  const items = useRecentlyViewed((s) => s.items);
  const filtered = excludeId !== undefined ? items.filter((i) => i.id !== excludeId) : items;
  if (filtered.length === 0) return null;

  return (
    <section className="bg-[#FAFAFA] py-12 md:py-16 border-t border-[#E2E6F3]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#9AA3C2] mb-2">
              Vrať se k tomu
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e]">Naposledy prohlíženo</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {filtered.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E2E6F3] hover:border-[#3B7CF4]/40 hover:shadow-md transition-all"
            >
              <div className="relative aspect-square bg-white">
                <Image src={p.photo} alt={p.name} fill className="object-contain p-3" sizes="200px" unoptimized={p.photo.startsWith("/api/img/")} />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">{p.brand}</div>
                <div className="text-xs font-bold text-[#1a1a2e] line-clamp-2 mt-0.5">{p.name}</div>
                <div className="text-sm font-black text-[#1a1a2e] mt-auto pt-2">
                  {formatPrice(p.priceWithVat)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
