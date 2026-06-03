export const runtime = "nodejs";
// 1 rok cache (Vercel CDN respektuje cache-control: immutable)
export const revalidate = 31_536_000;

/**
 * Image proxy: /api/img/<base64url-encoded-url>
 * Path-based (žádný query string) — Next.js Image local optimizer
 * pak může bezpečně volat tento endpoint a optimalizovat výstup.
 *
 * Bezpečnost:
 *   • whitelist hostname (sportimport.cz, alecko.cz)
 *   • detekce MIME z magic bytes
 *   • 1y immutable cache na Vercel edge
 */

const ALLOWED_HOSTS = new Set(["www.sportimport.cz", "www.alecko.cz"]);

const MIME_BY_MAGIC: Array<[Uint8Array, string]> = [
  [new Uint8Array([0xff, 0xd8, 0xff]), "image/jpeg"],
  [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png"],
  [new Uint8Array([0x47, 0x49, 0x46, 0x38]), "image/gif"],
  [new Uint8Array([0x52, 0x49, 0x46, 0x46]), "image/webp"],
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await context.params;
  let target: string;
  try {
    target = Buffer.from(encoded, "base64url").toString("utf-8");
  } catch {
    return new Response("invalid encoded url", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("invalid url", { status: 400 });
  }
  if (parsed.protocol !== "https:") return new Response("https only", { status: 400 });
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
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
