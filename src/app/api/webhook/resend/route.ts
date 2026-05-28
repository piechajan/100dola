import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Resend webhook signing: HMAC SHA-256 z payloadu, klíč = WEBHOOK_SECRET ze Resend dashboardu.
// Doc: https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  try {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    // Signature header format: "sha256=<hex>" or jen "<hex>"
    const got = signature.replace(/^sha256=/, "");
    if (expected.length !== got.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(got));
  } catch {
    return false;
  }
}

interface ResendEvent {
  type: string; // "email.bounced", "email.complained", "email.delivered", ...
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    bounce?: { type: string; subType?: string; message?: string };
  };
}

const NOTIFY_EMAIL = process.env.RESEND_NOTIFY_EMAIL || "info@100dola.com";

async function notifyAdmin(subject: string, html: string, text: string): Promise<void> {
  // Lazy import — endpoint zůstává funkční i bez Resend SDK (jen log)
  try {
    const { Resend } = await import("resend");
    const key = process.env.RESEND_API_KEY;
    if (!key) return;
    const r = new Resend(key);
    await r.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject,
      html,
      text,
    });
  } catch (e) {
    console.error("[resend-webhook] notifyAdmin failed:", e);
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature =
    req.headers.get("svix-signature") ||
    req.headers.get("resend-signature") ||
    req.headers.get("x-resend-signature");

  if (!verifySignature(rawBody, signature)) {
    console.warn("[resend-webhook] signature mismatch — rejecting");
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type;
  const data = event.data || ({} as ResendEvent["data"]);
  const toEmails = data.to || [];
  const firstTo = toEmails[0] || "";

  // Pouze pro bounces a stížnosti — delivery success neřešíme
  if (type !== "email.bounced" && type !== "email.complained") {
    return NextResponse.json({ ok: true, ignored: type });
  }

  console.log(`[resend-webhook] ${type} for ${firstTo}: ${data.subject}`);

  // Pokud bouncovaný email patří ISAAC rezervaci nebo orderu, označíme to v DB
  let dbContext = "";
  if (isSupabaseConfigured() && firstTo) {
    const sb = getSupabase();
    try {
      const { data: isaac } = await sb
        .from("isaac_test_reservations")
        .select("id, full_name, slot_day_label, status")
        .eq("email", firstTo)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (isaac) {
        dbContext = `ISAAC rezervace #${isaac.id} (${isaac.full_name}, ${isaac.slot_day_label})`;
      } else {
        const { data: order } = await sb
          .from("orders")
          .select("id, name, total, status")
          .eq("email", firstTo)
          .order("registered_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (order) {
          dbContext = `Objednávka ${order.id} (${order.name}, status: ${order.status})`;
        }
      }
    } catch (e) {
      console.error("[resend-webhook] DB lookup failed:", e);
    }
  }

  const bounceDetail = data.bounce
    ? `${data.bounce.type}${data.bounce.subType ? ` / ${data.bounce.subType}` : ""}${data.bounce.message ? ` — ${data.bounce.message}` : ""}`
    : "—";

  const eventLabel =
    type === "email.bounced" ? "📬 BOUNCE" : "🚩 SPAM COMPLAINT";

  const text = [
    `${eventLabel} — Resend webhook`,
    ``,
    `Adresát:   ${firstTo}`,
    `Subject:   ${data.subject}`,
    `Email ID:  ${data.email_id}`,
    type === "email.bounced" ? `Důvod:     ${bounceDetail}` : "",
    dbContext ? `Kontext:   ${dbContext}` : "",
    ``,
    `→ Zkontroluj/oprav kontakt v adminu, případně klientovi zavolej.`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #E8431A; font-weight: 700;">${eventLabel}</div>
      <h2 style="margin: 4px 0 12px 0;">E-mail nedoručen</h2>
      <table style="width: 100%; font-size: 13px; margin: 12px 0;">
        <tr><td style="padding: 6px 0; color: #9AA3C2; width: 90px;">Adresát</td><td style="padding: 6px 0; font-weight: 700;">${firstTo}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Subject</td><td style="padding: 6px 0;">${data.subject}</td></tr>
        ${type === "email.bounced" ? `<tr><td style="padding: 6px 0; color: #9AA3C2;">Důvod</td><td style="padding: 6px 0;">${bounceDetail}</td></tr>` : ""}
        ${dbContext ? `<tr><td style="padding: 6px 0; color: #9AA3C2;">Kontext</td><td style="padding: 6px 0;">${dbContext}</td></tr>` : ""}
      </table>
      <p style="font-size: 13px; color: #5A6480; margin-top: 16px;">
        Zkontroluj/oprav kontakt v adminu, případně klientovi zavolej.
      </p>
    </div>
  `;

  await notifyAdmin(`${eventLabel}: ${firstTo}`, html, text);

  return NextResponse.json({ ok: true, processed: type });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Resend webhook (POST only)",
    types: ["email.bounced", "email.complained"],
  });
}
