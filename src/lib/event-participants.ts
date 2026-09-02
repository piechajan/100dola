import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export interface PublicParticipant {
  name: string;
  photoUrl: string | null;
}

export interface EventParticipantsData {
  /** Počet přihlášek (leadů). */
  signups: number;
  /** Celkový počet lidí (lead + doprovodní členové). */
  people: number;
  /** Ti, kdo dali souhlas se zveřejněním — jméno + případně foto. */
  consented: PublicParticipant[];
  /** Počet přihlášených bez souhlasu → zobrazí se jako „Účastník N". */
  anon: number;
}

// Slim select + krátká cache → egress-safe. Invaliduje se přes tag `signups-<slug>`
// po každé nové přihlášce (revalidateTag v /api/event-signup).
export function getEventParticipants(slug: string): Promise<EventParticipantsData> {
  return unstable_cache(
    async (): Promise<EventParticipantsData> => {
      const empty: EventParticipantsData = { signups: 0, people: 0, consented: [], anon: 0 };
      if (!isSupabaseConfigured()) return empty;
      const sb = getSupabase();
      const { data, error } = await sb
        .from("event_signups")
        .select("lead_name, party_size, public_consent, photo_url")
        .eq("event_slug", slug)
        .neq("status", "cancelled")
        .order("registered_at", { ascending: true });
      if (error || !data) return empty;

      let people = 0;
      let anon = 0;
      const consented: PublicParticipant[] = [];
      for (const r of data as {
        lead_name: string;
        party_size: number | null;
        public_consent: boolean | null;
        photo_url: string | null;
      }[]) {
        people += r.party_size ?? 1;
        if (r.public_consent) {
          consented.push({ name: r.lead_name, photoUrl: r.photo_url });
        } else {
          anon += 1;
        }
      }
      return { signups: data.length, people, consented, anon };
    },
    ["event-participants", slug],
    { revalidate: 120, tags: [`signups-${slug}`] },
  )();
}

// Reálné počty přihlášených (people = lead + členové) per event_slug — pro karty
// napříč webem (listing, detail, „Další akce"). Egress-safe: jeden slim dotaz,
// krátká cache, invaliduje se tagem "event-signups-counts" po nové přihlášce.
export function getEventSignupCounts(): Promise<Record<string, number>> {
  return unstable_cache(
    async (): Promise<Record<string, number>> => {
      if (!isSupabaseConfigured()) return {};
      const sb = getSupabase();
      const { data, error } = await sb
        .from("event_signups")
        .select("event_slug, party_size")
        .neq("status", "cancelled");
      if (error || !data) return {};
      const map: Record<string, number> = {};
      for (const r of data as { event_slug: string; party_size: number | null }[]) {
        map[r.event_slug] = (map[r.event_slug] ?? 0) + (r.party_size ?? 1);
      }
      return map;
    },
    ["event-signup-counts"],
    { revalidate: 60, tags: ["event-signups-counts"] },
  )();
}
