import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * Poptávka na pojištění (kolo / cestovní / úrazové). Zpracovává kamarádova
 * pojišťovací/poradenská firma — my jen sbíráme kontakt a předáváme.
 * Proto EMAIL-ONLY (žádná nová DB tabulka → žádná migrace): Janovi přijde mail
 * s kontaktem a typem zájmu, on/partner se ozve zpět.
 */

const INTEREST_VALUES = ["kolo", "cestovni", "urazove"] as const;
type Interest = (typeof INTEREST_VALUES)[number];

const INTEREST_LABELS: Record<Interest, string> = {
  kolo: "Pojištění kola (krádež a poškození)",
  cestovni: "Cestovní pojištění (zahraničí / Malaga)",
  urazove: "Úrazové / zdravotní pojištění cyklisty",
};

const PayloadSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional(),
  interests: z.array(z.enum(INTEREST_VALUES)).min(1).max(3),
  notes: z.string().max(2000).optional(),
  consent: z.literal(true),
  // Honeypot — bot vyplní, člověk ne. Ticho zahodíme.
  company: z.string().max(0).optional().or(z.literal("")),
  turnstileToken: z.string().max(4000).optional(),
});

export async function POST(req: NextRequest) {
  const rate = await checkRateLimit(req, { bucket: "pojisteni-inquiry", max: 5, windowSec: 600 });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů — zkus to za pár minut." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neplatná data", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot — tichý úspěch (bot si myslí, že prošel).
  if (data.company && data.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Turnstile — no-op když TURNSTILE_SECRET_KEY není nastaven (viz lib/turnstile).
  const turnstileIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  if (!(await verifyTurnstile(data.turnstileToken, turnstileIp))) {
    return NextResponse.json({ error: "Ověření selhalo, zkus to znovu." }, { status: 403 });
  }

  const interestLabels = data.interests.map((i) => INTEREST_LABELS[i]);

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "100dola <info@100dola.com>",
        to: ["info@100dola.com", "piecha.jan@gmail.com"],
        replyTo: data.email,
        subject: `🛡️ Poptávka pojištění: ${interestLabels.join(", ")}`,
        html: `
          <h2>Nová poptávka na pojištění</h2>
          <p><strong>Zájem o:</strong></p>
          <ul>${interestLabels.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
          <p><strong>Jméno:</strong> ${escapeHtml(data.full_name)}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p><strong>Telefon:</strong> <a href="tel:${data.phone}">${escapeHtml(data.phone)}</a></p>` : ""}
          ${data.notes ? `<p><strong>Poznámka:</strong><br>${escapeHtml(data.notes).replace(/\n/g, "<br>")}</p>` : ""}
          <hr>
          <p style="font-size:12px;color:#666">Předej kontakt partnerovi (pojišťovací/poradenská firma) nebo se ozvi sám do 24&nbsp;h.</p>
        `,
      });
    } catch (e) {
      console.warn("[pojisteni-inquiry] e-mail failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}
