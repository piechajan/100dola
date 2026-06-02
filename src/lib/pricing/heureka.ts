import "server-only";
import * as cheerio from "cheerio";
import type { CompetitorPriceResult } from "./types";

/**
 * Parser pro Heureka.cz produktové srovnávací stránky.
 *
 * Heureka HTML mění strukturu jednou za čas. Strategie: zkusit více signálů
 * v pořadí spolehlivosti, vrátit první úspěch.
 *
 * 1) JSON-LD "Product" → "offers.lowPrice" (nejstabilnější, oficiální)
 * 2) Microdata `itemprop="lowPrice"`
 * 3) Selektor `.price__amount`, `.c-shop-row__price` (Heureka aktuální markup)
 * 4) Regex na "od XXX Kč" v textu
 *
 * Vrací nejnižší detekovanou cenu v haléřích (Kč × 100).
 */
export async function fetchHeurekaPrice(url: string): Promise<CompetitorPriceResult> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; 100dolaPricingBot/1.0; +https://www.100dola.com/about)",
        accept: "text/html,application/xhtml+xml",
        "accept-language": "cs-CZ,cs;q=0.9,en;q=0.5",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      return {
        ok: false,
        price_minor: null,
        source_label: "Heureka",
        error: `HTTP ${res.status}`,
      };
    }
    html = await res.text();
  } catch (e) {
    return {
      ok: false,
      price_minor: null,
      source_label: "Heureka",
      error: e instanceof Error ? e.message : String(e),
    };
  }

  const $ = cheerio.load(html);

  // 1) JSON-LD
  const jsonLdPrice = extractJsonLdLowPrice($);
  if (jsonLdPrice !== null) {
    return { ok: true, price_minor: jsonLdPrice, source_label: "Heureka (JSON-LD)" };
  }

  // 2) Microdata lowPrice
  const lowPriceEl = $('[itemprop="lowPrice"]').first();
  if (lowPriceEl.length) {
    const raw =
      lowPriceEl.attr("content") || lowPriceEl.text();
    const n = parseCzkPriceToMinor(raw);
    if (n !== null) return { ok: true, price_minor: n, source_label: "Heureka (microdata)" };
  }

  // 3) Aktuální CSS markup
  for (const sel of [".c-shop-row__price", ".price__amount", ".price-amount"]) {
    const el = $(sel).first();
    if (el.length) {
      const n = parseCzkPriceToMinor(el.text());
      if (n !== null)
        return { ok: true, price_minor: n, source_label: `Heureka (${sel})` };
    }
  }

  // 4) Regex fallback — "od 23 990 Kč"
  const fallbackMatch = $.text().match(/od\s+([\d\s ]+)[\xa0\s]?Kč/i);
  if (fallbackMatch) {
    const n = parseCzkPriceToMinor(fallbackMatch[1] + " Kč");
    if (n !== null) return { ok: true, price_minor: n, source_label: "Heureka (regex)" };
  }

  return {
    ok: false,
    price_minor: null,
    source_label: "Heureka",
    error: "no_price_found",
  };
}

function extractJsonLdLowPrice($: cheerio.CheerioAPI): number | null {
  const scripts = $('script[type="application/ld+json"]').toArray();
  let lowest: number | null = null;
  for (const s of scripts) {
    const txt = $(s).text();
    if (!txt) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(txt);
    } catch {
      continue;
    }
    const candidates = Array.isArray(parsed) ? parsed : [parsed];
    for (const c of candidates) {
      const price = extractPriceFromJsonLdNode(c);
      if (price !== null && (lowest === null || price < lowest)) lowest = price;
    }
  }
  return lowest;
}

function extractPriceFromJsonLdNode(node: unknown): number | null {
  if (!node || typeof node !== "object") return null;
  const obj = node as Record<string, unknown>;
  if (obj["@type"] === "Product" || (Array.isArray(obj["@type"]) && obj["@type"].includes("Product"))) {
    const offers = obj.offers;
    if (Array.isArray(offers)) {
      let lowest: number | null = null;
      for (const o of offers) {
        const p = extractOfferPrice(o);
        if (p !== null && (lowest === null || p < lowest)) lowest = p;
      }
      return lowest;
    }
    if (offers && typeof offers === "object") {
      return extractOfferPrice(offers);
    }
  }
  return null;
}

function extractOfferPrice(offer: unknown): number | null {
  if (!offer || typeof offer !== "object") return null;
  const o = offer as Record<string, unknown>;
  for (const key of ["lowPrice", "price"]) {
    const v = o[key];
    if (typeof v === "number") return Math.round(v * 100);
    if (typeof v === "string") {
      const n = parseCzkPriceToMinor(v);
      if (n !== null) return n;
    }
  }
  return null;
}

/**
 * Robustní parser CZ ceny → haléře. Akceptuje "23 990 Kč", "23.990,-", "23990",
 * "od 23 990 Kč", "23 990,50".
 */
export function parseCzkPriceToMinor(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/\xa0/g, " ")
    .replace(/[^\d,.\s]/g, "")
    .trim();
  if (!cleaned) return null;

  // Detekce desetinného oddělovače: pokud je čárka před max 2 ciframi → desetinné.
  const commaTail = cleaned.match(/,(\d{1,2})$/);
  const dotTail = cleaned.match(/\.(\d{1,2})$/);

  let intPart: string;
  let cents = 0;

  if (commaTail) {
    intPart = cleaned.slice(0, cleaned.length - commaTail[0].length);
    cents = parseInt(commaTail[1].padEnd(2, "0").slice(0, 2), 10);
  } else if (dotTail) {
    intPart = cleaned.slice(0, cleaned.length - dotTail[0].length);
    cents = parseInt(dotTail[1].padEnd(2, "0").slice(0, 2), 10);
  } else {
    intPart = cleaned;
  }

  // mezery a tečky jako thousand separators
  const intDigits = intPart.replace(/[\s.,]/g, "");
  if (!intDigits) return null;
  const koruny = parseInt(intDigits, 10);
  if (!Number.isFinite(koruny)) return null;
  return koruny * 100 + cents;
}
