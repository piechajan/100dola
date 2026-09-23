import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { revalidateTag } from "next/cache";
import { getAdminContext } from "@/lib/admin-auth";

export const runtime = "nodejs";

// Kurátorský upload/mazání fotek eventu po dnech (jen admin).
// Blob path: event-photos/<slug>/den-<N>/<uuid>.<ext>

const MAX_BYTES = 8_000_000; // admin nahrává rovnou z foťáku/telefonu, strop vyšší
const ALLOWED = ["image/webp", "image/jpeg", "image/png"];
const slugSafe = (s: string) => /^[a-z0-9-]{1,80}$/.test(s);

export async function POST(req: NextRequest) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const slug = String(form?.get("slug") ?? "");
  const day = Number(form?.get("day"));
  const file = form?.get("file");

  if (!slugSafe(slug)) return NextResponse.json({ error: "Neplatný event." }, { status: 400 });
  if (!Number.isInteger(day) || day < 1 || day > 30)
    return NextResponse.json({ error: "Neplatný den." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Chybí soubor." }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Jen JPG/PNG/WebP." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Soubor je moc velký (max 8 MB)." }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const blob = await put(
      `event-photos/${slug}/den-${day}/${crypto.randomUUID()}.${ext}`,
      buf,
      { access: "public", contentType: file.type, addRandomSuffix: false },
    );
    revalidateTag(`event-photos-${slug}`, "max");
    return NextResponse.json({ ok: true, url: blob.url, pathname: blob.pathname, day });
  } catch (e) {
    console.error("[admin/events/photos] upload failed:", e);
    return NextResponse.json({ error: "Nahrání selhalo." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const url = String(body?.url ?? "");
  const slug = String(body?.slug ?? "");
  if (!url.includes(".public.blob.vercel-storage.com/") || !url.includes(`event-photos/${slug}/`))
    return NextResponse.json({ error: "Neplatná fotka." }, { status: 400 });

  try {
    await del(url);
    if (slugSafe(slug)) revalidateTag(`event-photos-${slug}`, "max");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/events/photos] delete failed:", e);
    return NextResponse.json({ error: "Smazání selhalo." }, { status: 500 });
  }
}
