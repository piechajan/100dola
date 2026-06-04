"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS, formatPrice } from "@/data/products";

const BADGE_COLORS: Record<string, string> = {
  "Doporučuje tým": "#E8431A",
  "Novinka": "#2EAA6E",
  "Buď vidět": "#3B7CF4",
};

const CATEGORY_LABELS: Record<string, string> = {
  "silnicni-aero": "Silniční kola",
  "silnicni-endurance": "Silniční kola",
  "silnicni-race": "Silniční kola",
  "gravel": "Gravel · závodní",
  "doplnky": "Cyklistické oblečení",
  "osvetleni": "Radarové světlo",
  "skialpy-lyze": "Skialpové lyže",
  "vyziva-iontaky": "Výživa · isotonický nápoj",
};

interface FeaturedCardData {
  id: number;
  slug: string | null;
  name: string;
  year: string | null;
  category: string;
  price: string;
  originalPrice?: string;
  badges: string[];
  note: string | null;
  photo: string | null;
  specs: string[];
}

function buildFeaturedFromProducts(): FeaturedCardData[] {
  return PRODUCTS.filter((p) => p.isFeatured === true)
    .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      year: p.year,
      category: CATEGORY_LABELS[p.categoryId] ?? p.categoryId,
      price: formatPrice(p.priceWithVat),
      originalPrice: p.originalPriceWithVat ? formatPrice(p.originalPriceWithVat) : undefined,
      badges: p.badges,
      note: p.note,
      photo: p.photo,
      specs: p.specs.slice(0, 3),
    }));
}

// ── Carousel ──────────────────────────────────────────────────────────────────
export default function FeaturedProducts() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  // zone: null = no auto-scroll, "left" = scroll left, "right" = scroll right
  const zoneRef = useRef<"left" | "right" | null>(null);

  const products = useMemo(() => buildFeaturedFromProducts(), []);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = trackRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  // Auto-scroll loop
  useEffect(() => {
    const SPEED = 6; // px per frame
    const tick = () => {
      const el = trackRef.current;
      if (el && zoneRef.current) {
        el.scrollLeft += zoneRef.current === "right" ? SPEED : -SPEED;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    const ZONE = 120; // px from edge that triggers auto-scroll
    if (x > w - ZONE) zoneRef.current = "right";
    else if (x < ZONE) zoneRef.current = "left";
    else zoneRef.current = null;
  };

  const handleMouseLeave = () => { zoneRef.current = null; };

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-[#E8431A]" />
              <span className="text-xs tracking-[0.18em] uppercase font-semibold text-[#E8431A]">
                100dola sport
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#111111]">
              Aktuálně doporučujeme
            </h2>
            <p className="mt-2 text-sm text-[#666666] max-w-md">
              Nevybíráme pro kvantitu. Každý produkt prošel rukama někoho, kdo ho opravdu používá.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] hover:text-[#E8431A] transition-colors shrink-0"
          >
            Celý shop
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Carousel wrapper */}
        <div className="relative group/carousel overflow-hidden">

          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            aria-label="Předchozí"
            className="absolute left-2 z-20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 24px rgba(26,26,46,0.13), 0 1px 4px rgba(26,26,46,0.08)",
              border: "1.5px solid rgba(226,230,243,0.8)",
              opacity: canScrollLeft ? 1 : 0,
              pointerEvents: canScrollLeft ? "auto" : "none",
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1a1a2e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            aria-label="Další"
            className="absolute right-2 z-20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 24px rgba(26,26,46,0.13), 0 1px 4px rgba(26,26,46,0.08)",
              border: "1.5px solid rgba(226,230,243,0.8)",
              opacity: canScrollRight ? 1 : 0,
              pointerEvents: canScrollRight ? "auto" : "none",
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1a1a2e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Scroll track */}
          <div
            ref={trackRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              maskImage: "linear-gradient(to right, transparent 0%, black 11%, black 89%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 11%, black 89%, transparent 100%)",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({
  slug, name, year, category, price, originalPrice, badges, note, photo, specs,
}: {
  slug: string | null;
  name: string;
  year: string | null;
  category: string;
  price: string;
  originalPrice?: string;
  badges: string[];
  note: string | null;
  photo: string | null;
  specs: string[];
}) {
  return (
    <Link
      href={slug ? `/shop/${slug}` : `/shop?q=${encodeURIComponent(name)}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8E8E8] hover:border-[#E8431A]/20 hover:shadow-lg transition-all duration-200 shrink-0"
      style={{ width: 272 }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
        {photo && (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="272px"
          />
        )}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white self-start"
                style={{ backgroundColor: BADGE_COLORS[badge] ?? "#1a1a1a" }}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[10px] tracking-wider uppercase text-[#9A9A9A] font-medium mb-1">
          {category}
        </div>
        <h3 className="text-sm font-bold text-[#111111] leading-snug">
          {name} {year && <span className="text-[#9A9A9A] font-medium">{year}</span>}
        </h3>

        {specs.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {specs.map((s) => (
              <li key={s} className="text-[10px] text-[#9A9A9A] flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#E8431A] shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        )}

        {note && (
          <p className="text-[11px] text-[#E8431A] mt-2 font-medium italic">{note}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F4F4F4] mt-3">
          <div>
            {originalPrice && (
              <span className="text-xs text-[#9A9A9A] line-through block">{originalPrice}</span>
            )}
            <span className={`text-base font-black ${originalPrice ? "text-[#E8431A]" : "text-[#111111]"}`}>
              {price}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#9A9A9A] group-hover:text-[#E8431A] transition-colors flex items-center gap-1">
            Detail
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
