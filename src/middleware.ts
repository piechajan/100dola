import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Preview wall sundán 2026-05-18 — web je veřejně dostupný.
// Middleware nyní pouze prochází requesty; ponecháno pro budoucí potřeby
// (např. geo-routing, A/B testy, redirecty).

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|media/|routes/).*)"],
};
