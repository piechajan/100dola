// CEP adapter — veřejný Zbozi.cz produktový feed distributora Medi-Expert.cz.
// Jeden feed = celý sortiment CEP → brandExternalId se nepoužívá.

import type { SupplierAdapter, FetchFeedOptions } from "../types";
import { parseCepFeed } from "./parser";

const FEED_URL =
  "https://www.medi-expert.cz/index.php?module=tool&code=7543453453&record=1";

export const cep: SupplierAdapter = {
  id: "cep",
  name: "CEP (Medi-Expert)",
  feedBaseUrl: "https://www.medi-expert.cz",

  async fetchFeed(_brandExternalId, opts: FetchFeedOptions = {}) {
    const { timeoutMs = 90000 } = opts;
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);

    let xml: string;
    try {
      const res = await fetch(FEED_URL, {
        method: "GET",
        signal: ac.signal,
        headers: { "User-Agent": "100dola-import/1.0 (+https://www.100dola.com)" },
      });
      if (!res.ok) {
        throw new Error(`CEP feed ${FEED_URL} returned HTTP ${res.status}`);
      }
      xml = await res.text();
    } finally {
      clearTimeout(t);
    }

    const products = parseCepFeed(xml);

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
      errors.push("CEP feed vrátil 0 produktů — pravděpodobně změna formátu nebo URL.");
    }
    const withoutPrice = products.filter((p) => !p.prices.retailCzk);
    if (withoutPrice.length > 0) {
      warnings.push(`${withoutPrice.length} produktů nemá CZK retail cenu.`);
    }
    const withoutImage = products.filter((p) => !p.mainImageUrl);
    if (withoutImage.length > 0) {
      warnings.push(`${withoutImage.length} produktů nemá hlavní obrázek.`);
    }

    return {
      ok: errors.length === 0,
      warnings: warnings.length > 0 ? warnings : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
};
