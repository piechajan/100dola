"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/lib/wishlist-store";
import RecentlyViewedSection from "@/components/shop/RecentlyViewedSection";

function formatPrice(n: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n) + " Kč";
}

export default function WishlistPage() {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-px bg-[#E8431A]" />
            <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#E8431A]">
              Tvoje výběr
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-2">
            Oblíbené
          </h1>
          <p className="text-sm text-[#5A6480] mb-10">
            {items.length === 0
              ? "Zatím tu nic není. Klikni na srdíčko u produktu a uložíš si ho sem."
              : `${items.length} ${
                  items.length === 1 ? "produkt uložen" : items.length < 5 ? "produkty uloženy" : "produktů uloženo"
                } — najdeš je tady kdykoliv.`}
          </p>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-12 text-center">
              <div className="text-5xl mb-4">💙</div>
              <p className="text-sm text-[#5A6480] mb-6 max-w-sm mx-auto">
                Žádné oblíbené zatím nemáš. Procházej e-shop a klikni na srdíčko u toho co se ti líbí.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-full bg-[#1a1a2e] text-white hover:opacity-90 transition-opacity"
              >
                Do e-shopu
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#E2E6F3] hover:shadow-lg transition-all flex flex-col"
                >
                  <Link href={`/shop/${p.slug}`} className="relative aspect-[4/3] bg-white block">
                    <Image
                      src={p.photo}
                      alt={p.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={p.photo.startsWith("/api/img/")}
                    />
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-0.5">
                      {p.brand}
                    </div>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="text-sm font-bold text-[#1a1a2e] hover:text-[#3B7CF4] transition-colors block"
                    >
                      {p.name}
                    </Link>
                    <div className="text-[10px] text-[#9AA3C2] mt-1">
                      Přidáno {new Date(p.addedAt).toLocaleDateString("cs-CZ")}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F4F4F4]">
                      <span className="text-base font-black text-[#1a1a2e]">{formatPrice(p.priceWithVat)}</span>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="text-xs font-bold text-[#9AA3C2] hover:text-[#E8431A] transition-colors"
                      >
                        Odebrat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <RecentlyViewedSection />
      </main>
      <Footer />
    </>
  );
}
