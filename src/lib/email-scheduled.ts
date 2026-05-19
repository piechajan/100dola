// Resend scheduled email helpers — zrušení naschedule e-mailu (např. ISAAC ranní reminder
// při zrušení rezervace).

import "server-only";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * Zruší scheduled e-mail v Resendu. Bezpečné volat i pro neexistující ID
 * (vrátí 404, my logujeme a pokračujeme).
 */
export async function cancelScheduledResendEmail(emailId: string): Promise<void> {
  if (!RESEND_API_KEY || !emailId) return;
  try {
    const res = await fetch(`https://api.resend.com/emails/${emailId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      console.warn(
        `[email-scheduled] cancel ${emailId} returned ${res.status}: ${await res.text()}`,
      );
    }
  } catch (e) {
    console.warn(`[email-scheduled] cancel ${emailId} failed:`, e);
  }
}
