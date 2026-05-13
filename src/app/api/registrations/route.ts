import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { MalagaLeadRow, RegistrationRow } from "@/lib/supabase";
import {
  sendMalagaLeadNotification,
  sendMalagaLeadConfirmation,
  sendEventRegistrationNotification,
  sendLabLeadNotification,
  sendLabLeadConfirmation,
} from "@/lib/email";
import {
  EventPayloadSchema,
  MalagaPayloadSchema,
  LabPayloadSchema,
  HONEYPOT_NAME,
} from "@/lib/schemas";

// Pro lidi přemýšlející: honeypot dropme tiše (200 ok), aby bot nevěděl, že byl chycen.
function isHoneypotFilled(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>)[HONEYPOT_NAME];
  return typeof v === "string" && v.length > 0;
}

// ── Fallback file storage (dev / když Supabase není nakonfigurován) ──────────

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "registrations.json");

interface FileRecord {
  source: "event" | "malaga" | "lab";
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

  // Honeypot — tichá 200 odpověď bez uložení. Bot nesmí poznat, že byl chycen.
  if (isHoneypotFilled(body)) {
    console.warn("[api/registrations] honeypot triggered — silently dropping");
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const useDb = isSupabaseConfigured();

  // Source decision: malaga má explicitní source, event ho nemusí mít (legacy).
  const rawSource = (body as Record<string, unknown> | null)?.source;
  const looksLikeEvent =
    !!body &&
    typeof body === "object" &&
    "firstName" in body &&
    "eventSlug" in body;

  function invalidPayload(issues: { path: string; message: string }[]) {
    return NextResponse.json({ error: "Invalid payload", issues }, { status: 400 });
  }

  // ── Malaga lead ───────────────────────────────────────────────────────────
  if (rawSource === "malaga") {
    const parsed = MalagaPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return invalidPayload(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      );
    }
    const m = parsed.data;

    if (useDb) {
      const sb = getSupabase();
      const insert = {
        name: m.name,
        email: m.email,
        phone: m.phone || null,
        intent: m.intent,
        package_interest: m.packageInterest || null,
        bike_count: m.bikeCount ?? null,
        bike_type: m.bikeType || null,
        is_ebike: m.isEbike ?? false,
        preferred_month: m.preferredMonth || null,
        group_kind: m.groupKind || null,
        pickup_at_home: m.pickupAtHome ?? false,
        message: m.message || null,
        registered_at: m.registeredAt || now,
      };
      const { data: row, error } = await sb
        .from("malaga_leads")
        .insert(insert)
        .select("*")
        .single();

      if (error) {
        console.error("[api/registrations] supabase insert failed:", error);
        return NextResponse.json({ error: "Storage error" }, { status: 500 });
      }

      const lead = row as MalagaLeadRow;
      Promise.allSettled([
        sendMalagaLeadNotification(lead),
        sendMalagaLeadConfirmation(lead),
      ]);

      return NextResponse.json({ ok: true, source: "malaga", id: lead.id });
    }

    // fallback: file storage
    const id = m.id || crypto.randomUUID();
    await fileAppend({
      source: "malaga",
      id,
      email: m.email,
      registeredAt: m.registeredAt || now,
      name: m.name,
      phone: m.phone,
      intent: m.intent,
      packageInterest: m.packageInterest,
      bikeCount: m.bikeCount,
      bikeType: m.bikeType,
      isEbike: m.isEbike,
      preferredMonth: m.preferredMonth,
      groupKind: m.groupKind,
      pickupAtHome: m.pickupAtHome,
      message: m.message,
    });
    return NextResponse.json({ ok: true, source: "malaga", id, fallback: true });
  }

  // ── Lab lead ──────────────────────────────────────────────────────────────
  // MVP: jen file storage + e-mail notif. Supabase tabulka přidám později.
  if (rawSource === "lab") {
    const parsed = LabPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return invalidPayload(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      );
    }
    const l = parsed.data;
    const id = l.id || crypto.randomUUID();
    const registeredAt = l.registeredAt || now;

    await fileAppend({
      source: "lab",
      id,
      email: l.email,
      registeredAt,
      name: l.name,
      phone: l.phone,
      bikeBrand: l.bikeBrand,
      bikeValue: l.bikeValue,
      services: l.services,
      preferredWindow: l.preferredWindow,
      pickupInPrague: l.pickupInPrague,
      message: l.message,
    });

    const emailPayload = {
      id,
      registeredAt,
      name: l.name,
      email: l.email,
      phone: l.phone,
      bikeBrand: l.bikeBrand,
      bikeValue: l.bikeValue,
      services: l.services,
      preferredWindow: l.preferredWindow,
      pickupInPrague: l.pickupInPrague,
      message: l.message,
    };
    Promise.allSettled([
      sendLabLeadNotification(emailPayload),
      sendLabLeadConfirmation(emailPayload),
    ]);

    return NextResponse.json({ ok: true, source: "lab", id });
  }

  // ── Event registration ────────────────────────────────────────────────────
  if (looksLikeEvent) {
    const parsed = EventPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return invalidPayload(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      );
    }
    const e = parsed.data;

    if (useDb) {
      const sb = getSupabase();
      const insert = {
        first_name: e.firstName,
        last_name: e.lastName,
        nickname: e.nickname || null,
        club: e.club || null,
        city: e.city || null,
        phone: e.phone || null,
        email: e.email,
        is_vip: e.isVip ?? false,
        event_slug: e.eventSlug,
        registered_at: e.registeredAt || now,
      };

      const { data: row, error } = await sb
        .from("registrations")
        .upsert(insert, { onConflict: "email,event_slug", ignoreDuplicates: true })
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("[api/registrations] supabase insert failed:", error);
        return NextResponse.json({ error: "Storage error" }, { status: 500 });
      }

      if (row) {
        Promise.allSettled([sendEventRegistrationNotification(row as RegistrationRow)]);
      }

      return NextResponse.json({ ok: true, source: "event", duplicate: !row });
    }

    // fallback: file storage
    const id = e.id || crypto.randomUUID();
    await fileAppend({
      source: "event",
      id,
      email: e.email,
      registeredAt: e.registeredAt || now,
      firstName: e.firstName,
      lastName: e.lastName,
      nickname: e.nickname,
      club: e.club,
      city: e.city,
      phone: e.phone,
      isVip: e.isVip ?? false,
      eventSlug: e.eventSlug,
    });
    return NextResponse.json({ ok: true, source: "event", id, fallback: true });
  }

  return invalidPayload([{ path: "source", message: "Unknown payload source" }]);
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
