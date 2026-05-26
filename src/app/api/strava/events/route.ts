import { NextResponse } from "next/server";
import { fetchUpcomingClubEvents, isStravaConfigured } from "@/lib/strava";
import { mapStravaEventToNormalized } from "@/lib/strava-mapping";

// Strava token refresh používá cache: 'no-store' — endpoint je inherently dynamic.
// Cachujeme přes Cache-Control header (CDN side) místo ISR.
export const dynamic = "force-dynamic";

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
    return NextResponse.json(
      { configured: true, events: normalized },
      {
        headers: {
          // CDN cache 30 min, stale-while-revalidate dalších 30 min
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=1800",
        },
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error("[api/strava/events] error:", message);
    return NextResponse.json(
      { configured: true, events: [], error: message },
      { status: 502 },
    );
  }
}
