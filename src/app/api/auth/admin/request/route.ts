import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createLoginToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

/**
 * POST /api/auth/admin/request
 * Body: { email: string }
 * Vrací { ok: true } vždy (i pro neznámé e-maily, aby útočník nemohl
 * zjistit kdo je admin). Mail pošleme jen pokud je email whitelisted.
 */
export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  const token = await createLoginToken(email, ip).catch((e) => {
    console.error("[admin/request] token create failed:", e);
    return null;
  });

  // Vždy 200 (neleak info)
  if (!token || !RESEND_API_KEY) {
    return NextResponse.json({ ok: true });
  }

  const link = `${SITE_URL}/api/auth/admin/verify?token=${encodeURIComponent(token.rawToken)}`;
  const resend = new Resend(RESEND_API_KEY);

  await resend.emails
    .send({
      from: FROM,
      to: email,
      subject: "Přihlášení do administrace 100dola.com",
      html: `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:560px;margin:24px auto;padding:0 16px;">
<h2 style="margin:0 0 8px;font-size:18px;">Přihlášení do administrace</h2>
<p style="color:#5A6480;font-size:13px;">Klikni na tlačítko a budeš přihlášený na 8 hodin.</p>
<p style="margin:28px 0;">
  <a href="${link}" style="display:inline-block;padding:12px 22px;background:#1a1a2e;color:#fff;border-radius:9999px;text-decoration:none;font-weight:700;font-size:14px;">
    Přihlásit se
  </a>
</p>
<p style="color:#9AA3C2;font-size:11px;line-height:1.5;">
  Odkaz platí 15 minut, dá se použít jen jednou. Pokud jsi přihlášení nepožadoval, ignoruj.
  Vyžádáno z IP <code>${ip ?? "?"}</code>.
</p>
</body></html>`,
    })
    .catch((e) => {
      console.error("[admin/request] resend failed:", e);
    });

  return NextResponse.json({ ok: true });
}
