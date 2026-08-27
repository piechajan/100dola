import { NextRequest, NextResponse } from "next/server";
import { fetchClubGroupEvents, fetchRouteGpx } from "@/lib/strava";

/**
 * Dočasný admin endpoint: exportuje GPX trasy Strava group eventů (Púchov PAIN,
 * thursday EASY ride) — běží na produkci s platným Strava tokenem. Výsledek
 * uložíme do /public/routes a endpoint smažeme. Auth: Bearer CRON_SECRET.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const WANT: Record<string, string> = {
  "puchov pain": "puchov-pain",
  "thursday easy ride": "thursday-easy-ride",
};

function norm(t: string) {
  return t.replace(/[^\p{L}\p{N}\s]/gu, "").toLowerCase().trim().replace(/\s+/g, " ");
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const events = await fetchClubGroupEvents();
    const out: Record<string, { routeId: number | string | null; gpx?: string; error?: string }> = {};
    for (const ev of events) {
      const n = norm(ev.title);
      const slug = Object.keys(WANT).find((k) => n.includes(k));
      if (!slug) continue;
      const key = WANT[slug];
      if (!ev.route_id) {
        out[key] = { routeId: null, error: "no route_id" };
        continue;
      }
      try {
        out[key] = { routeId: ev.route_id, gpx: await fetchRouteGpx(ev.route_id) };
      } catch (e) {
        out[key] = { routeId: ev.route_id, error: e instanceof Error ? e.message : String(e) };
      }
    }
    return NextResponse.json({ ok: true, routes: out });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
