// Shared helper pro storno ISAAC test rezervace.
// Použito:
//   - GET /api/isaac-test/cancel (public, přes token z e-mailu)
//   - PATCH /api/admin/isaac-test/[id] (admin Stornovat tlačítko)
//
// Vždy:
//   1) update DB: status=cancelled, cancelled_at, invalidate cancel_token
//   2) zruší scheduled reminder e-mail (Resend) pokud existuje
//   3) pošle confirm klientovi + notif Janovi (fire-and-forget)

import "server-only";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  sendIsaacCancelConfirmation,
  sendIsaacCancelNotification,
} from "@/lib/email";
import { cancelScheduledResendEmail } from "@/lib/email-scheduled";

export interface CancelableReservation {
  id: number;
  bike_label: string;
  slot_start: string;
  slot_end: string;
  slot_day_label: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  cancel_token: string | null;
  reminder_email_id: string | null;
}

/** Vrátí rezervaci pro storno; null pokud neexistuje nebo už stornovaná. */
export async function loadCancelableReservation(
  id: number,
): Promise<CancelableReservation | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  const { data, error } = await sb
    .from("isaac_test_reservations")
    .select(
      "id, bike_label, slot_start, slot_end, slot_day_label, full_name, email, phone, status, cancel_token, reminder_email_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as CancelableReservation;
}

/** Stornuje rezervaci + pošle e-maily. Idempotentní (pokud už cancelled, nic nedělá). */
export async function cancelReservation(
  row: CancelableReservation,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (row.status === "cancelled") return;
  const sb = getSupabase();

  // 1) Update DB
  await sb
    .from("isaac_test_reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_token: null,
    })
    .eq("id", row.id);

  // 2) Zrušit scheduled reminder e-mail (Resend)
  if (row.reminder_email_id) {
    await cancelScheduledResendEmail(row.reminder_email_id).catch((e) =>
      console.warn(
        `[isaac-cancel] failed to cancel scheduled reminder ${row.reminder_email_id}:`,
        e,
      ),
    );
  }

  // 3) Detekuj late cancel — pokud cancel přijde ≤ 6 h před slot_start, reminder
  // mohl být už odeslán (cron schedule v Resendu nelze garantovaně zrušit).
  // Klient by mohl dostat reminder + storno → potřebuje vysvětlení.
  const slotStartMs = new Date(row.slot_start).getTime();
  const sixHoursMs = 6 * 60 * 60 * 1000;
  const lateCancel = Date.now() > slotStartMs - sixHoursMs;

  // 4) Notif e-maily — fire-and-forget
  const payload = {
    reservationId: row.id,
    bike: row.bike_label,
    slotLabel: row.slot_day_label,
    slotStart: row.slot_start,
    slotEnd: row.slot_end,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    lateCancel,
  };
  Promise.allSettled([
    sendIsaacCancelConfirmation(payload),
    sendIsaacCancelNotification(payload),
  ]);
}
