import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Klient posílá už zmenšený webp (canvas ~512px), takže strop stačí nízký.
const MAX_BYTES = 1_500_000;
const ALLOWED = ["image/webp", "image/jpeg", "image/png"];

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, { bucket: "signup-photo", max: 15, windowSec: 600 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Příliš mnoho pokusů — zkus to za chvíli." }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Chybí soubor." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Nepodporovaný formát (jen JPG/PNG/WebP)." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Soubor je moc velký." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const blob = await put(`event-signups/${crypto.randomUUID()}.${ext}`, buf, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("[event-signup/photo] upload failed:", e);
    return NextResponse.json({ error: "Nahrání fotky selhalo." }, { status: 500 });
  }
}
