import { list } from "@vercel/blob";
import JSZip from "jszip";

export const runtime = "nodejs";
export const maxDuration = 60;

// Stáhnout všechny fotky jednoho dne jako ZIP. Veřejné (fotky jsou public).
// GET /api/events/<slug>/photos/zip?day=N

const slugSafe = (s: string) => /^[a-z0-9-]{1,80}$/.test(s);

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const day = Number(new URL(req.url).searchParams.get("day"));
  if (!slugSafe(slug) || !Number.isInteger(day) || day < 1 || day > 30) {
    return new Response("Neplatný požadavek.", { status: 400 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return new Response("Nedostupné.", { status: 503 });

  const prefix = `event-photos/${slug}/den-${day}/`;
  const urls: string[] = [];
  let cursor: string | undefined;
  do {
    const res = await list({ prefix, cursor, limit: 1000 });
    for (const b of res.blobs) urls.push(b.url);
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);

  if (urls.length === 0) return new Response("Žádné fotky.", { status: 404 });

  const zip = new JSZip();
  let i = 0;
  for (const url of urls) {
    const r = await fetch(url).catch(() => null);
    if (!r?.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    const ext = url.split(".").pop()?.split(/[?#]/)[0] || "jpg";
    i += 1;
    zip.file(`${slug}-den-${day}-${String(i).padStart(2, "0")}.${ext}`, buf);
  }

  const out = await zip.generateAsync({ type: "nodebuffer" });
  return new Response(new Uint8Array(out), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-den-${day}.zip"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
