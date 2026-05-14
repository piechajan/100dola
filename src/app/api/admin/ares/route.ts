import { NextRequest, NextResponse } from "next/server";
import { lookupAresByIco } from "@/lib/ares";

export async function GET(req: NextRequest) {
  const auth = req.cookies.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ico = req.nextUrl.searchParams.get("ico");
  if (!ico) {
    return NextResponse.json({ error: "?ico=<IČO> required" }, { status: 400 });
  }

  try {
    const subject = await lookupAresByIco(ico);
    if (!subject) {
      return NextResponse.json({ ok: false, error: "Subjekt nenalezen" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, subject });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ARES error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
