/**
 * One-shot: nahraj všechny eventy z src/data/events.ts do DB tabulky `events`.
 * Idempotentní — používá ON CONFLICT (slug) UPDATE.
 *
 * Run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/backfill-events.ts
 */

import { createClient } from "@supabase/supabase-js";
import { events } from "../src/data/events";

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Chybí SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  console.log(`Backfill: ${events.length} eventů z data/events.ts`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const ev of events) {
    const row = {
      slug: ev.slug,
      legacy_id: ev.id,
      title: ev.title,
      sport: ev.sport,
      date_label: ev.date,
      date_iso: ev.dateISO,
      time_label: ev.time,
      location: ev.location,
      location_detail: ev.locationDetail,
      distance: ev.distance,
      elevation: ev.elevation,
      difficulty: ev.difficulty,
      capacity: ev.capacity,
      filled: ev.filled,
      description: ev.description,
      long_description: ev.longDescription,
      what_to_bring: ev.whatToBring,
      who_is_it_for: ev.whoIsItFor,
      organizer_name: ev.organizer.name,
      organizer_role: ev.organizer.role,
      photo: ev.photo,
      photo_gallery: ev.photoGallery ?? [],
      route_url: ev.routeUrl,
      map_url: ev.mapUrl,
      strava_activity_url: ev.stravaActivityUrl,
      external_url: ev.externalUrl,
      external_cta_label: ev.externalCtaLabel,
      is_past: ev.isPast ?? false,
      is_published: true,
    };

    const { data: existing } = await sb
      .from("events")
      .select("id")
      .eq("slug", ev.slug)
      .maybeSingle();

    if (existing) {
      const { error } = await sb.from("events").update(row).eq("slug", ev.slug);
      if (error) {
        console.error(`  ✗ UPDATE ${ev.slug}: ${error.message}`);
        errors++;
      } else {
        console.log(`  ↻ updated ${ev.slug}`);
        updated++;
      }
    } else {
      const { error } = await sb.from("events").insert(row);
      if (error) {
        console.error(`  ✗ INSERT ${ev.slug}: ${error.message}`);
        errors++;
      } else {
        console.log(`  + inserted ${ev.slug}`);
        inserted++;
      }
    }
  }

  console.log(`\nHotovo: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
