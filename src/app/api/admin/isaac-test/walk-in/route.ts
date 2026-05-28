import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getBikeBySlug, bikeLabel, ISAAC_SLOTS } from "@/data/isaac-bikes";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("preview_auth")?.value === "100dola2025";
}

interface WalkInPayload {
  bikeSlug: string;
  slotStart: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
  }

  let body: WalkInPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.bikeSlug || !body.slotStart || !body.fullName) {
    return NextResponse.json(
      { error: "Povinné: bikeSlug, slotStart, fullName" },
      { status: 400 },
    );
  }

  const bike = getBikeBySlug(body.bikeSlug);
  if (!bike) {
    return NextResponse.json({ error: "Neznámé kolo" }, { status: 400 });
  }

  const slot = ISAAC_SLOTS.find((s) => s.slotStart === body.slotStart);
  if (!slot) {
    return NextResponse.json({ error: "Neplatný slot" }, { status: 400 });
  }

  const sb = getSupabase();
  const label = bikeLabel(bike);

  // Walk-in vytváří rezervaci přímo se status="completed" — kolo už bylo testováno.
  // Walk-in si nepřebírá cancel_token (nemá smysl rušit už proběhlé).
  const noteSuffix = "[walk-in admin]";
  const combinedNotes = body.notes ? `${body.notes}\n${noteSuffix}` : noteSuffix;

  const { data: inserted, error } = await sb
    .from("isaac_test_reservations")
    .insert({
      bike_slug: bike.slug,
      bike_label: label,
      slot_start: slot.slotStart,
      slot_end: slot.slotEnd,
      slot_day_label: `${slot.dayLabel} ${slot.label}`,
      full_name: body.fullName,
      email: body.email || "walk-in@100dola.com",
      phone: body.phone || "—",
      consent_terms: true,
      consent_gdpr: true,
      subscribe_newsletter: false,
      notes: combinedNotes,
      status: "completed",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Slot je už obsazený jinou rezervací (sám možná v 'reserved')." },
        { status: 409 },
      );
    }
    console.error("[admin/isaac-walk-in] insert failed:", error);
    return NextResponse.json({ error: "Nepodařilo se uložit walk-in." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}
