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
  originalPriceWithVat?: number;
  photo: string;
}

interface ContentHit {
  id: string;
  type: "Trasa" | "Článek" | "Stránka";
  title: string;
  subtitle: string;
  url: string;
  image?: string | null;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n) + " Kč";
}

const TYPE_COLOR: Record<ContentHit["type"], string> = {
  Trasa: "#2EAA6E",
  Článek: "#E8431A",
  Stránka: "#3B7CF4",
};

export default function SearchResults() {
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim();
  const [hits, setHits] = useState<Hit[]>([]);
  const [content, setContent] = useState<ContentHit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (q.length < 2) {
      setHits([]);
      setContent([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    Promise.all([
      fetch(`/api/shop/search?q=${encodeURIComponent(q)}&limit=48`)
        .then((r) => r.json())
        .then((d) => (d.hits ?? []) as Hit[])
        .catch(() => [] as Hit[]),
      fetch(`/api/content/search?q=${encodeURIComponent(q)}&limit=24`)
        .then((r) => r.json())
        .then((d) => (d.hits ?? []) as ContentHit[])
        .catch(() => [] as ContentHit[]),
    ])
      .then(([products, contentHits]) => {
        if (!alive) return;
        setHits(products);
        setContent(contentHits);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [q]);

  const total = hits.length + content.length;

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
          : `${total} ${total === 1 ? "výsledek" : total >= 2 && total < 5 ? "výsledky" : "výsledků"}`}
      </p>

      {!loading && total === 0 && (
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

      {/* Obsah webu: trasy, články, stránky */}
      {content.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs tracking-[0.14em] uppercase font-bold text-[#9AA3C2] mb-3">
            Stránky, trasy a články
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.map((c) => (
              <Link
                key={c.id}
                href={c.url}
                className="group flex items-center gap-4 bg-white rounded-2xl border border-[#E2E6F3] p-3 hover:border-[#3B7CF4]/40 hover:shadow-md transition-all"
              >
                {c.image ? (
                  <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-[#F0F2FA]">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized={isProxiedImage(c.image)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-[#F0F2FA] flex items-center justify-center text-xl">
                    {c.type === "Trasa" ? "🚴" : c.type === "Článek" ? "📄" : "🧭"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span
                    className="text-[10px] uppercase tracking-wider font-bold"
                    style={{ color: TYPE_COLOR[c.type] }}
                  >
                    {c.type}
                  </span>
                  <div className="text-sm font-black text-[#1a1a2e] group-hover:text-[#3B7CF4] line-clamp-1">
                    {c.title}
                  </div>
                  <div className="text-xs text-[#5A6480] line-clamp-1">{c.subtitle}</div>
                </div>
                <span className="text-[#9AA3C2] group-hover:text-[#3B7CF4] group-hover:translate-x-0.5 transition-transform shrink-0">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produkty z e-shopu */}
      {hits.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.14em] uppercase font-bold text-[#9AA3C2] mb-3">
            Produkty v e-shopu
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    {hit.originalPriceWithVat && hit.originalPriceWithVat > hit.priceWithVat && (
                      <span className="text-xs text-[#9AA3C2] line-through">
                        {formatPrice(hit.originalPriceWithVat)}
                      </span>
                    )}
                    <span
                      className={`text-base font-black ${
                        hit.originalPriceWithVat && hit.originalPriceWithVat > hit.priceWithVat
                          ? "text-[#E8431A]"
                          : "text-[#1a1a2e]"
                      }`}
                    >
                      {formatPrice(hit.priceWithVat)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
