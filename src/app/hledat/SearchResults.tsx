"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { isProxiedImage } from "@/lib/shop/image-utils";

interface Hit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceWithVat: number;
  photo: string;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n) + " Kč";
}

export default function SearchResults() {
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim();
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetch(`/api/shop/search?q=${encodeURIComponent(q)}&limit=48`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setHits(d.hits ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [q]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-10 md:py-14">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-px bg-[#E8431A]" />
        <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#E8431A]">
          Vyhledávání
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight">
        {q ? <>Výsledky pro „{q}"</> : "Vyhledávání"}
      </h1>
      <p className="mt-2 text-sm text-[#5A6480]">
        {loading
          ? "Hledám…"
          : `${hits.length} ${hits.length === 1 ? "produkt" : hits.length < 5 ? "produkty" : "produktů"}`}
      </p>

      {!loading && hits.length === 0 && (
        <div className="py-20 text-center">
          <div className="text-4xl mb-4">🔎</div>
          <h2 className="text-lg font-black text-[#1a1a2e] mb-2">Nic jsme nenašli</h2>
          <p className="text-sm text-[#9AA3C2] max-w-sm mx-auto mb-6">
            Zkus jiné slovo, nebo se podívej do celého e-shopu.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-[#1a1a2e] text-white hover:opacity-90"
          >
            Do e-shopu
          </Link>
        </div>
      )}

      {hits.length > 0 && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {hits.map((hit) => (
            <Link
              key={hit.id}
              href={`/shop/${hit.slug}`}
              className="group bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden hover:border-[#3B7CF4]/40 hover:shadow-lg transition-all"
            >
              <div className="relative aspect-square bg-[#F0F2FA]">
                <Image
                  src={hit.photo}
                  alt={hit.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-3"
                  unoptimized={isProxiedImage(hit.photo)}
                />
              </div>
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                  {hit.brand}
                </div>
                <div className="text-sm font-bold text-[#1a1a2e] line-clamp-2 mt-0.5 min-h-[2.5rem]">
                  {hit.name}
                </div>
                <div className="text-base font-black text-[#1a1a2e] mt-1">
                  {formatPrice(hit.priceWithVat)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
