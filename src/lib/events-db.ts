/**
 * Events DB layer — admin čte/píše do tabulky `events` (migrace 026).
 *
 * Frontend (Navbar, EventsSection, /community, sitemap) zatím čte ze src/data/events.ts.
 * Tento layer slouží pouze admin UI. Frontend swap = další commit.
 */

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { events as staticEvents, type Difficulty, type Event, type Sport } from "@/data/events";

export interface EventRow {
  id: string;
  slug: string;
  legacy_id: number | null;
  title: string;
  sport: Sport;
  date_label: string;
  date_iso: string;
  time_label: string;
  location: string;
  location_detail: string | null;
  distance: string | null;
  elevation: string | null;
  difficulty: Difficulty | null;
  capacity: number;
  filled: number;
  description: string;
  long_description: string | null;
  what_to_bring: string[];
  who_is_it_for: string | null;
  organizer_name: string;
  organizer_role: string;
  photo: string;
  photo_gallery: string[];
  route_url: string | null;
  map_url: string | null;
  strava_activity_url: string | null;
  external_url: string | null;
  external_cta_label: string | null;
  is_past: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function listEventsFromDb(): Promise<EventRow[]> {
  const sb = serviceClient();
  if (!sb) return [];
  const { data } = await sb
    .from("events")
    .select("*")
    .order("date_iso", { ascending: false });
  return (data ?? []) as EventRow[];
}

/**
 * Universal events fetch for rendering (sitemap, Navbar, EventsSection, /community).
 * - DB primary: published rows from `events` table
 * - Fallback: static src/data/events.ts (pro případ že DB není dostupná / je prázdná)
 * - Cached: 5 min revalidate (events se nemění často; admin invalidace přes revalidatePath)
 */
// Pole, která žijí JEN v kódu (ne v `events` tabulce) — musí se přenést ze
// statické definice na DB event podle slugu, jinak by se ztratila (signup flagy,
// GPX profil, venues, varianty…). DB zůstává autoritativní pro editovatelná pole.
function overlayCodeOnlyFields(dbEvent: Event, staticEvent: Event | undefined): Event {
  if (!staticEvent) return dbEvent;
  return {
    ...dbEvent,
    groupSignup: staticEvent.groupSignup ?? dbEvent.groupSignup,
    signupVenue: staticEvent.signupVenue ?? dbEvent.signupVenue,
    malagaSignup: staticEvent.malagaSignup ?? dbEvent.malagaSignup,
    gpxPath: staticEvent.gpxPath ?? dbEvent.gpxPath,
    scottCta: staticEvent.scottCta ?? dbEvent.scottCta,
    participants: staticEvent.participants ?? dbEvent.participants,
    startVenue: dbEvent.startVenue ?? staticEvent.startVenue,
    endVenue: dbEvent.endVenue ?? staticEvent.endVenue,
    difficultyVariants: dbEvent.difficultyVariants ?? staticEvent.difficultyVariants,
  };
}

export const getPublishedEvents = unstable_cache(
  async (): Promise<Event[]> => {
    const rows = await listEventsFromDb();
    const staticBySlug = new Map(staticEvents.map((e) => [e.slug, e]));
    const dbEvents = rows
      .filter((r) => r.is_published)
      .map((r) => {
        const ev = rowToEvent(r);
        return overlayCodeOnlyFields(ev, staticBySlug.get(ev.slug));
      });
    if (dbEvents.length === 0) return staticEvents;
    // Merge: DB je primární, ale statické eventy definované jen v kódu (ne v DB)
    // se přidají navíc podle slugu — aby OMC jízdy ze staticEvents měly detail stránku.
    const dbSlugs = new Set(dbEvents.map((e) => e.slug));
    const staticOnly = staticEvents.filter((e) => !dbSlugs.has(e.slug));
    return [...dbEvents, ...staticOnly];
  },
  ["published-events"],
  { revalidate: 300, tags: ["events"] },
);

export async function getEventFromDb(id: string): Promise<EventRow | null> {
  const sb = serviceClient();
  if (!sb) return null;
  const { data } = await sb.from("events").select("*").eq("id", id).maybeSingle();
  return (data as EventRow | null) ?? null;
}

export interface EventInput {
  slug: string;
  title: string;
  sport: Sport;
  date_label: string;
  date_iso: string;
  time_label: string;
  location: string;
  location_detail?: string | null;
  distance?: string | null;
  elevation?: string | null;
  difficulty?: Difficulty | null;
  capacity: number;
  filled: number;
  description: string;
  long_description?: string | null;
  what_to_bring: string[];
  who_is_it_for?: string | null;
  organizer_name: string;
  organizer_role: string;
  photo: string;
  photo_gallery?: string[];
  route_url?: string | null;
  map_url?: string | null;
  strava_activity_url?: string | null;
  external_url?: string | null;
  external_cta_label?: string | null;
  is_past: boolean;
  is_published: boolean;
}

export async function upsertEvent(
  input: EventInput,
  updatedBy: string,
  id?: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const sb = serviceClient();
  if (!sb) return { ok: false, error: "no_db" };
  const row = { ...input, updated_by: updatedBy };
  if (id) {
    const { error } = await sb.from("events").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, id };
  }
  const { data, error } = await sb.from("events").insert(row).select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string }).id };
}

export async function deleteEvent(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = serviceClient();
  if (!sb) return { ok: false, error: "no_db" };
  const { error } = await sb.from("events").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Mapper: EventRow → Event (data/events.ts interface).
 * Použije se ve frontend swap commitu.
 */
export function rowToEvent(row: EventRow): Event {
  return {
    id: row.legacy_id ?? 0,
    slug: row.slug,
    title: row.title,
    sport: row.sport,
    date: row.date_label,
    dateISO: row.date_iso,
    time: row.time_label,
    location: row.location,
    locationDetail: row.location_detail ?? "",
    distance: row.distance ?? "",
    elevation: row.elevation ?? "",
    difficulty: (row.difficulty ?? "Střední") as Difficulty,
    capacity: row.capacity,
    filled: row.filled,
    description: row.description,
    longDescription: row.long_description ?? "",
    whatToBring: row.what_to_bring,
    whoIsItFor: row.who_is_it_for ?? "",
    organizer: { name: row.organizer_name, role: row.organizer_role },
    photo: row.photo,
    photoGallery: row.photo_gallery.length > 0 ? row.photo_gallery : undefined,
    routeUrl: row.route_url ?? undefined,
    mapUrl: row.map_url ?? undefined,
    stravaActivityUrl: row.strava_activity_url ?? undefined,
    isPast: row.is_past,
    externalUrl: row.external_url ?? undefined,
    externalCtaLabel: row.external_cta_label ?? undefined,
  };
}
