import { NextRequest, NextResponse } from "next/server";
import { EventFeedbackPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

function honeypotTriggered(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>)[HONEYPOT_NAME];
  return typeof v === "string" && v.length > 0;
}

function toInt(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : null;
  const n = Number(v);
  return Number.isFinite(n) && String(v).trim() !== "" ? Math.round(n) : null;
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, { bucket: "event-feedback", max: 10, windowSec: 600 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Příliš mnoho pokusů — zkus to za chvíli." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (honeypotTriggered(body)) return NextResponse.json({ ok: true });

  const parsed = EventFeedbackPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
  }
  const data = parsed.data;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
  }

  const answers = data.answers ?? {};
  const sb = getSupabase();
  const { error } = await sb.from("event_feedback").insert({
    event_slug: data.eventSlug,
    signup_id: data.signupId || null,
    overall: toInt(answers.overall),
    nps: toInt(answers.nps),
    answers,
  });
  if (error) {
    console.error("[event-feedback] insert failed:", error);
    return NextResponse.json({ error: "Nepodařilo se uložit." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
