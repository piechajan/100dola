"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  categories,
  BRANDS,
  GENDERS,
  USE_CASES,
  type TopCategory,
  type SubCategory,
  type Gender,
  type UseCase,
} from "@/data/categories";
import { PRODUCTS, formatPrice, splitVat, type Product } from "@/data/products";
import { useCart } from "@/lib/cart-store";

const BADGE_COLORS: Record<string, string> = {
  "Doporučuje tým": "#E8431A",
  "Novinka": "#2EAA6E",
  "Buď vidět": "#3B7CF4",
};


// ─── Collect all sub-ids for a top-level category ────────────────────────────
function getAllSubIds(sub: SubCategory): string[] {
  if (!sub.children || sub.children.length === 0) return [sub.id];
  return [sub.id, ...sub.children.flatMap(getAllSubIds)];
}

function getCategorySubIds(cat: TopCategory): string[] {
  return cat.subcategories.flatMap(getAllSubIds);
}

// ─── Sub-category card ───────────────────────────────────────────────────────
function SubCatCard({
  sub,
  color,
  active,
  onClick,
}: {
  sub: SubCategory;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-xl border transition-all duration-150 bg-white"
      style={
        active
          ? { borderColor: color, backgroundColor: `${color}08` }
          : { borderColor: "#E2E6F3" }
      }
    >
      <div
        className="text-sm font-bold leading-tight mb-1"
        style={{ color: active ? color : "#1a1a2e" }}
      >
        {sub.name}
      </div>
      {sub.children && sub.children.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {sub.children.map((child) => (
            <span
              key={child.id}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={
                active
                  ? { backgroundColor: `${color}20`, color }
                  : { backgroundColor: "#F0F2FA", color: "#9AA3C2" }
              }
            >
              {child.name}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

// ─── Supplier image detection (skip Next optimizer kvůli chybějícímu Content-Type) ─
const SUPPLIER_IMAGE_HOSTS = ["www.sportimport.cz", "www.alecko.cz"];
function isSupplierImage(url: string): boolean {
  if (!url || !url.startsWith("http")) return false;
  try {
    const u = new URL(url);
    return SUPPLIER_IMAGE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addToCart = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const { withoutVat, vatAmount } = splitVat(product.priceWithVat, product.vatRate);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    openDrawer();
  };

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8E8E8] hover:border-[#E8431A]/20 hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
        <Image
          src={product.photo}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={isSupplierImage(product.photo)}
        />
        {product.badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {product.badges.map((badge) => (
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
        <h3 className="text-sm font-bold text-[#111111] leading-snug">
          {product.name}
          {product.year && (
            <span className="text-[#9A9A9A] font-medium ml-1">{product.year}</span>
          )}
        </h3>

        {product.specs.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {product.specs.map((s) => (
              <li key={s} className="text-[10px] text-[#9A9A9A] flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#E8431A] shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        )}

        {product.note && (
          <p className="text-[11px] text-[#E8431A] mt-2 font-medium italic">{product.note}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F4F4F4] mt-3">
          <div>
            {product.originalPriceWithVat && (
              <span className="text-xs text-[#9A9A9A] line-through block">
                {formatPrice(product.originalPriceWithVat)}
              </span>
            )}
            <span
              className={`text-base font-black ${product.originalPriceWithVat ? "text-[#E8431A]" : "text-[#111111]"}`}
            >
              {formatPrice(product.priceWithVat)}
            </span>
            <span className="block text-[9px] text-[#9A9A9A] leading-tight">
              DPH {product.vatRate} %: {formatPrice(vatAmount)} · bez DPH: {formatPrice(withoutVat)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="p-2 rounded-full bg-[#F4F4F4] hover:bg-[#3B7CF4] active:bg-[#2563CC] transition-colors duration-200 group/btn"
            aria-label="Přidat do košíku"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              className="text-[#666666] group-hover/btn:text-white transition-colors"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Brand chip — small inline logo button ───────────────────────────────────
function BrandChip({
  brand,
  active,
  onClick,
}: {
  brand: { id: string; name: string; logo: string };
  active: boolean;
  onClick: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const baseStyle = active
    ? { backgroundColor: "#1a1a2e", color: "#fff", borderColor: "#1a1a2e" }
    : { backgroundColor: "#fff", color: "#5A6480", borderColor: "#E2E6F3" };

  return (
    <button
      type="button"
      onClick={onClick}
      title={brand.name}
      aria-label={brand.name}
      aria-pressed={active}
      className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 shrink-0 flex items-center justify-center"
      style={{ ...baseStyle, minHeight: 30, minWidth: 56 }}
    >
      {!logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={brand.name}
          className="object-contain"
          style={{
            height: 16,
            maxWidth: 80,
            filter: active ? "brightness(0) invert(1)" : "brightness(0)",
            opacity: active ? 1 : 0.75,
          }}
          onError={() => setLogoFailed(true)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span>{brand.name}</span>
      )}
    </button>
  );
}

// ─── Brand tile — logo with text fallback ────────────────────────────────────
function BrandTile({
  brand,
  active,
  onClick,
}: {
  brand: { id: string; name: string; logo: string };
  active: boolean;
  onClick: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-150 hover:shadow-md overflow-hidden"
      style={{
        borderColor: active ? "#1a1a2e" : "#E2E6F3",
        backgroundColor: active ? "#1a1a2e" : "#fff",
        height: 88,
        padding: "12px 16px",
      }}
    >
      {!logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={brand.name}
          className="w-full object-contain transition-all duration-150"
          style={{
            maxHeight: 40,
            maxWidth: 120,
            filter: active ? "brightness(0) invert(1)" : "none",
            opacity: active ? 1 : 0.85,
          }}
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span
          className="font-black text-sm text-center leading-tight transition-colors"
          style={{ color: active ? "#fff" : "#1a1a2e" }}
        >
          {brand.name}
        </span>
      )}
    </button>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
export default function ShopLayout({ products }: { products?: Product[] } = {}) {
  const catalog: Product[] = products && products.length > 0 ? products : PRODUCTS;

  // "vse" = žádný category filter — zobrazí vše
  const [activeTab, setActiveTab] = useState<string>("vse");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeGender, setActiveGender] = useState<Gender | null>(null);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);

  const activeCategory = activeTab !== "vse"
    ? categories.find((c) => c.id === activeTab) ?? null
    : null;

  const filteredProducts = useMemo(() => {
    return catalog.filter((p) => {
      // Kategorie
      const inCategory = activeCategory
        ? activeSub
          ? p.categoryId === activeSub || p.categoryId.startsWith(activeSub + "-")
          : getCategorySubIds(activeCategory).includes(p.categoryId)
        : true;

      // Značka
      const inBrand = activeBrand ? p.brand === activeBrand : true;

      // Pohlaví — unisex zobrazujeme i když uživatel vybere M/F/K
      const inGender = activeGender
        ? p.gender === activeGender || p.gender === "U" || !p.gender
        : true;

      // Úroveň výkonu
      const inUseCase = activeUseCase ? p.useCase === activeUseCase : true;

      return inCategory && inBrand && inGender && inUseCase;
    });
  }, [activeSub, activeBrand, activeCategory, activeGender, activeUseCase, catalog]);

  // Initial state z URL (?brand=isaac&gender=M&useCase=race&cat=kola)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const b = sp.get("brand");
    if (b && BRANDS.some((br) => br.id === b)) setActiveBrand(b);
    const g = sp.get("gender");
    if (g === "M" || g === "F" || g === "K") setActiveGender(g);
    const u = sp.get("useCase");
    if (u === "leisure" || u === "performance" || u === "race") setActiveUseCase(u);
    const cat = sp.get("cat");
    if (cat && categories.some((c) => c.id === cat)) setActiveTab(cat);
  }, []);

  const tabs = [
    { id: "vse", label: "Vše", icon: "🛍️", color: "#1a1a2e" },
    ...categories.map((c) => ({ id: c.id, label: c.name, icon: c.icon, color: c.color })),
    { id: "znacky", label: "Značky", icon: "🏷️", color: "#1a1a2e" },
  ];

  const isBrandView = activeTab === "znacky";

  function handleTabChange(id: string) {
    setActiveTab(id);
    setActiveSub(null);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#E2E6F3]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-px bg-[#E8431A]" />
            <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#E8431A]">
              100dola sport
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-tight">
            E-shop
          </h1>
          <p className="mt-2 text-sm text-[#5A6480] max-w-lg">
            Kola, výbava, výživa, zimní sport — každý produkt jsme si sami vyzkoušeli nebo ho jedeme.
          </p>
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="sticky top-20 z-30 bg-white border-b border-[#E2E6F3] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-150 shrink-0"
                  style={
                    isActive
                      ? { backgroundColor: tab.color, color: "#fff" }
                      : { color: "#5A6480" }
                  }
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-12">

        {/* ── Brand filter pills ── */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="text-xs font-bold text-[#9AA3C2] tracking-wider uppercase shrink-0">
            Značka:
          </span>
          <button
            onClick={() => setActiveBrand(null)}
            className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150"
            style={
              activeBrand === null
                ? { backgroundColor: "#1a1a2e", color: "#fff", borderColor: "#1a1a2e" }
                : { backgroundColor: "#fff", color: "#5A6480", borderColor: "#E2E6F3" }
            }
          >
            Vše
          </button>
          {BRANDS.map((brand) => (
            <BrandChip
              key={brand.id}
              brand={brand}
              active={activeBrand === brand.id}
              onClick={() => setActiveBrand(activeBrand === brand.id ? null : brand.id)}
            />
          ))}
        </div>

        {/* ── Gender filter pills ── */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-xs font-bold text-[#9AA3C2] tracking-wider uppercase shrink-0">
            Pohlaví:
          </span>
          <button
            onClick={() => setActiveGender(null)}
            className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150"
            style={
              activeGender === null
                ? { backgroundColor: "#1a1a2e", color: "#fff", borderColor: "#1a1a2e" }
                : { backgroundColor: "#fff", color: "#5A6480", borderColor: "#E2E6F3" }
            }
          >
            Vše
          </button>
          {GENDERS.filter((g) => g.id !== "U").map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGender(activeGender === g.id ? null : g.id)}
              className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 shrink-0 flex items-center gap-1.5"
              style={
                activeGender === g.id
                  ? { backgroundColor: "#1a1a2e", color: "#fff", borderColor: "#1a1a2e" }
                  : { backgroundColor: "#fff", color: "#5A6480", borderColor: "#E2E6F3" }
              }
            >
              <span>{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>

        {/* ── Use-case filter pills ── */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="text-xs font-bold text-[#9AA3C2] tracking-wider uppercase shrink-0">
            Úroveň:
          </span>
          <button
            onClick={() => setActiveUseCase(null)}
            className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150"
            style={
              activeUseCase === null
                ? { backgroundColor: "#1a1a2e", color: "#fff", borderColor: "#1a1a2e" }
                : { backgroundColor: "#fff", color: "#5A6480", borderColor: "#E2E6F3" }
            }
          >
            Vše
          </button>
          {USE_CASES.map((u) => (
            <button
              key={u.id}
              onClick={() => setActiveUseCase(activeUseCase === u.id ? null : u.id)}
              title={u.description}
              className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 shrink-0"
              style={
                activeUseCase === u.id
                  ? { backgroundColor: "#1a1a2e", color: "#fff", borderColor: "#1a1a2e" }
                  : { backgroundColor: "#fff", color: "#5A6480", borderColor: "#E2E6F3" }
              }
            >
              {u.label}
            </button>
          ))}
        </div>

        {/* ── Značky view ── */}
        {isBrandView ? (
          <div>
            <h2 className="text-xl font-black text-[#1a1a2e] mb-6">Naše značky</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
              {BRANDS.map((brand) => (
                <BrandTile
                  key={brand.id}
                  brand={brand}
                  active={activeBrand === brand.id}
                  onClick={() => {
                    setActiveBrand(activeBrand === brand.id ? null : brand.id);
                    setActiveTab("vse");
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ── Sub-category grid (jen pokud je aktivní kategorie) ── */}
            {activeCategory && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1a1a2e]">{activeCategory.name}</h2>
                    <p className="text-sm text-[#5A6480] mt-0.5">{activeCategory.description}</p>
                  </div>
                  {activeSub && (
                    <button
                      onClick={() => setActiveSub(null)}
                      className="text-xs font-bold text-[#9AA3C2] hover:text-[#1a1a2e] flex items-center gap-1 transition-colors"
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                      Zrušit filtr
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {activeCategory.subcategories.map((sub) => (
                    <SubCatCard
                      key={sub.id}
                      sub={sub}
                      color={activeCategory.color}
                      active={activeSub === sub.id}
                      onClick={() => setActiveSub(activeSub === sub.id ? null : sub.id)}
                    />
                  ))}
                </div>

                {/* Children of active sub */}
                {activeSub && (() => {
                  const sub = activeCategory.subcategories.find((s) => s.id === activeSub);
                  if (!sub?.children?.length) return null;
                  return (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {sub.children.map((child) => (
                        <span
                          key={child.id}
                          className="px-4 py-2 rounded-full text-sm font-bold border-2 bg-white text-[#5A6480] border-[#E2E6F3]"
                        >
                          {child.name}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── Products grid ── */}
            {filteredProducts.length > 0 ? (
              <div>
                <div className="text-sm text-[#9AA3C2] font-medium mb-4">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "produkt"
                    : filteredProducts.length < 5
                    ? "produkty"
                    : "produktů"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="text-4xl mb-4">
                  {activeCategory?.icon ?? "🛍️"}
                </div>
                <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                  Produkty brzy
                </h3>
                <p className="text-sm text-[#9AA3C2] max-w-xs mx-auto">
                  V této kategorii aktuálně připravujeme sortiment.
                </p>
                <Link
                  href="/#newsletter"
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 text-sm font-bold rounded-full text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: activeCategory?.color ?? "#E8431A" }}
                >
                  Hlídat novinky
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
