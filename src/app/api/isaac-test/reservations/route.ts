import { NextRequest, NextResponse } from "next/server";
import { IsaacTestPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  ISAAC_SLOTS,
  getBikeBySlug,
  bikeLabel,
} from "@/data/isaac-bikes";
import {
  sendIsaacTestConfirmation,
  sendIsaacTestNotification,
  scheduleIsaacTestReminder,
} from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { randomBytes } from "crypto";
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
  // Rate-limit: max 10 rezervací / 10 min / IP
  const rl = await checkRateLimit(req, { bucket: "isaac-test", max: 10, windowSec: 600 });
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

  const parsed = IsaacTestPayloadSchema.safeParse(body);
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

  const bike = getBikeBySlug(data.bikeSlug);
  if (!bike) {
    return NextResponse.json({ error: "Neznámé kolo" }, { status: 400 });
  }

  const slot = ISAAC_SLOTS.find((s) => s.slotStart === data.slotStart);
  if (!slot) {
    return NextResponse.json({ error: "Neplatný čas" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "DB momentálně nedostupná, zkus to za chvíli" },
      { status: 503 },
    );
  }

  const sb = getSupabase();
  const label = bikeLabel(bike);
  const cancelToken = randomBytes(24).toString("hex");

  // 1) Insert rezervace
  const { data: inserted, error } = await sb
    .from("isaac_test_reservations")
    .insert({
      bike_slug: bike.slug,
      bike_label: label,
      slot_start: slot.slotStart,
      slot_end: slot.slotEnd,
      slot_day_label: `${slot.dayLabel} ${slot.label}`,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      consent_terms: data.consentTerms,
      consent_gdpr: data.consentGdpr,
      subscribe_newsletter: data.subscribeNewsletter ?? false,
      notes: data.notes || null,
      cancel_token: cancelToken,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Tento slot byl mezitím obsazený. Vyber prosím jiný čas." },
        { status: 409 },
      );
    }
    console.error("[isaac-test] insert failed:", error);
    return NextResponse.json(
      { error: "Nepodařilo se uložit rezervaci. Zkus to znovu." },
      { status: 500 },
    );
  }

  const reservationId = inserted.id as number;

  // 2) Newsletter opt-in (pokud souhlasil)
  if (data.subscribeNewsletter) {
    try {
      const token = randomBytes(16).toString("hex");
      await sb
        .from("newsletter_subscribers")
        .upsert(
          {
            email: data.email,
            source: "isaac-test",
            unsubscribe_token: token,
          },
          { onConflict: "email" },
        );
    } catch (e) {
      console.warn("[isaac-test] newsletter opt-in failed:", e);
    }
  }

  // 3) Emails
  const emailPayload = {
    reservationId,
    bike: label,
    slotLabel: `${slot.dayLabel} · ${slot.label}`,
    slotStart: slot.slotStart,
    slotEnd: slot.slotEnd,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    notes: data.notes,
    cancelToken,
  };

  const { clientIp, userAgent } = extractClientContext(req.headers);
  const { fbp, fbc } = extractFbCookies(req.headers);
  const eventSourceUrl = req.headers.get("referer") ?? "https://www.100dola.com/isaac-test";

  // Confirm (immediate) + admin notif (immediate) — fire-and-forget
  Promise.allSettled([
    sendIsaacTestConfirmation(emailPayload),
    sendIsaacTestNotification(emailPayload),
    sendMetaCapiEvent({
      eventName: "Lead",
      eventId: `isaac-test-${reservationId}`,
      eventSourceUrl,
      userData: {
        email: data.email,
        phone: data.phone,
        firstName: data.fullName.split(" ")[0] || undefined,
        lastName: data.fullName.split(" ").slice(1).join(" ") || undefined,
        country: "cz",
        clientIp,
        userAgent,
        fbp,
        fbc,
        externalId: String(reservationId),
      },
      customData: {
        content_name: "ISAAC test reservation",
        content_category: data.bikeSlug,
      },
    }),
  ]);

  // 4) Schedule reminder na 8:00 v den testu (Resend scheduled_at)
  scheduleIsaacTestReminder(emailPayload)
    .then(async (resendId) => {
      if (resendId) {
        try {
          await sb
            .from("isaac_test_reservations")
            .update({ reminder_email_id: resendId })
            .eq("id", reservationId);
        } catch (e) {
          console.warn("[isaac-test] save reminder_email_id failed:", e);
        }
      }
    })
    .catch((e) => console.warn("[isaac-test] schedule reminder failed:", e));

  return NextResponse.json({
    ok: true,
    reservation: {
      bike: label,
      slotLabel: `${slot.dayLabel} · ${slot.label}`,
    },
  });
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ taken: [] });
  }
  const sb = getSupabase();
  const { data, error } = await sb
    .from("isaac_test_reservations")
    .select("bike_slug, slot_start, status")
    .neq("status", "cancelled");
  if (error) {
    console.error("[isaac-test] GET availability failed:", error);
    return NextResponse.json({ taken: [] });
  }
  return NextResponse.json({
    taken: (data || []).map((r) => ({
      bikeSlug: r.bike_slug as string,
      slotStart: r.slot_start as string,
    })),
  });
}
