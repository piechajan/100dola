import { NextRequest, NextResponse } from "next/server";
import { MalagaSignupPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import {
  sendMalagaSignupConfirmation,
  sendMalagaSignupNotification,
  type MalagaSignupEmailPayload,
} from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { events } from "@/data/events";
import { formatNights } from "@/data/events-signup";
import {
  malagaSummaryLines,
  malagaTierShort,
  type MalagaSignupOptions,
} from "@/data/malaga-signup";
import {
  sendMetaCapiEvent,
  extractClientContext,
  extractFbCookies,
} from "@/lib/meta-capi";

function honeypotTriggered(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>)[HONEYPOT_NAME];
  return typeof v === "string" && v.length > 0;
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, { bucket: "malaga-signup", max: 10, windowSec: 600 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů — zkus to za chvíli." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (honeypotTriggered(body)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = MalagaSignupPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Neplatná data",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const event = events.find((e) => e.slug === data.eventSlug);
  if (!event || !event.malagaSignup) {
    return NextResponse.json(
      { error: "Na tuto akci nelze poslat přihlášku." },
      { status: 400 },
    );
  }

  const turnstileIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  if (!(await verifyTurnstile(data.turnstileToken, turnstileIp))) {
    return NextResponse.json({ error: "Ověření selhalo, zkus to znovu." }, { status: 403 });
  }

  const members = (data.members ?? []).filter((m) => m.name.trim().length > 0);
  const partySize = 1 + members.length;

  const wantsAccommodation = data.accommodation === "interest";
  const nightsFrom = wantsAccommodation && data.accommodationFrom ? data.accommodationFrom : null;
  const nightsTo = wantsAccommodation && data.accommodationTo ? data.accommodationTo : null;
  const accommodationTerm = wantsAccommodation ? formatNights(nightsFrom, nightsTo) : undefined;

  const options: MalagaSignupOptions = {
    groupKind: data.groupKind,
    transportTier: data.transportTier,
    direction: data.transportTier === "none" ? undefined : data.direction,
    bikeCount: data.transportTier === "none" ? undefined : data.bikeCount,
    bikeType: data.transportTier === "none" ? undefined : data.bikeType,
    storageAfter: data.transportTier === "none" ? undefined : data.storageAfter,
    accommodation: data.accommodation,
    nutritionSponser: data.nutritionSponser,
    nutritionPrefs: data.nutritionPrefs || undefined,
    term: data.term || undefined,
    focus: data.focus || undefined,
  };

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Přihlášky dočasně nedostupné. Napiš nám prosím na info@100dola.com." },
      { status: 503 },
    );
  }

  const sb = getSupabase();
  const { data: inserted, error: insErr } = await sb
    .from("event_signups")
    .insert({
      event_slug: data.eventSlug,
      signup_kind: "malaga",
      lead_name: data.leadName,
      lead_email: data.leadEmail,
      lead_phone: data.leadPhone,
      party_size: partySize,
      stay_type: null,
      nights_from: nightsFrom,
      nights_to: nightsTo,
      options,
      note: data.note || null,
      gdpr_consent: data.consentGdpr,
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    console.error("[malaga-signup] insert failed:", insErr);
    return NextResponse.json(
      { error: "Přihlášku se nepodařilo uložit. Zkus to prosím znovu." },
      { status: 500 },
    );
  }

  const signupId = inserted.id as string;

  if (members.length > 0) {
    const { error: memErr } = await sb.from("event_signup_members").insert(
      members.map((m, i) => ({
        signup_id: signupId,
        name: m.name,
        email: m.email || null,
        phone: m.phone || null,
        position: i,
      })),
    );
    if (memErr) console.error("[malaga-signup] members insert failed:", memErr);
  }

  const emailPayload: MalagaSignupEmailPayload = {
    eventTitle: event.title,
    eventDate: event.date,
    eventLocation: event.location,
    leadName: data.leadName,
    leadEmail: data.leadEmail,
    leadPhone: data.leadPhone,
    partySize,
    members: members.map((m) => ({
      name: m.name,
      email: m.email || undefined,
      phone: m.phone || undefined,
    })),
    summary: malagaSummaryLines(options),
    subjectTag: malagaTierShort(data.transportTier, data.direction),
    accommodationTerm,
    note: data.note || undefined,
  };

  const { clientIp, userAgent } = extractClientContext(req.headers);
  const { fbp, fbc } = extractFbCookies(req.headers);
  const eventSourceUrl =
    req.headers.get("referer") ?? `https://www.100dola.com/community/event/${data.eventSlug}`;

  Promise.allSettled([
    sendMalagaSignupNotification(emailPayload),
    sendMalagaSignupConfirmation(emailPayload),
    sendMetaCapiEvent({
      eventName: "Lead",
      eventId: `malaga-signup-${signupId}`,
      eventSourceUrl,
      userData: {
        email: data.leadEmail,
        phone: data.leadPhone,
        firstName: data.leadName.split(" ")[0] || undefined,
        lastName: data.leadName.split(" ").slice(1).join(" ") || undefined,
        country: "cz",
        clientIp,
        userAgent,
        fbp,
        fbc,
      },
      customData: {
        content_name: "Malaga signup",
        content_category: data.eventSlug,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, id: signupId });
}
