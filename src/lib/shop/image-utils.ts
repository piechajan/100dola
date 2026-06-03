/**
 * Vercel Next 16 Image optimizer odmítá local URL `/api/img/...`
 * s 400 INVALID_IMAGE_OPTIMIZE_REQUEST i s `localPatterns` whitelistu.
 * Pro proxied supplier obrázky proto bypass optimizer (`unoptimized: true`).
 * Vercel edge cache na samotný /api/img/[encoded] response máme 1 rok
 * immutable, takže ztrácíme jen automatickou konverzi na AVIF/WebP
 * a resize — soubory přicházejí v originální velikosti (typicky 200-500 KB JPEG).
 */
/**
 * Detekuje URL kde MUSÍME bypass Next/Image optimizer (unoptimized=true):
 *   • /api/img/<base64> — local proxy. Next 16 odmítá s 400 INVALID_IMAGE_OPTIMIZE_REQUEST
 *     i s localPatterns whitelistem → unoptimized je jediná cesta.
 *
 * Supabase Storage URLs (`*.supabase.co/storage/v1/object/public/...`)
 * PROŠLY remotePatterns ve next.config.ts a Vercel optimizer je dokáže
 * stáhnout + AVIF/WebP + resize per device. Po Storage migraci proto
 * tyto URL **NEbypassujeme** — dostaneme menší obrázky a lepší LCP.
 */
export function isProxiedImage(src: string): boolean {
  if (typeof src !== "string") return false;
  return src.startsWith("/api/img/");
}
