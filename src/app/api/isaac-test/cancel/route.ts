// ISAAC test cancel endpoint.
//   GET  /api/isaac-test/cancel?token=<cancel_token>
//        → zruší rezervaci (single-use token z e-mailu), redirect na /isaac-test/zruseno
//   POST /api/isaac-test/cancel { email }
//        → najde všechny aktivní rezervace pro daný e-mail a pošle klientovi e-mail
//          s individuálními cancel linky. (Email-based auth, ne přímý cancel.)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendIsaacCancelLinkList } from "@/lib/email";
import { cancelReservation } from "@/lib/isaac-cancel";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  if (!token || token.length < 10) {
    return NextResponse.redirect(`${baseUrl}/isaac-test/zruseno?status=invalid`);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${baseUrl}/isaac-test/zruseno?status=error`);
  }

  const sb = getSupabase();
  const { data: row, error } = await sb
    .from("isaac_test_reservations")
    .select(
      "id, bike_label, slot_start, slot_end, slot_day_label, full_name, email, phone, status, cancel_token, reminder_email_id",
    )
    .eq("cancel_token", token)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.redirect(`${baseUrl}/isaac-test/zruseno?status=expired`);
  }

  if (row.status === "cancelled") {
    return NextResponse.redirect(`${baseUrl}/isaac-test/zruseno?status=already`);
  }

  await cancelReservation(row);

  const slotDay = encodeURIComponent(row.slot_day_label);
  return NextResponse.redirect(
    `${baseUrl}/isaac-test/zruseno?status=ok&slot=${slotDay}`,
  );
}

// ── POST — webový form: zadej e-mail, server pošle cancel linky e-mailem ─────

const RequestCancelSchema = z.object({
  email: z.email().max(254).toLowerCase(),
});

export async function POST(req: NextRequest) {
  // Rate-limit: max 3 cancel requesty / 10 min / IP (zabrání spamu z cizích emailů)
  const rl = await checkRateLimit(req, {
    bucket: "isaac-cancel-request",
    max: 3,
    windowSec: 600,
  });
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

  const parsed = RequestCancelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Zadej platný e-mail" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true }); // anti-enum: vždy 200
  }

  const sb = getSupabase();

  // Najdi všechny aktivní rezervace pro tento e-mail
  const { data: rows } = await sb
    .from("isaac_test_reservations")
    .select(
      "id, bike_label, slot_day_label, cancel_token, status, full_name",
    )
    .eq("email", parsed.data.email)
    .eq("status", "reserved");

  // I když nic nenajdeme, vrátíme 200 (anti-enumeration — neprozrazujeme jestli email existuje)
  if (rows && rows.length > 0) {
    const reservations = rows
      .filter((r) => r.cancel_token) // jen ty co mají token (nově vytvořené)
      .map((r) => ({
        id: r.id,
        bike: r.bike_label,
        slotLabel: r.slot_day_label,
        cancelToken: r.cancel_token as string,
      }));

    if (reservations.length > 0) {
      const fullName = (rows[0].full_name as string) || "";
      sendIsaacCancelLinkList({
        email: parsed.data.email,
        fullName,
        reservations,
      }).catch((e) =>
        console.warn("[isaac-cancel] sendIsaacCancelLinkList failed:", e),
      );
    }
  }

  return NextResponse.json({ ok: true });
}
