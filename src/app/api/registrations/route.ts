import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { MalagaLeadRow, RegistrationRow } from "@/lib/supabase";
import {
  sendMalagaLeadNotification,
  sendMalagaLeadConfirmation,
  sendEventRegistrationNotification,
} from "@/lib/email";

// ── Schemas ───────────────────────────────────────────────────────────────────
// Payload, který přijde od klienta. UDB schema (snake_case) je v lib/supabase.

interface BasePayload {
  id?: string;
  email: string;
  registeredAt?: string;
}

interface EventPayload extends BasePayload {
  source?: "event"; // implicit when eventSlug present
  firstName: string;
  lastName: string;
  nickname?: string;
  club?: string;
  city?: string;
  phone?: string;
  isVip?: boolean;
  eventSlug: string;
}

type MalagaIntent = "transport" | "storage" | "package" | "tour" | "group" | "other";
type MalagaPackage = "basic" | "exclusive" | "undecided";
type MalagaGroupKind = "individual" | "group" | "club";

interface MalagaPayload extends BasePayload {
  source: "malaga";
  name: string;
  phone?: string;
  intent: MalagaIntent;
  packageInterest?: MalagaPackage;
  bikeCount?: number;
  bikeType?: string;
  isEbike?: boolean;
  preferredMonth?: string;
  groupKind?: MalagaGroupKind;
  pickupAtHome?: boolean;
  message?: string;
}

// ── Validation ────────────────────────────────────────────────────────────────

function isMalagaPayload(b: unknown): b is MalagaPayload {
  if (!b || typeof b !== "object") return false;
  const r = b as Record<string, unknown>;
  return (
    r.source === "malaga" &&
    typeof r.email === "string" &&
    typeof r.name === "string" &&
    typeof r.intent === "string"
  );
}

function isEventPayload(b: unknown): b is EventPayload {
  if (!b || typeof b !== "object") return false;
  const r = b as Record<string, unknown>;
  return (
    typeof r.firstName === "string" &&
    typeof r.lastName === "string" &&
    typeof r.email === "string" &&
    typeof r.eventSlug === "string"
  );
}

// ── Fallback file storage (dev / když Supabase není nakonfigurován) ──────────

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "registrations.json");

interface FileRecord {
  source: "event" | "malaga";
  id: string;
  email: string;
  registeredAt: string;
  [k: string]: unknown;
}

async function fileAppend(record: FileRecord): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let all: FileRecord[] = [];
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    all = JSON.parse(raw);
  } catch { /* první zápis */ }
  // Dedup pro event source
  if (record.source === "event") {
    const existing = all.some(
      (r) => r.source === "event" && r.email === record.email && r.eventSlug === record.eventSlug,
    );
    if (existing) return;
  }
  all.push(record);
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf-8");
}

async function fileReadAll(): Promise<FileRecord[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ── POST — save registration / lead ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const useDb = isSupabaseConfigured();

  // ── Malaga lead ───────────────────────────────────────────────────────────
  if (isMalagaPayload(body)) {
    if (useDb) {
      const sb = getSupabase();
      const insert = {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        intent: body.intent,
        package_interest: body.packageInterest || null,
        bike_count: body.bikeCount ?? null,
        bike_type: body.bikeType?.trim() || null,
        is_ebike: body.isEbike ?? false,
        preferred_month: body.preferredMonth || null,
        group_kind: body.groupKind || null,
        pickup_at_home: body.pickupAtHome ?? false,
        message: body.message?.trim() || null,
        registered_at: body.registeredAt || now,
      };
      const { data, error } = await sb
        .from("malaga_leads")
        .insert(insert)
        .select("*")
        .single();

      if (error) {
        console.error("[api/registrations] supabase insert failed:", error);
        return NextResponse.json({ error: "Storage error" }, { status: 500 });
      }

      // Notifikace + confirmation — async, bez blokování response
      const lead = data as MalagaLeadRow;
      Promise.allSettled([
        sendMalagaLeadNotification(lead),
        sendMalagaLeadConfirmation(lead),
      ]);

      return NextResponse.json({ ok: true, source: "malaga", id: lead.id });
    }

    // fallback: file storage
    const id = body.id || crypto.randomUUID();
    await fileAppend({
      source: "malaga",
      id,
      email: body.email,
      registeredAt: body.registeredAt || now,
      name: body.name,
      phone: body.phone,
      intent: body.intent,
      packageInterest: body.packageInterest,
      bikeCount: body.bikeCount,
      bikeType: body.bikeType,
      isEbike: body.isEbike,
      preferredMonth: body.preferredMonth,
      groupKind: body.groupKind,
      pickupAtHome: body.pickupAtHome,
      message: body.message,
    });
    return NextResponse.json({ ok: true, source: "malaga", id, fallback: true });
  }

  // ── Event registration ────────────────────────────────────────────────────
  if (isEventPayload(body)) {
    if (useDb) {
      const sb = getSupabase();
      const insert = {
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        nickname: body.nickname?.trim() || null,
        club: body.club?.trim() || null,
        city: body.city?.trim() || null,
        phone: body.phone?.trim() || null,
        email: body.email.trim().toLowerCase(),
        is_vip: body.isVip ?? false,
        event_slug: body.eventSlug,
        registered_at: body.registeredAt || now,
      };

      // Dedup: unique constraint na (email, event_slug) — upsert nebo ignore conflict
      const { data, error } = await sb
        .from("registrations")
        .upsert(insert, { onConflict: "email,event_slug", ignoreDuplicates: true })
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("[api/registrations] supabase insert failed:", error);
        return NextResponse.json({ error: "Storage error" }, { status: 500 });
      }

      // Notifikace jen pokud byl insert nový (data není null)
      if (data) {
        Promise.allSettled([sendEventRegistrationNotification(data as RegistrationRow)]);
      }

      return NextResponse.json({ ok: true, source: "event", duplicate: !data });
    }

    // fallback: file storage
    const id = body.id || crypto.randomUUID();
    await fileAppend({
      source: "event",
      id,
      email: body.email,
      registeredAt: body.registeredAt || now,
      firstName: body.firstName,
      lastName: body.lastName,
      nickname: body.nickname,
      club: body.club,
      city: body.city,
      phone: body.phone,
      isVip: body.isVip ?? false,
      eventSlug: body.eventSlug,
    });
    return NextResponse.json({ ok: true, source: "event", id, fallback: true });
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}

// ── GET — list (preview-protected) ────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = req.cookies.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = req.nextUrl.searchParams.get("event");
  const vipOnly = req.nextUrl.searchParams.get("vip") === "1";
  const source = req.nextUrl.searchParams.get("source"); // "event" | "malaga"
  const intent = req.nextUrl.searchParams.get("intent");

  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    const out: { event: RegistrationRow[]; malaga: MalagaLeadRow[] } = { event: [], malaga: [] };

    if (!source || source === "event") {
      let q = sb.from("registrations").select("*").order("registered_at", { ascending: false });
      if (event) q = q.eq("event_slug", event);
      if (vipOnly) q = q.eq("is_vip", true);
      const { data, error } = await q;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      out.event = (data as RegistrationRow[]) || [];
    }

    if (!source || source === "malaga") {
      let q = sb.from("malaga_leads").select("*").order("registered_at", { ascending: false });
      if (intent) q = q.eq("intent", intent);
      const { data, error } = await q;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      out.malaga = (data as MalagaLeadRow[]) || [];
    }

    return NextResponse.json({
      backend: "supabase",
      count: out.event.length + out.malaga.length,
      registrations: out.event,
      leads: out.malaga,
    });
  }

  // fallback: file storage
  const all = await fileReadAll();
  let result = all;
  if (source) result = result.filter((r) => r.source === source);
  if (event) result = result.filter((r) => r.source === "event" && r.eventSlug === event);
  if (vipOnly) result = result.filter((r) => r.source === "event" && r.isVip);
  if (intent) result = result.filter((r) => r.source === "malaga" && r.intent === intent);

  return NextResponse.json({ backend: "file", count: result.length, registrations: result });
}
