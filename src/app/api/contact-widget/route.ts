import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateAIDraft } from "@/lib/contact-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  pageUrl?: string;
  productSlug?: string;
  honeypot?: string;
}

const RATE_LIMIT_PER_HOUR = 5;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (body.honeypot && body.honeypot.trim() !== "") {
    await logHoneypotHit(req, body);
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  const phone = (body.phone ?? "").trim();

  if (!name || name.length < 2) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  if (!message || message.length < 5)
    return NextResponse.json({ ok: false, error: "message_too_short" }, { status: 400 });
  if (message.length > 4000)
    return NextResponse.json({ ok: false, error: "message_too_long" }, { status: 400 });

  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") ?? null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: "no_db" }, { status: 500 });
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  if (ip) {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await sb
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("honeypot_caught", false)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_PER_HOUR)
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const ai = await generateAIDraft({
    customerName: name,
    customerEmail: email,
    customerPhone: phone || null,
    message,
    pageUrl: body.pageUrl ?? null,
    productSlug: body.productSlug ?? null,
  });

  const insertPayload: Record<string, unknown> = {
    name,
    email,
    phone: phone || null,
    message,
    page_url: body.pageUrl ?? null,
    product_slug: body.productSlug ?? null,
    ip_address: ip,
    user_agent: ua,
    status: "new",
  };
  if (ai.ok) {
    insertPayload.ai_draft = ai.data.draft;
    insertPayload.ai_model = ai.data.model;
    insertPayload.ai_tokens_in = ai.data.tokensIn;
    insertPayload.ai_tokens_out = ai.data.tokensOut;
  } else {
    insertPayload.ai_error = ai.error;
  }

  const { data: row, error: insErr } = await sb
    .from("contact_messages")
    .insert(insertPayload)
    .select("id")
    .single();
  if (insErr) {
    console.error("[api] insert failed:", insErr.message);
    return NextResponse.json({ ok: false, error: "Nepodařilo se uložit, zkus to prosím znovu." }, { status: 500 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
    const adminTo = process.env.RESEND_NOTIFY_EMAIL || "piecha.jan@gmail.com";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";
    const messageId = (row as { id: string }).id;

    try {
      await resend.emails.send({
        from,
        to: adminTo,
        replyTo: email,
        subject: `[100dola chat] Nová zpráva od ${name}`,
        html: adminNotificationHtml({
          name,
          email,
          phone,
          message,
          pageUrl: body.pageUrl ?? null,
          productSlug: body.productSlug ?? null,
          aiDraft: ai.ok ? ai.data.draft : null,
          aiError: ai.ok ? null : ai.error,
          inboxUrl: `${siteUrl}/admin/messages/${messageId}`,
        }),
      });
      await sb
        .from("contact_messages")
        .update({ notification_sent_at: new Date().toISOString() })
        .eq("id", messageId);
    } catch (e) {
      console.error("[contact-widget] admin notify fail:", e);
    }

    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Dostali jsme tvou zprávu — 100dola",
        html: customerAutoReplyHtml(name),
      });
      await sb
        .from("contact_messages")
        .update({ auto_reply_sent_at: new Date().toISOString() })
        .eq("id", messageId);
    } catch (e) {
      console.error("[contact-widget] auto-reply fail:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

async function logHoneypotHit(req: Request, body: Body) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  await sb.from("contact_messages").insert({
    name: (body.name ?? "honeypot").slice(0, 100),
    email: (body.email ?? "honeypot@spam").slice(0, 200),
    message: (body.message ?? "(honeypot)").slice(0, 1000),
    ip_address: clientIp(req),
    user_agent: req.headers.get("user-agent") ?? null,
    honeypot_caught: true,
    status: "spam",
  });
}

function clientIp(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function adminNotificationHtml(args: {
  name: string;
  email: string;
  phone: string;
  message: string;
  pageUrl: string | null;
  productSlug: string | null;
  aiDraft: string | null;
  aiError: string | null;
  inboxUrl: string;
}): string {
  const ctx: string[] = [];
  if (args.pageUrl) ctx.push(`<li>Z webu: <a href="${escape(args.pageUrl)}">${escape(args.pageUrl)}</a></li>`);
  if (args.productSlug) ctx.push(`<li>Produkt: <code>${escape(args.productSlug)}</code></li>`);
  if (args.phone) ctx.push(`<li>Telefon: ${escape(args.phone)}</li>`);
  const ctxHtml = ctx.length > 0 ? `<ul style="font-size:12px;color:#5A6480;">${ctx.join("")}</ul>` : "";

  const aiHtml = args.aiDraft
    ? `<div style="margin:20px 0;padding:14px;background:#F0F7FF;border-left:3px solid #3B7CF4;border-radius:8px;">
         <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#3B7CF4;font-weight:700;margin-bottom:6px;">AI návrh odpovědi (Claude Haiku)</div>
         <pre style="margin:0;font-family:inherit;font-size:14px;white-space:pre-wrap;color:#1a1a2e;">${escape(args.aiDraft)}</pre>
       </div>`
    : args.aiError
      ? `<div style="margin:20px 0;padding:14px;background:#FFF7ED;border-left:3px solid #F59E0B;border-radius:8px;font-size:12px;color:#92400E;">
           AI návrh nedostupný: <code>${escape(args.aiError)}</code>
         </div>`
      : "";

  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:600px;margin:24px auto;padding:0 16px;line-height:1.5;">
  <h2 style="margin:0 0 4px;font-size:18px;">${escape(args.name)} &lt;${escape(args.email)}&gt;</h2>
  ${ctxHtml}
  <div style="margin:16px 0;padding:14px;background:#F7F9FF;border-radius:10px;border:1px solid #E2E6F3;">
    <pre style="margin:0;font-family:inherit;font-size:14px;white-space:pre-wrap;">${escape(args.message)}</pre>
  </div>
  ${aiHtml}
  <p style="font-size:12px;color:#9AA3C2;">
    Můžeš odpovědět přímo na tento e-mail (Reply-To je nastaven na zákazníka), nebo otevři
    <a href="${escape(args.inboxUrl)}" style="color:#3B7CF4;">inbox v adminu</a>.
  </p>
</body></html>`;
}

function customerAutoReplyHtml(name: string): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:560px;margin:24px auto;padding:0 16px;line-height:1.55;">
  <h2 style="margin:0 0 8px;font-size:18px;">Díky za zprávu, ${escape(name)}!</h2>
  <p style="font-size:14px;color:#5A6480;">
    Dostali jsme tvůj dotaz a do <strong>24 hodin</strong> ti pošlu odpověď přímo já (Jan).
  </p>
  <p style="font-size:14px;color:#5A6480;">
    Pokud spěchá, klidně rovnou volej: <a href="tel:+420739045057" style="color:#3B7CF4;">+420 739 045 057</a>.
  </p>
  <p style="margin:28px 0 4px;font-size:14px;">Měj se,</p>
  <p style="margin:0;font-size:14px;font-weight:700;">Jan / 100dola</p>
  <hr style="margin:32px 0 12px;border:none;border-top:1px solid #E2E6F3;">
  <p style="font-size:11px;color:#9AA3C2;">
    100dola sport · FUTUNATU s.r.o. · Šternberk<br>
    <a href="https://www.100dola.com" style="color:#9AA3C2;">www.100dola.com</a>
  </p>
</body></html>`;
}
