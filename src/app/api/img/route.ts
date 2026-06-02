export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Image proxy pro supplier feedy (Sportimport apod.) které:
 *   a) nesendí Content-Type (Next/Image optimizer pak soubor odmítá)
 *   b) mají krátký Cache-Control (max-age=600)
 *
 * Tohle:
 *   • whitelistuje hostname (žádný open proxy)
 *   • detekuje MIME z magic bytes (JPEG/PNG/WebP/GIF)
 *   • posílá 1y immutable cache header → Vercel edge cachuje
 *   • Next/Image pak může bezpečně optimalizovat (AVIF/WebP/resize)
 *
 * Usage: <Image src={`/api/img?u=${encodeURIComponent(url)}`} ... />
 */

const ALLOWED_HOSTS = new Set(["www.sportimport.cz", "www.alecko.cz"]);

const MIME_BY_MAGIC: Array<[Uint8Array, string]> = [
  [new Uint8Array([0xff, 0xd8, 0xff]), "image/jpeg"],
  [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png"],
  [new Uint8Array([0x47, 0x49, 0x46, 0x38]), "image/gif"],
  [new Uint8Array([0x52, 0x49, 0x46, 0x46]), "image/webp"], // RIFF header (kontrola dále u WebP)
];

function detectMime(buf: Uint8Array): string {
  for (const [magic, mime] of MIME_BY_MAGIC) {
    let ok = true;
    for (let i = 0; i < magic.length; i++) {
      if (buf[i] !== magic[i]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      // WebP má RIFF + "WEBP" na offsetu 8
      if (mime === "image/webp") {
        if (buf[8] !== 0x57 || buf[9] !== 0x45 || buf[10] !== 0x42 || buf[11] !== 0x50) {
          continue;
        }
      }
      return mime;
    }
  }
  return "application/octet-stream";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("u");
  if (!target) return new Response("missing u param", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("invalid url", { status: 400 });
  }

  if (parsed.protocol !== "https:") {
    return new Response("https only", { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return new Response("host not allowed", { status: 403 });
  }

  const upstream = await fetch(parsed.toString(), {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; 100dolaShopProxy/1.0)",
      accept: "image/avif,image/webp,image/*,*/*;q=0.5",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!upstream.ok) {
    return new Response(`upstream ${upstream.status}`, { status: 502 });
  }

  const buf = new Uint8Array(await upstream.arrayBuffer());
  const upstreamMime = upstream.headers.get("content-type")?.split(";")[0]?.trim();
  const mime =
    upstreamMime && upstreamMime.startsWith("image/") ? upstreamMime : detectMime(buf);

  if (!mime.startsWith("image/")) {
    return new Response("not an image", { status: 415 });
  }

  return new Response(buf, {
    headers: {
      "content-type": mime,
      "content-length": String(buf.byteLength),
      // 1y immutable — supplier URL je obvykle obsah-adresované (slug + id);
      // pokud se obrázek změní, dostane novou URL.
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
