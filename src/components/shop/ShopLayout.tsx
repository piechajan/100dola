"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  categories,
  BRANDS,
  GENDERS,
  USE_CASES,
  type Gender,
  type UseCase,
} from "@/data/categories";
import { PRODUCTS, type Product } from "@/data/products";
import { getCategorySubIds, productLabel } from "@/lib/shop/category-utils";
import ProductCard from "@/components/shop/cards/ProductCard";
import SubCatCard from "@/components/shop/filters/SubCatCard";
import ActiveFilterChip from "@/components/shop/filters/ActiveFilterChip";
import { BrandChip, BrandTile } from "@/components/shop/filters/BrandFilters";

// ─── Main layout ──────────────────────────────────────────────────────────────
export interface ShopHeading {
  title: string;
  description: string;
  pathSlugs: string[];
  count: number;
}

export default function ShopLayout({
  products,
  initialCategoryId,
  initialSubId,
  heading,
}: {
  products?: Product[];
  initialCategoryId?: string;
  initialSubId?: string | null;
  heading?: ShopHeading;
} = {}) {
  const catalog: Product[] = products && products.length > 0 ? products : PRODUCTS;

  // "vse" = žádný category filter — zobrazí vše
  const [activeTab, setActiveTab] = useState<string>(initialCategoryId ?? "vse");
  const [activeSub, setActiveSub] = useState<string | null>(initialSubId ?? null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeGender, setActiveGender] = useState<Gender | null>(null);
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);

  // Cenový rozsah — počítáme min/max z catalog
  const priceBounds = useMemo(() => {
    if (catalog.length === 0) return { min: 0, max: 200000 };
    const prices = catalog.map((p) => p.priceWithVat);
    return { min: 0, max: Math.max(...prices, 1000) };
  }, [catalog]);
  const [priceMin, setPriceMin] = useState<number>(priceBounds.min);
  const [priceMax, setPriceMax] = useState<number>(priceBounds.max);
  const priceFilterActive = priceMin > priceBounds.min || priceMax < priceBounds.max;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

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

      // Cena
      const inPrice = p.priceWithVat >= priceMin && p.priceWithVat <= priceMax;

      return inCategory && inBrand && inGender && inUseCase && inPrice;
    });
  }, [activeSub, activeBrand, activeCategory, activeGender, activeUseCase, catalog, priceMin, priceMax]);

  // Reset page na 1 když se mění filtry
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSub, activeBrand, activeTab, activeGender, activeUseCase, priceMin, priceMax]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredProducts, currentPage],
  );

  const hasActiveFilters =
    activeBrand !== null || activeGender !== null || activeUseCase !== null || activeSub !== null || priceFilterActive;

  function clearAllFilters() {
    setActiveBrand(null);
    setActiveGender(null);
    setActiveUseCase(null);
    if (activeSub) handleSubChange(null);
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }

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
    // Naviguj na kategoriální URL pro lepší shareability + SEO
    if (typeof window !== "undefined") {
      if (id === "vse" || id === "znacky") {
        window.history.pushState({}, "", "/shop");
      } else {
        window.history.pushState({}, "", `/shop/${id}`);
      }
    }
  }

  function handleSubChange(subId: string | null) {
    setActiveSub(subId);
    if (typeof window !== "undefined" && activeCategory) {
      const url = subId
        ? `/shop/${activeCategory.id}/${subId}`
        : `/shop/${activeCategory.id}`;
      window.history.pushState({}, "", url);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#E2E6F3]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-10 md:py-14">
          {heading ? (
            <>
              <nav className="flex items-center gap-1.5 text-[11px] text-[#9AA3C2] mb-4">
                <Link href="/shop" className="hover:text-[#3B7CF4] transition-colors">E-shop</Link>
                {heading.pathSlugs.map((slugId, i) => {
                  const partialPath = heading.pathSlugs.slice(0, i + 1).join("/");
                  const isLast = i === heading.pathSlugs.length - 1;
                  const cat = i === 0
                    ? categories.find((c) => c.id === slugId)?.name
                    : i === 1
                      ? categories.find((c) => c.id === heading.pathSlugs[0])?.subcategories.find((s) => s.id === slugId)?.name
                      : categories.find((c) => c.id === heading.pathSlugs[0])?.subcategories.find((s) => s.id === heading.pathSlugs[1])?.children?.find((c) => c.id === slugId)?.name;
                  return (
                    <span key={slugId} className="flex items-center gap-1.5">
                      <span>/</span>
                      {isLast ? (
                        <span className="text-[#5A6480] font-semibold">{cat ?? slugId}</span>
                      ) : (
                        <Link href={`/shop/${partialPath}`} className="hover:text-[#3B7CF4] transition-colors">{cat ?? slugId}</Link>
                      )}
                    </span>
                  );
                })}
              </nav>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-px bg-[#E8431A]" />
                <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#E8431A]">
                  {heading.count} {productLabel(heading.count)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-tight">
                {heading.title}
              </h1>
              <p className="mt-2 text-sm text-[#5A6480] max-w-lg">{heading.description}</p>
            </>
          ) : (
            <>
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
            </>
          )}
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

        {/* ── Cenový filter ── */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="text-xs font-bold text-[#9AA3C2] tracking-wider uppercase shrink-0">
            Cena:
          </span>
          <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => {
                const v = Math.max(priceBounds.min, Math.min(priceMax - 1, Number(e.target.value) || 0));
                setPriceMin(v);
              }}
              min={priceBounds.min}
              max={priceMax - 1}
              step={100}
              className="w-24 px-2 py-1 text-xs text-right rounded-lg border border-[#E2E6F3] focus:outline-none focus:border-[#3B7CF4]"
            />
            <span className="text-xs text-[#9AA3C2]">–</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => {
                const v = Math.min(priceBounds.max, Math.max(priceMin + 1, Number(e.target.value) || priceBounds.max));
                setPriceMax(v);
              }}
              min={priceMin + 1}
              max={priceBounds.max}
              step={100}
              className="w-24 px-2 py-1 text-xs text-right rounded-lg border border-[#E2E6F3] focus:outline-none focus:border-[#3B7CF4]"
            />
            <span className="text-xs text-[#9AA3C2]">Kč</span>
          </div>
          {priceFilterActive && (
            <button
              type="button"
              onClick={() => { setPriceMin(priceBounds.min); setPriceMax(priceBounds.max); }}
              className="text-[11px] text-[#9AA3C2] hover:text-[#1a1a2e] underline"
            >
              reset
            </button>
          )}
        </div>

        {/* ── Active filters bar ── */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-8 pb-4 border-b border-[#E2E6F3]">
            <span className="text-xs font-bold text-[#5A6480] tracking-wider uppercase shrink-0">
              Aktivní:
            </span>
            {activeBrand && (
              <ActiveFilterChip
                label={BRANDS.find((b) => b.id === activeBrand)?.name ?? activeBrand}
                onClear={() => setActiveBrand(null)}
              />
            )}
            {activeGender && (
              <ActiveFilterChip
                label={GENDERS.find((g) => g.id === activeGender)?.label ?? activeGender}
                onClear={() => setActiveGender(null)}
              />
            )}
            {activeUseCase && (
              <ActiveFilterChip
                label={USE_CASES.find((u) => u.id === activeUseCase)?.label ?? activeUseCase}
                onClear={() => setActiveUseCase(null)}
              />
            )}
            {activeSub && activeCategory && (
              <ActiveFilterChip
                label={activeCategory.subcategories.find((s) => s.id === activeSub)?.name ?? activeSub}
                onClear={() => handleSubChange(null)}
              />
            )}
            {priceFilterActive && (
              <ActiveFilterChip
                label={`${priceMin.toLocaleString("cs-CZ")} – ${priceMax.toLocaleString("cs-CZ")} Kč`}
                onClear={() => { setPriceMin(priceBounds.min); setPriceMax(priceBounds.max); }}
              />
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto text-[11px] font-bold text-[#9AA3C2] hover:text-[#1a1a2e] underline"
            >
              Vymazat vše
            </button>
          </div>
        )}

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
                      onClick={() => handleSubChange(null)}
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
                      onClick={() => handleSubChange(activeSub === sub.id ? null : sub.id)}
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
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-[#9AA3C2] font-medium">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1
                      ? "produkt"
                      : filteredProducts.length < 5
                      ? "produkty"
                      : "produktů"}
                    {totalPages > 1 && (
                      <span className="ml-2 text-[#1a1a2e]">
                        · strana {currentPage} z {totalPages}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paginatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-full text-sm font-bold bg-white border border-[#E2E6F3] text-[#5A6480] disabled:opacity-30 hover:border-[#3B7CF4]/40"
                    >
                      ← Předchozí
                    </button>
                    {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                      // První, poslední, aktuální ± 1
                      const pageNum = i + 1;
                      const showNum =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1;
                      if (!showNum && totalPages > 7) return null;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[36px] px-2 py-1.5 rounded-full text-sm font-bold ${
                            isActive
                              ? "bg-[#1a1a2e] text-white"
                              : "bg-white border border-[#E2E6F3] text-[#5A6480] hover:border-[#3B7CF4]/40"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-full text-sm font-bold bg-white border border-[#E2E6F3] text-[#5A6480] disabled:opacity-30 hover:border-[#3B7CF4]/40"
                    >
                      Další →
                    </button>
                  </div>
                )}
              </div>
            ) : hasActiveFilters ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-4">🔎</div>
                <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                  Žádný produkt neodpovídá filtrům
                </h3>
                <p className="text-sm text-[#9AA3C2] max-w-sm mx-auto mb-6">
                  Zkus zrušit některý z aktivních filtrů, nebo se vrátit na hlavní katalog.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-[#1a1a2e] text-white hover:opacity-90"
                >
                  Vymazat všechny filtry
                </button>
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
