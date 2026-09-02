import { NextResponse } from "next/server";
import { getEventSignupCounts } from "@/lib/event-participants";

export const dynamic = "force-dynamic";

// Veřejné reálné počty přihlášených per event_slug (jen čísla, žádné PII).
// Klient (EventListing) je použije místo naseedovaných `filled`.
export async function GET() {
  const counts = await getEventSignupCounts();
  return NextResponse.json({ counts });
}
