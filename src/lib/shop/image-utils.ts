/**
 * Vercel Next 16 Image optimizer odmítá local URL `/api/img/...`
 * s 400 INVALID_IMAGE_OPTIMIZE_REQUEST i s `localPatterns` whitelistu.
 * Pro proxied supplier obrázky proto bypass optimizer (`unoptimized: true`).
 * Vercel edge cache na samotný /api/img/[encoded] response máme 1 rok
 * immutable, takže ztrácíme jen automatickou konverzi na AVIF/WebP
 * a resize — soubory přicházejí v originální velikosti (typicky 200-500 KB JPEG).
 */
/**
 * Detekuje URL ze "instant CDN" zdroje:
 *   • /api/img/<base64>            — local proxy s 1y edge cache
 *   • <project>.supabase.co/storage — Supabase Storage CDN
 *
 * Tyto URL bypassujeme Next/Image optimizer (unoptimized=true) protože:
 *   1. Supabase Storage už je samo CDN s 1y cache
 *   2. Proxy přes Vercel optimizer by přidal jen cold-start overhead
 *   3. Aktuální Next 16 navíc odmítá local /api/* URL i s localPatterns
 */
export function isProxiedImage(src: string): boolean {
  if (typeof src !== "string") return false;
  if (src.startsWith("/api/img/")) return true;
  if (src.includes(".supabase.co/storage/v1/object/public/")) return true;
  return false;
}
