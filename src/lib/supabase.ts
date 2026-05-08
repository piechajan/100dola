// Server-only Supabase client. Používá service_role key, který RLS bypassuje.
// Volat POUZE z API routes nebo Server Components — nikdy z klienta.
//
// Setup viz BACKEND_SETUP.md.

import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cached: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase env vars missing — viz BACKEND_SETUP.md. Potřebuješ SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (cached) return cached;
  cached = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "100dola-web" } },
  });
  return cached;
}

// ── Typové aliasy odpovídající Supabase tabulkám ────────────────────────────
// Drž v sync s `supabase/migrations/001_initial.sql`.

export interface RegistrationRow {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  club: string | null;
  city: string | null;
  phone: string | null;
  email: string;
  is_vip: boolean;
  event_slug: string;
  registered_at: string;
  created_at: string;
  updated_at: string;
}

export interface MalagaLeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  intent: "transport" | "storage" | "package" | "tour" | "group" | "other";
  package_interest: "basic" | "exclusive" | "undecided" | null;
  bike_count: number | null;
  bike_type: string | null;
  is_ebike: boolean;
  preferred_month: string | null;
  group_kind: "individual" | "group" | "club" | null;
  pickup_at_home: boolean;
  message: string | null;
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  registered_at: string;
  created_at: string;
  updated_at: string;
}
