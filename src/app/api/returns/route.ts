import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETURN_TYPES = ["withdrawal", "warranty", "damaged", "other"] as const;
const TYPE_LABELS: Record<string, string> = {
  withdrawal: "Odstoupení od smlouvy (14 dnů)",
  warranty: "Reklamace v záruce",
  damaged: "Poškozeno v dopravě",
  other: "Jiný důvod",
};

interface Body {
  orderId?: string;
  customerEmail?: string;
  returnType?: string;
  itemsDescription?: string;
  reason?: string;
  honeypot?: string;
}

const RATE_LIMIT_PER_HOUR = 3;

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

  const orderId = (body.orderId ?? "").trim();
  const customerEmail = (body.customerEmail ?? "").trim().toLowerCase();
  const returnType = (body.returnType ?? "").trim();
  const itemsDescription = (body.itemsDescription ?? "").trim();
  const reason = (body.reason ?? "").trim();

  if (!orderId) return NextResponse.json({ ok: false, error: "order_id_required" }, { status: 400 });
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  if (!RETURN_TYPES.includes(returnType as (typeof RETURN_TYPES)[number]))
    return NextResponse.json({ ok: false, error: "invalid_return_type" }, { status: 400 });
  if (!itemsDescription || itemsDescription.length < 3)
    return NextResponse.json({ ok: false, error: "items_required" }, { status: 400 });
  if (!reason || reason.length < 5)
    return NextResponse.json({ ok: false, error: "reason_too_short" }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: "no_db" }, { status: 500 });
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Ověř že order existuje + email odpovídá (anti-spoofing)
  const { data: order } = await sb
    .from("orders")
    .select("id, email, name, paid_at, shipped_at, total")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
  if ((order.email as string).toLowerCase() !== customerEmail)
    return NextResponse.json({ ok: false, error: "email_mismatch" }, { status: 403 });

  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") ?? null;

  if (ip) {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await sb
      .from("returns")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("honeypot_caught", false)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_PER_HOUR)
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const { data: row, error: insErr } = await sb
    .from("returns")
    .insert({
      order_id: orderId,
      customer_email: customerEmail,
      return_type: returnType,
      items_description: itemsDescription,
      reason,
      ip_address: ip,
      user_agent: ua,
    })
    .select("id")
    .single();
  if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
    const adminTo = process.env.RESEND_NOTIFY_EMAIL || "piecha.jan@gmail.com";
    const typeLabel = TYPE_LABELS[returnType] ?? returnType;

    try {
      await resend.emails.send({
        from,
        to: adminTo,
        replyTo: customerEmail,
        subject: `[Vrácení] ${typeLabel} — objednávka ${orderId}`,
        html: adminReturnHtml({
          customerName: (order.name as string) ?? customerEmail,
          customerEmail,
          orderId,
          typeLabel,
          itemsDescription,
          reason,
          returnId: (row as { id: string }).id,
        }),
      });
    } catch (e) {
      console.error("[returns] admin notify fail:", e);
    }

    try {
      await resend.emails.send({
        from,
        to: customerEmail,
        subject: `Žádost o vrácení přijata — objednávka ${orderId}`,
        html: customerConfirmHtml(
          (order.name as string) ?? customerEmail,
          orderId,
          typeLabel,
        ),
      });
    } catch (e) {
      console.error("[returns] auto-reply fail:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

function clientIp(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function adminReturnHtml(args: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  typeLabel: string;
  itemsDescription: string;
  reason: string;
  returnId: string;
}): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:600px;margin:24px auto;padding:0 16px;line-height:1.5;">
  <div style="background:#FEE2E2;color:#991B1B;padding:8px 14px;border-radius:8px;font-weight:700;font-size:12px;display:inline-block;margin-bottom:12px;">
    ${escape(args.typeLabel)}
  </div>
  <h2 style="margin:0 0 4px;font-size:18px;">${escape(args.customerName)}</h2>
  <p style="font-size:13px;color:#5A6480;margin:0 0 16px;">
    📧 <a href="mailto:${escape(args.customerEmail)}" style="color:#3B7CF4;">${escape(args.customerEmail)}</a><br>
    📦 Objednávka <a href="https://www.100dola.com/admin/orders/${escape(args.orderId)}" style="color:#3B7CF4;font-family:ui-monospace,monospace;">${escape(args.orderId)}</a>
  </p>
  <div style="margin:16px 0;padding:14px;background:#F7F9FF;border-radius:10px;border:1px solid #E2E6F3;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9AA3C2;font-weight:700;margin-bottom:6px;">Co vrací</div>
    <p style="margin:0;font-size:14px;">${escape(args.itemsDescription)}</p>
  </div>
  <div style="margin:16px 0;padding:14px;background:#F7F9FF;border-radius:10px;border:1px solid #E2E6F3;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9AA3C2;font-weight:700;margin-bottom:6px;">Důvod</div>
    <pre style="margin:0;font-family:inherit;font-size:14px;white-space:pre-wrap;">${escape(args.reason)}</pre>
  </div>
  <p style="font-size:12px;color:#9AA3C2;">
    <a href="https://www.100dola.com/admin/returns/${escape(args.returnId)}" style="color:#3B7CF4;">Otevřít v admin →</a>
  </p>
</body></html>`;
}

function customerConfirmHtml(name: string, orderId: string, typeLabel: string): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:560px;margin:24px auto;padding:0 16px;line-height:1.55;">
  <h2 style="margin:0 0 8px;font-size:18px;">Dostal jsem tvou žádost o vrácení, ${escape(name)}.</h2>
  <p style="font-size:14px;color:#5A6480;">
    Typ: <strong>${escape(typeLabel)}</strong><br>
    Objednávka: <strong>${escape(orderId)}</strong>
  </p>
  <p style="font-size:14px;color:#5A6480;">
    Do <strong>2 pracovních dnů</strong> ti pošlu instrukce — adresa pro odeslání, případně formulář
    pro odstoupení od smlouvy. Pokud spěchá, klidně rovnou volej <a href="tel:+420739045057" style="color:#3B7CF4;">+420 739 045 057</a>.
  </p>
  <p style="margin:28px 0 4px;font-size:14px;">Měj se,</p>
  <p style="margin:0;font-size:14px;font-weight:700;">Jan / 100dola</p>
  <hr style="margin:32px 0 12px;border:none;border-top:1px solid #E2E6F3;">
  <p style="font-size:11px;color:#9AA3C2;">
    100dola sport · FUTUNATU s.r.o. · Partyzánská 2, Šternberk<br>
    <a href="https://www.100dola.com" style="color:#9AA3C2;">www.100dola.com</a>
  </p>
</body></html>`;
}
