"use client";

import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { useConfiguratorStore } from "@/lib/configurator-store";
import type { Product, ConfiguratorSchema } from "@/data/products";

interface ConfiguratorUIProps {
  product: Product;
  schema: ConfiguratorSchema;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n) + " Kč";
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/**
 * Přirozený řadicí klíč tagu (v rámci stejné ceny): velikost (XS<S<M…), délka
 * klik („délka 165 mm"), hloubka ráfku / rozměr („55 mm", „RYOT33"), jinak 0.
 */
function naturalKey(name: string): number {
  const up = name.trim().toUpperCase();
  const si = SIZE_ORDER.indexOf(up);
  if (si >= 0) return si;
  const len = name.match(/délka\s*([\d.,]+)\s*mm/i);
  if (len) return parseFloat(len[1].replace(",", "."));
  const range = name.match(/\b\d+\s*[-–]\s*(\d+)/); // kazeta „11-34" → 34
  if (range) return parseInt(range[1], 10);
  const mm = name.match(/([\d.,]+)\s*mm/i);
  if (mm) return parseFloat(mm[1].replace(",", "."));
  const depth = name.match(/(\d{2,4})/);
  if (depth) return parseInt(depth[1], 10);
  return 0;
}

/**
 * Sportimport-style configurator pro ISAAC kola.
 * Default: supplier defaultTagExternalId per option (fallback první isAvailable).
 * Cena live: basePrice + sum(modifiers), modifiery relativní k defaultu.
 * Add to cart: snapshot konfigurace v note + final price.
 */
export default function ConfiguratorUI({ product, schema }: ConfiguratorUIProps) {
  const addToCart = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const [added, setAdded] = useState(false);

  // Tagy seskupené per option, seřazené: cena vzestupně (bez příplatku první),
  // při stejné ceně přirozeně (délka klik / velikost / hloubka ráfku vzestupně).
  const tagsByOption = useMemo(() => {
    const m = new Map<string, ConfiguratorSchema["tags"]>();
    for (const t of schema.tags) {
      if (!m.has(t.optionExternalId)) m.set(t.optionExternalId, []);
      m.get(t.optionExternalId)!.push(t);
    }
    for (const [, tags] of m) {
      tags.sort((a, b) => {
        // Negativní volby („bez kol", „Rámová sada") na konec — bez příplatku první.
        const an = a.priceModifierCzk < 0 ? 1 : 0;
        const bn = b.priceModifierCzk < 0 ? 1 : 0;
        if (an !== bn) return an - bn;
        return a.priceModifierCzk - b.priceModifierCzk || naturalKey(a.name) - naturalKey(b.name);
      });
    }
    return m;
  }, [schema.tags]);

  // Default výběr: supplier default tag (odpovídá base ceně, priceModifier 0),
  // fallback na první available tag. Díky tomu iniciální build i cena sedí na
  // base produkt a odchylka uživatele se korektně přičte/odečte.
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const opt of schema.options) {
      const tags = tagsByOption.get(opt.externalId) ?? [];
      const defaultTag =
        tags.find((t) => t.externalId === opt.defaultTagExternalId && t.isAvailable) ??
        tags.find((t) => t.isAvailable) ??
        tags[0];
      if (defaultTag) init[opt.externalId] = defaultTag.externalId;
    }
    return init;
  });

  const priceModifier = useMemo(() => {
    let sum = 0;
    for (const opt of schema.options) {
      const tagId = selected[opt.externalId];
      const tag = (tagsByOption.get(opt.externalId) ?? []).find((t) => t.externalId === tagId);
      if (tag) sum += Math.round(tag.priceModifierCzk);
    }
    return sum;
  }, [selected, tagsByOption, schema.options]);

  const finalPrice = Math.max(0, product.priceWithVat + priceModifier);

  // Publikuj total + selected do global store — PDP hero, MobileStickyCTA, AddToCartButton ho čtou
  const setTotal = useConfiguratorStore((s) => s.setTotal);
  useEffect(() => {
    setTotal(product.id, finalPrice, selected);
  }, [product.id, finalPrice, selected, setTotal]);

  function handleAddToCart() {
    // Snapshot konfigurace do note (čitelné v košíku + objednávce)
    const configLines: string[] = [];
    for (const opt of schema.options) {
      const tagId = selected[opt.externalId];
      const tag = (tagsByOption.get(opt.externalId) ?? []).find((t) => t.externalId === tagId);
      if (tag) configLines.push(`${opt.name}: ${tag.name}`);
    }
    const configSummary = configLines.join(" · ");
    const configuredProduct: Product = {
      ...product,
      priceWithVat: finalPrice,
      note: configSummary,
      // Čitelný build vpisujeme do názvu → dorazí do order_items, mailu Janovi
      // i faktury (config objekt níže nese externalId pro server-side ověření ceny).
      name: configSummary ? `${product.name} (${configSummary})` : product.name,
      // Unique cart slot per configuration — odlišíme stejný produkt
      // s různou výbavou. Stable hash z výběru.
      id: hashConfigToId(product.id, selected),
    };
    // Snapshot výběru do košíku → order → server ověří cenu a Jan vidí build.
    // baseSupplierId musí být UUID base supplier produktu (ne synthetic id výše).
    const config = product.supplierProductId
      ? { baseSupplierId: product.supplierProductId, selected }
      : undefined;
    addToCart(configuredProduct, 1, undefined, config);
    openDrawer();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="rounded-2xl border-2 border-[#3B7CF4]/30 p-5 bg-gradient-to-br from-[#F0F4FF] to-white">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#3B7CF4]/20">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#3B7CF4]">
            Sestav si kolo
          </div>
          <h3 className="text-base font-black text-[#1a1a2e]">
            {schema.configuratorName ?? "Konfigurátor"}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2]">Celkem</div>
          <div className="text-xl font-black text-[#1a1a2e]">{formatPrice(finalPrice)}</div>
        </div>
      </div>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
        {schema.options.map((opt) => {
          const tags = tagsByOption.get(opt.externalId) ?? [];
          if (tags.length === 0) return null;
          return (
            <div key={opt.externalId}>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A6480] mb-1.5">
                {opt.name}
              </label>
              <select
                value={selected[opt.externalId] ?? ""}
                onChange={(e) =>
                  setSelected((s) => ({ ...s, [opt.externalId]: e.target.value }))
                }
                className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-[#E2E6F3] focus:outline-none focus:border-[#3B7CF4] bg-white"
              >
                {tags.map((t) => {
                  const mod = Math.round(t.priceModifierCzk);
                  const modLabel =
                    mod === 0 ? "" : mod > 0 ? `  (+${formatPrice(mod)})` : `  (${formatPrice(mod)})`;
                  return (
                    <option
                      key={t.externalId}
                      value={t.externalId}
                      disabled={!t.isAvailable}
                    >
                      {t.name}
                      {modLabel}
                      {!t.isAvailable ? " — vyprodáno" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full mt-5 px-5 py-3.5 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        {added ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Přidáno do košíku
          </>
        ) : (
          <>Sestavit a přidat do košíku · {formatPrice(finalPrice)}</>
        )}
      </button>

      <p className="text-[10px] text-[#9AA3C2] mt-3 text-center">
        Konfigurace se uloží do objednávky. Jan ti potvrdí dostupnost a termín do 24 h.
      </p>
    </div>
  );
}

/**
 * Stable hash výběru → numeric id. Použito v Cart aby stejný model
 * s různou výbavou byl samostatný cart slot.
 */
function hashConfigToId(baseId: number, selected: Record<string, string>): number {
  const str = Object.entries(selected)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("|");
  let h = baseId;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  // Konvertuj na positive + offset aby nekolidoval s static IDs
  return 2_000_000_000 + Math.abs(h);
}
