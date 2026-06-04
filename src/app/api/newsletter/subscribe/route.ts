import { NextResponse } from "next/server";
import { Resend } from "resend";
import { upsertSubscriber } from "@/lib/newsletter-subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  email?: string;
  name?: string;
  source?: "shop" | "community" | "malaga" | "lab";
  honeypot?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (body.honeypot && body.honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = req.headers.get("user-agent") ?? null;
  const source = body.source ?? "shop";

  const result = await upsertSubscriber({
    email,
    name: body.name?.trim() || null,
    source,
    ipAddress: ip,
    userAgent: ua,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error ?? "subscribe_failed" }, { status: 500 });
  }

  if (result.alreadyConfirmed) {
    return NextResponse.json({ ok: true, status: "already_confirmed" });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";
  if (resendKey && result.confirmationToken && result.unsubscribeToken) {
    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
    const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${result.confirmationToken}`;
    const unsubUrl = `${siteUrl}/api/unsubscribe?token=${result.unsubscribeToken}`;

    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Potvrď e-mail — newsletter 100dola",
        html: confirmEmailHtml(body.name?.trim() || "", confirmUrl, unsubUrl),
      });
    } catch (e) {
      console.error("[newsletter/subscribe] confirm mail fail:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    status: result.resubscribed ? "resubscribed" : result.alreadyPending ? "already_pending" : "pending",
  });
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function confirmEmailHtml(name: string, confirmUrl: string, unsubUrl: string): string {
  const greet = name ? `Ahoj ${escape(name)},` : "Ahoj,";
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:560px;margin:24px auto;padding:0 16px;line-height:1.55;">
  <h2 style="margin:0 0 8px;font-size:18px;">${greet}</h2>
  <p style="font-size:14px;color:#5A6480;">
    Díky, že máš zájem o newsletter 100dola. Než ti začneme něco posílat, potřebujeme
    od tebe potvrzení, že je e-mail opravdu tvůj (GDPR double opt-in).
  </p>
  <p style="margin:24px 0;">
    <a href="${escape(confirmUrl)}" style="display:inline-block;padding:12px 22px;background:#1a1a2e;color:#fff;border-radius:9999px;text-decoration:none;font-weight:700;font-size:14px;">
      Potvrdit e-mail →
    </a>
  </p>
  <p style="font-size:13px;color:#5A6480;">
    Co od nás můžeš čekat? Cca 1× měsíčně novinky ze shopu, tipy z tréninků, info o akcích
    Open Miles Clinic a sezónní akce na vybavení. Žádný spam.
  </p>
  <p style="font-size:12px;color:#9AA3C2;margin-top:24px;">
    Tip: pokud nepamatuješ, že ses zapsal/a, klidně ignoruj — nic ti nepřijde.
    Nebo si rovnou <a href="${escape(unsubUrl)}" style="color:#9AA3C2;">odhlas</a>.
  </p>
  <hr style="margin:32px 0 12px;border:none;border-top:1px solid #E2E6F3;">
  <p style="font-size:11px;color:#9AA3C2;">
    100dola sport · FUTUNATU s.r.o. · Šternberk<br>
    <a href="https://www.100dola.com" style="color:#9AA3C2;">www.100dola.com</a>
  </p>
</body></html>`;
}
