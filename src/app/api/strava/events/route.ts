import { NextResponse } from "next/server";
import { fetchClubGroupEvents, fetchUpcomingClubEvents, isStravaConfigured } from "@/lib/strava";
import { mapStravaEventToNormalized } from "@/lib/strava-mapping";

// Strava token refresh používá cache: 'no-store' — endpoint je inherently dynamic.
// Cachujeme přes Cache-Control header (CDN side) místo ISR.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isStravaConfigured()) {
    return NextResponse.json(
      { configured: false, events: [], reason: "Strava env vars not set" },
      { status: 200 },
    );
  }

  // ?all=1 + Bearer CRON_SECRET — surová data VŠECH událostí klubu (i proběhlých),
  // pro doplnění proběhlých akcí na web. Veřejný feed níž zůstává jen nadcházející.
  const url = new URL(req.url);
  if (url.searchParams.get("all") === "1") {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const all = await fetchClubGroupEvents();
      return NextResponse.json(
        { configured: true, count: all.length, events: all },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      return NextResponse.json({ error: message }, { status: 502 });
    }
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
