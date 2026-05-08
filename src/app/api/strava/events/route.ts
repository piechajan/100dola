import { NextResponse } from "next/server";
import { fetchUpcomingClubEvents, isStravaConfigured } from "@/lib/strava";
import { mapStravaEventToNormalized } from "@/lib/strava-mapping";

export const revalidate = 1800; // 30 min ISR cache na úrovni route

export async function GET() {
  if (!isStravaConfigured()) {
    return NextResponse.json(
      { configured: false, events: [], reason: "Strava env vars not set" },
      { status: 200 },
    );
  }

  try {
    const stravaEvents = await fetchUpcomingClubEvents();
    const normalized = stravaEvents.map(mapStravaEventToNormalized);
    return NextResponse.json({ configured: true, events: normalized });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error("[api/strava/events] error:", message);
    return NextResponse.json(
      { configured: true, events: [], error: message },
      { status: 502 },
    );
  }
}
