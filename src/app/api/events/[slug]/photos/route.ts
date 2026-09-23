import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import type { EventPhoto, EventPhotoDay } from "@/lib/event-photos";

export const runtime = "nodejs";

// Veřejná galerie fotek eventu, tříděná po dnech.
// Zdroj = Vercel Blob, složková struktura `event-photos/<slug>/den-<N>/…` = třídění.
// Nahrávání kurátorsky přes admin (viz /api/admin/events/photos).

const slugSafe = (s: string) => /^[a-z0-9-]{1,80}$/.test(s);

async function listDaysUncached(slug: string): Promise<EventPhotoDay[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const prefix = `event-photos/${slug}/`;
  const byDay = new Map<number, EventPhoto[]>();
  let cursor: string | undefined;
  do {
    const res = await list({ prefix, cursor, limit: 1000 });
    for (const b of res.blobs) {
      const m = b.pathname.match(/\/den-(\d+)\//);
      if (!m) continue;
      const day = Number(m[1]);
      const arr = byDay.get(day) ?? [];
      arr.push({
        url: b.url,
        downloadUrl: b.downloadUrl,
        pathname: b.pathname,
        uploadedAt: b.uploadedAt.toISOString(),
      });
      byDay.set(day, arr);
    }
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);

  return [...byDay.entries()]
    .map(([day, photos]) => ({
      day,
      photos: photos.sort((a, b) => a.pathname.localeCompare(b.pathname)),
    }))
    .sort((a, b) => a.day - b.day);
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugSafe(slug)) return NextResponse.json({ days: [] });

  const cached = unstable_cache(() => listDaysUncached(slug), ["event-photos", slug], {
    revalidate: 300,
    tags: [`event-photos-${slug}`],
  });
  const days = await cached();
  return NextResponse.json({ days });
}
