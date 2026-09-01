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

export type EventStayType = "pension" | "car" | "van" | "car_tent";

export interface EventSignupRow {
  id: string;
  event_slug: string;
  signup_kind: "group" | "malaga";
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  party_size: number;
  stay_type: EventStayType | null;
  nights_from: string | null;
  nights_to: string | null;
  room_choice: string | null;
  options: Record<string, unknown> | null;
  note: string | null;
  gdpr_consent: boolean;
  public_consent: boolean;
  photo_url: string | null;
  status: "new" | "processing" | "offer_sent" | "paid" | "pending" | "cancelled";
  admin_note: string | null;
  reminder_sent_at: string | null;
  registered_at: string;
  created_at: string;
  updated_at: string;
}

export interface EventSignupMemberRow {
  id: string;
  signup_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: number;
  created_at: string;
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
  options: Record<string, unknown> | null;
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  registered_at: string;
  created_at: string;
  updated_at: string;
}

export interface LabLeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bike_brand: string | null;
  bike_value: "under100k" | "100to200k" | "200kPlus" | "undecided" | null;
  services: string[] | null;
  preferred_window: string | null;
  pickup_in_prague: boolean;
  message: string | null;
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  registered_at: string;
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  registered_at: string;
  consent: boolean;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
  source: "community" | "shop" | "malaga" | "lab";
}

export interface OrderRow {
  id: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
  subtotal: number;
  shipping_fee: number;
  total: number;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  company_ico: string | null;
  company_dic: string | null;
  shipping_method: string;
  shipping_method_label: string;
  street: string | null;
  city: string | null;
  zip: string | null;
  zasilkovna_pickup: string | null;
  has_bulky: boolean;
  payment_method: string;
  payment_method_label: string;
  paid_at: string | null;
  notes: string | null;
  registered_at: string;
  tracking_number: string | null;
  shipped_at: string | null;
}

export interface OrderItemRow {
  id: number;
  order_id: string;
  product_id: number;
  slug: string;
  name: string;
  price_with_vat: number;
  vat_rate: number;
  qty: number;
  bulky: boolean;
}

export interface DiscountCodeRow {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order_total: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  description: string | null;
  created_at: string;
}
