/**
 * Vercel Next 16 Image optimizer odmítá local URL `/api/img/...`
 * s 400 INVALID_IMAGE_OPTIMIZE_REQUEST i s `localPatterns` whitelistu.
 * Pro proxied supplier obrázky proto bypass optimizer (`unoptimized: true`).
 * Vercel edge cache na samotný /api/img/[encoded] response máme 1 rok
 * immutable, takže ztrácíme jen automatickou konverzi na AVIF/WebP
 * a resize — soubory přicházejí v originální velikosti (typicky 200-500 KB JPEG).
 */
export function isProxiedImage(src: string): boolean {
  return typeof src === "string" && src.startsWith("/api/img/");
}
