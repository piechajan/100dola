"use client";

// Sdílitelné PDP odkazy: vybraná varianta žije v URL (?barva=…&velikost=…).
// Client-only helpery (window). Píšeme přes history.replaceState — bez reloadu,
// bez nutnosti Suspense boundary (na rozdíl od useSearchParams).

const KEY_COLOR = "barva";
const KEY_SIZE = "velikost";

/** "Gelato Blue" → "gelato-blue", "Šedá/fialová" → "seda-fialova". */
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function readVariantFromUrl(): { barva: string | null; velikost: string | null } {
  if (typeof window === "undefined") return { barva: null, velikost: null };
  const p = new URLSearchParams(window.location.search);
  return { barva: p.get(KEY_COLOR), velikost: p.get(KEY_SIZE) };
}

/** Zapíše/odebere ?barva a ?velikost do URL (tiše, bez navigace). */
export function writeVariantToUrl(color?: string | null, size?: string | null): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (color) url.searchParams.set(KEY_COLOR, slugify(color));
  else url.searchParams.delete(KEY_COLOR);
  if (size) url.searchParams.set(KEY_SIZE, slugify(size));
  else url.searchParams.delete(KEY_SIZE);
  window.history.replaceState(null, "", url.toString());
}

/** Najde v seznamu položku, jejíž název odpovídá slugu z URL. */
export function matchBySlug<T>(items: T[], slug: string | null, getName: (t: T) => string): T | undefined {
  if (!slug) return undefined;
  return items.find((it) => slugify(getName(it)) === slug);
}
