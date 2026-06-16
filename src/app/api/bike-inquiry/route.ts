import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";

const PayloadSchema = z.object({
  bike_model: z.string().min(1).max(200),
  bike_variant: z.string().max(200).nullable().optional(),
  full_name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
  consent: z.literal(true),
});

export async function POST(req: NextRequest) {
  const rate = await checkRateLimit(req, { bucket: "bike-inquiry", max: 5, windowSec: 600 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Příliš mnoho pokusů — zkus to za pár minut." }, { status: 429 });
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

  // Insert do Supabase — bike_inquiries tabulka (vytvoří se přes migraci 036)
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try {
      const sb = createClient(url, key, { auth: { persistSession: false } });
      await sb.from("bike_inquiries").insert({
        bike_model: data.bike_model,
        bike_variant: data.bike_variant ?? null,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        notes: data.notes || null,
        consent_gdpr: data.consent,
        client_ip: req.headers.get("x-forwarded-for")?.split(",")[0] || null,
        user_agent: req.headers.get("user-agent") || null,
      });
    } catch (e) {
      console.warn("[bike-inquiry] DB insert failed:", e);
      // Pokračujeme, e-mail je primární cesta — DB je backup pro CRM.
    }
  }

  // E-mail notifikace Janovi (primární cesta — Jan zavolá zpět)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const variant = data.bike_variant ? ` · ${data.bike_variant}` : "";
      await resend.emails.send({
        from: "100dola sport <info@100dola.com>",
        to: ["info@100dola.com", "piecha.jan@gmail.com"],
        replyTo: data.email,
        subject: `🚲 Poptávka: ${data.bike_model}${variant}`,
        html: `
          <h2>Nová poptávka na kolo</h2>
          <p><strong>Model:</strong> ${escapeHtml(data.bike_model)}${variant ? ` · ${escapeHtml(data.bike_variant ?? "")}` : ""}</p>
          <p><strong>Jméno:</strong> ${escapeHtml(data.full_name)}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p><strong>Telefon:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ""}
          ${data.notes ? `<p><strong>Poznámka:</strong><br>${escapeHtml(data.notes).replace(/\n/g, "<br>")}</p>` : ""}
          <hr>
          <p style="font-size:12px;color:#666">Ozvi se zákazníkovi do 24 h.</p>
        `,
      });
    } catch (e) {
      console.warn("[bike-inquiry] e-mail failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}
