// Sportimport adapter. https://www.sportimport.cz/export/xml/catalogue/<BRAND_ID>
// Supports query params: eur / huf / prices-all / items-all / relaxng / lang-cs|en|hu

import type { SupplierAdapter, FetchFeedOptions } from "../types";
import { parseSportimportFeed } from "./parser";

const FEED_BASE = "https://www.sportimport.cz/export/xml/catalogue";

export const sportimport: SupplierAdapter = {
  id: "sportimport",
  name: "Sport Import",
  feedBaseUrl: FEED_BASE,

  async fetchFeed(brandExternalId, opts: FetchFeedOptions = {}) {
    const { includeInactive = false, timeoutMs = 60000, language = "cs" } = opts;
    const parts: string[] = [brandExternalId];
    if (includeInactive) parts.push("items-all");
    parts.push(`lang-${language}`);
    parts.push("prices-all"); // ať dostaneme CZK + EUR + HUF + PLN najednou

    const url = `${FEED_BASE}/${parts.join("/")}`;
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);

    let xml: string;
    try {
      const res = await fetch(url, {
        method: "GET",
        signal: ac.signal,
        headers: { "User-Agent": "100dola-import/1.0 (+https://www.100dola.com)" },
      });
      if (!res.ok) {
        throw new Error(`Sportimport feed ${url} returned HTTP ${res.status}`);
      }
      xml = await res.text();
    } finally {
      clearTimeout(t);
    }

    const products = parseSportimportFeed(xml);

    // Aplikuj filter (např. ALE sezóny + pohlaví)
    if (opts.filter && Object.keys(opts.filter).length > 0) {
      const { matchesFilter } = await import("../types");
      return products.filter((p) => matchesFilter(p, opts.filter ?? null));
    }
    return products;
  },

  async validateFeed(products) {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (products.length === 0) {
      errors.push("Feed vrátil 0 produktů — pravděpodobně špatný brand ID nebo prázdný katalog.");
    }

    const withoutPrice = products.filter((p) => !p.prices.retailCzk);
    if (withoutPrice.length > 0) {
      warnings.push(`${withoutPrice.length} produktů nemá CZK retail cenu.`);
    }

    const withoutImage = products.filter((p) => !p.mainImageUrl);
    if (withoutImage.length > 0) {
      warnings.push(`${withoutImage.length} produktů nemá hlavní obrázek.`);
    }

    const configuratorProducts = products.filter((p) => p.hasConfigurator);
    const configuratorWithoutSchema = configuratorProducts.filter((p) => !p.configuratorSchema);
    if (configuratorWithoutSchema.length > 0) {
      errors.push(
        `${configuratorWithoutSchema.length} produktů má useConfigurator=1, ale schema se nepodařilo parsnout. PHP unserialize fail.`,
      );
    }

    return {
      ok: errors.length === 0,
      warnings: warnings.length > 0 ? warnings : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
};
