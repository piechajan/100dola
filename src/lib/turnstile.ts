// Cloudflare Turnstile — server-side verifikace tokenu.
//
// GRACEFUL NO-OP: když TURNSTILE_SECRET_KEY není nastaven, verifyTurnstile()
// vrací `true` (přeskočí ověření). Díky tomu je merge do main bezpečný ještě
// před nasazením klíčů — formuláře fungují přesně jako dřív. Turnstile začne
// reálně gatovat submissiony teprve až jsou nastaveny OBA klíče (site + secret).

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Ověří Turnstile token proti Cloudflare siteverify API.
 *
 * - Secret NENÍ nastaven → vrací `true` (skip, graceful no-op).
 * - Secret nastaven, token prázdný/chybí → vrací `false`.
 * - Secret nastaven, fetch selže → vrací `false` (fail-closed jen když je
 *   verifikace reálně zapnutá).
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // no-op — Turnstile není nakonfigurován

  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip) form.set("remoteip", ip);

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.warn("[turnstile] siteverify failed:", e);
    return false;
  }
}
