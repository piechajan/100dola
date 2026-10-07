import { NextRequest, NextResponse } from "next/server";
import { lookupAresByIco } from "@/lib/ares";
import { checkRateLimit } from "@/lib/rate-limit";
import { isValidIco } from "@/lib/ico";

/**
 * Veřejné předvyplnění firemních údajů v košíku podle IČO (ARES).
 * Vrací jen to, co formulář potřebuje. Rate-limit chrání ARES i nás.
 * (Admin varianta s plným výstupem: /api/admin/ares.)
 */
export async function GET(req: NextRequest) {
  const rl = await checkRateLimit(req, { bucket: "ares-lookup", max: 30, windowSec: 600 });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Moc dotazů, zkus to za chvíli." }, { status: 429 });
  }

  const ico = (req.nextUrl.searchParams.get("ico") ?? "").replace(/\s/g, "");
  if (!/^\d{8}$/.test(ico)) {
    return NextResponse.json({ ok: false, error: "IČO má 8 číslic." }, { status: 400 });
  }
  if (!isValidIco(ico)) {
    return NextResponse.json({ ok: false, error: "IČO nemá správný kontrolní součet." }, { status: 400 });
  }

  try {
    const s = await lookupAresByIco(ico);
    if (!s) {
      return NextResponse.json({ ok: false, error: "Firmu s tímto IČO jsme v ARES nenašli." }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      subject: {
        ico: s.ico,
        name: s.name,
        dic: s.dic,
        street: s.street,
        city: s.city,
        zip: s.zip,
      },
    });
  } catch (e) {
    console.warn("[api/ares] lookup failed:", e);
    return NextResponse.json(
      { ok: false, error: "ARES teď neodpovídá — vyplň údaje ručně." },
      { status: 502 },
    );
  }
}
