import { NextRequest, NextResponse } from "next/server";
import { lookupAresByIco } from "@/lib/ares";
import { getAdminContext } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
