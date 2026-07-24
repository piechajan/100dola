import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchAthleteActivities, isStravaConfigured } from "@/lib/strava";

// Interní endpoint: vrací souhrn aktivit přihlášeného sportovce pro externí
// kondiční projekt (kondice-PJ sync). Chráněný CRON_SECRET — data nejsou veřejná.
// Strava token refresh je no-store → endpoint je inherently dynamic, žádná cache.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // Autorizace: Bearer CRON_SECRET (stejný secret jako Vercel Cron endpointy).
  const auth = req.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStravaConfigured()) {
    return NextResponse.json(
      { configured: false, activities: [], reason: "Strava env vars not set" },
      { status: 200 },
    );
  }

  // ?after=<epoch s> — jen aktivity novější než tento čas (default: bez filtru).
  const afterParam = new URL(req.url).searchParams.get("after");
  const after = afterParam ? Number.parseInt(afterParam, 10) : undefined;

  try {
    const activities = await fetchAthleteActivities({
      after: Number.isFinite(after) ? after : undefined,
    });
    return NextResponse.json(
      { configured: true, count: activities.length, activities },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error("[api/strava/activities] error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
