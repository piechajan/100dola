import { NextRequest, NextResponse } from "next/server";
import { ContactPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import { sendContactNotification, sendContactConfirmation } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  sendMetaCapiEvent,
  extractClientContext,
  extractFbCookies,
} from "@/lib/meta-capi";

function honeypotTriggered(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>)[HONEYPOT_NAME];
  return typeof v === "string" && v.length > 0;
}

export async function POST(req: NextRequest) {
  // Rate-limit: max 5 zpráv / 10 min / IP
  const rate = await checkRateLimit(req, { bucket: "contact", max: 5, windowSec: 600 });
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

  if (honeypotTriggered(body)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = ContactPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Neplatná data",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    topic: data.topic,
    message: data.message,
  };

  // Server-side Meta CAPI event (mirror browser pixel Lead event)
  const { clientIp, userAgent } = extractClientContext(req.headers);
  const { fbp, fbc } = extractFbCookies(req.headers);
  const eventSourceUrl = req.headers.get("referer") ?? "https://www.100dola.com/kontakt";
  // Sdílené event_id pro CAPI ↔ browser pixel dedup (zde nemáme DB id)
  const eventId = `contact-${crypto.randomUUID()}`;

  // Fire-and-forget — DB záznam zde nevedeme, pošta stačí (low volume)
  Promise.allSettled([
    sendContactNotification(payload),
    sendContactConfirmation(payload),
    sendMetaCapiEvent({
      eventName: "Lead",
      eventId,
      eventSourceUrl,
      userData: {
        email: data.email,
        phone: data.phone || undefined,
        firstName: data.name.split(" ")[0] || undefined,
        lastName: data.name.split(" ").slice(1).join(" ") || undefined,
        clientIp,
        userAgent,
        fbp,
        fbc,
      },
      customData: {
        content_name: "Contact form",
        content_category: data.topic,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, eventId });
}
