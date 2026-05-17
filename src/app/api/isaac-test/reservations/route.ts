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
} from "@/lib/email";

function honeypotTriggered(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>)[HONEYPOT_NAME];
  return typeof v === "string" && v.length > 0;
}

export async function POST(req: NextRequest) {
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

  // Validate bike exists
  const bike = getBikeBySlug(data.bikeSlug);
  if (!bike) {
    return NextResponse.json({ error: "Neznámé kolo" }, { status: 400 });
  }

  // Validate slot exists
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

  const { error } = await sb.from("isaac_test_reservations").insert({
    bike_slug: bike.slug,
    bike_label: label,
    slot_start: slot.slotStart,
    slot_end: slot.slotEnd,
    slot_day_label: `${slot.dayLabel} ${slot.label}`,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    consent_responsibility: data.consentResponsibility,
    consent_protocol: data.consentProtocol,
    notes: data.notes || null,
  });

  if (error) {
    // 23505 = UNIQUE constraint violation (someone booked this slot+bike already)
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "Tento slot byl mezitím obsazený. Vyber prosím jiný čas.",
        },
        { status: 409 },
      );
    }
    console.error("[isaac-test] insert failed:", error);
    return NextResponse.json(
      { error: "Nepodařilo se uložit rezervaci. Zkus to znovu." },
      { status: 500 },
    );
  }

  // Fire-and-forget emails
  const emailPayload = {
    bike: label,
    slotLabel: `${slot.dayLabel} · ${slot.label}`,
    slotStart: slot.slotStart,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    notes: data.notes,
  };
  Promise.allSettled([
    sendIsaacTestConfirmation(emailPayload),
    sendIsaacTestNotification(emailPayload),
  ]);

  return NextResponse.json({
    ok: true,
    reservation: {
      bike: label,
      slotLabel: `${slot.dayLabel} · ${slot.label}`,
    },
  });
}

// GET — dostupnost slotů (veřejné, nepotřebuje auth — pro pre-fill UI)
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
