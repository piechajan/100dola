import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVICE_TYPES = ["servis", "bikefit", "detailing", "jine"] as const;
const SERVICE_LABELS: Record<string, string> = {
  servis: "Servis kola",
  bikefit: "Bikefit",
  detailing: "Detailing / mytí",
  jine: "Jiný požadavek",
};

interface Body {
  name?: string;
  email?: string;
  phone?: string;
  serviceType?: string;
  bikeBrand?: string;
  bikeModel?: string;
  bikeKind?: string;
  preferredDate?: string;
  preferredTimeLabel?: string;
  flexibility?: string;
  description?: string;
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
    return NextResponse.json({ ok: true }); // silent honeypot
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const serviceType = (body.serviceType ?? "").trim();
  const description = (body.description ?? "").trim();

  if (!name || name.length < 2) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  if (!phone || phone.length < 5) return NextResponse.json({ ok: false, error: "phone_required" }, { status: 400 });
  if (!SERVICE_TYPES.includes(serviceType as (typeof SERVICE_TYPES)[number]))
    return NextResponse.json({ ok: false, error: "invalid_service_type" }, { status: 400 });
  if (!description || description.length < 5)
    return NextResponse.json({ ok: false, error: "description_too_short" }, { status: 400 });

  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") ?? null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: "no_db" }, { status: 500 });
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  if (ip) {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await sb
      .from("service_bookings")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("honeypot_caught", false)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_PER_HOUR)
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const { data: row, error: insErr } = await sb
    .from("service_bookings")
    .insert({
      name,
      email,
      phone,
      service_type: serviceType,
      bike_brand: body.bikeBrand?.trim() || null,
      bike_model: body.bikeModel?.trim() || null,
      bike_kind: body.bikeKind?.trim() || null,
      preferred_date: body.preferredDate?.trim() || null,
      preferred_time_label: body.preferredTimeLabel?.trim() || null,
      flexibility: body.flexibility?.trim() || null,
      description,
      ip_address: ip,
      user_agent: ua,
    })
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

    const serviceLabel = SERVICE_LABELS[serviceType] ?? serviceType;

    try {
      await resend.emails.send({
        from,
        to: adminTo,
        replyTo: email,
        subject: `[Servis] ${serviceLabel} — ${name}`,
        html: adminBookingHtml({
          name,
          email,
          phone,
          serviceLabel,
          bikeBrand: body.bikeBrand?.trim() || null,
          bikeModel: body.bikeModel?.trim() || null,
          bikeKind: body.bikeKind?.trim() || null,
          preferredDate: body.preferredDate?.trim() || null,
          preferredTimeLabel: body.preferredTimeLabel?.trim() || null,
          flexibility: body.flexibility?.trim() || null,
          description,
          bookingId: (row as { id: string }).id,
        }),
      });
    } catch (e) {
      console.error("[service-booking] admin notify fail:", e);
    }

    try {
      await resend.emails.send({
        from,
        to: email,
        subject: `Dostali jsme tvou rezervaci na ${serviceLabel.toLowerCase()} — 100dola`,
        html: customerConfirmHtml(name, serviceLabel),
      });
    } catch (e) {
      console.error("[service-booking] auto-reply fail:", e);
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

function adminBookingHtml(args: {
  name: string;
  email: string;
  phone: string;
  serviceLabel: string;
  bikeBrand: string | null;
  bikeModel: string | null;
  bikeKind: string | null;
  preferredDate: string | null;
  preferredTimeLabel: string | null;
  flexibility: string | null;
  description: string;
  bookingId: string;
}): string {
  const bikeParts = [args.bikeBrand, args.bikeModel].filter(Boolean).join(" ");
  const bikeStr = bikeParts || args.bikeKind || "—";
  const slotParts = [args.preferredDate, args.preferredTimeLabel, args.flexibility]
    .filter(Boolean).join(" · ") || "—";

  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:600px;margin:24px auto;padding:0 16px;line-height:1.5;">
  <div style="background:#FEF3C7;color:#92400E;padding:8px 14px;border-radius:8px;font-weight:700;font-size:12px;display:inline-block;margin-bottom:12px;">
    ${escape(args.serviceLabel)}
  </div>
  <h2 style="margin:0 0 4px;font-size:18px;">${escape(args.name)}</h2>
  <p style="font-size:13px;color:#5A6480;margin:0;">
    📧 <a href="mailto:${escape(args.email)}" style="color:#3B7CF4;">${escape(args.email)}</a><br>
    📞 <a href="tel:${escape(args.phone)}" style="color:#3B7CF4;">${escape(args.phone)}</a>
  </p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
    <tr><td style="padding:6px 0;color:#9AA3C2;width:120px;">Kolo:</td><td style="padding:6px 0;"><strong>${escape(bikeStr)}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#9AA3C2;">Termín:</td><td style="padding:6px 0;"><strong>${escape(slotParts)}</strong></td></tr>
  </table>
  <div style="margin:16px 0;padding:14px;background:#F7F9FF;border-radius:10px;border:1px solid #E2E6F3;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9AA3C2;font-weight:700;margin-bottom:6px;">Popis</div>
    <pre style="margin:0;font-family:inherit;font-size:14px;white-space:pre-wrap;">${escape(args.description)}</pre>
  </div>
  <p style="font-size:12px;color:#9AA3C2;">
    Booking ID <code>${escape(args.bookingId)}</code> ·
    <a href="https://www.100dola.com/admin/bookings/${escape(args.bookingId)}" style="color:#3B7CF4;">otevřít v admin</a>
  </p>
</body></html>`;
}

function customerConfirmHtml(name: string, serviceLabel: string): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:560px;margin:24px auto;padding:0 16px;line-height:1.55;">
  <h2 style="margin:0 0 8px;font-size:18px;">Díky, ${escape(name)}!</h2>
  <p style="font-size:14px;color:#5A6480;">
    Dostal jsem tvou rezervaci na <strong>${escape(serviceLabel.toLowerCase())}</strong>.
    Ozvu se ti do <strong>24 hodin</strong> s potvrzením přesného termínu — buď e-mailem,
    nebo telefonem.
  </p>
  <p style="font-size:14px;color:#5A6480;">
    Pokud spěchá, klidně rovnou volej: <a href="tel:+420739045057" style="color:#3B7CF4;">+420 739 045 057</a>.
  </p>
  <p style="margin:28px 0 4px;font-size:14px;">Měj se,</p>
  <p style="margin:0;font-size:14px;font-weight:700;">Jan / 100dola sport, Šternberk</p>
  <hr style="margin:32px 0 12px;border:none;border-top:1px solid #E2E6F3;">
  <p style="font-size:11px;color:#9AA3C2;">
    100dola sport · FUTUNATU s.r.o. · Partyzánská 2, Šternberk<br>
    <a href="https://www.100dola.com" style="color:#9AA3C2;">www.100dola.com</a>
  </p>
</body></html>`;
}
