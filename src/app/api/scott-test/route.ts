import { NextRequest, NextResponse } from "next/server";
import { ScottTestPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import {
  sendScottTestConfirmation,
  sendScottTestNotification,
  type ScottTestEmailPayload,
} from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
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
  // Rate-limit: max 10 rezervací / 10 min / IP
  const rl = await checkRateLimit(req, { bucket: "scott-test", max: 10, windowSec: 600 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů — zkus to za chvíli." },
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

  const parsed = ScottTestPayloadSchema.safeParse(body);
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

  // Turnstile — no-op když TURNSTILE_SECRET_KEY není nastaven (viz lib/turnstile).
  const turnstileIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  if (!(await verifyTurnstile(data.turnstileToken, turnstileIp))) {
    return NextResponse.json({ error: "Ověření selhalo, zkus to znovu." }, { status: 403 });
  }

  const requestId = Date.now();
  const eventId = `scott-test-${requestId}`;

  const emailPayload: ScottTestEmailPayload = {
    fullName: data.name,
    email: data.email,
    phone: data.phone,
    bike: `${data.bike} · vel. ${data.size}`,
    term: data.term,
    notes: data.notes || undefined,
    requestId,
  };

  const { clientIp, userAgent } = extractClientContext(req.headers);
  const { fbp, fbc } = extractFbCookies(req.headers);
  const eventSourceUrl =
    req.headers.get("referer") ?? "https://www.100dola.com/clanky/scott-2027";

  // Fire-and-forget — DB záznam zde nevedeme, pošta stačí (low volume).
  // Neblokujeme response, když e-mail selže.
  Promise.allSettled([
    sendScottTestConfirmation(emailPayload),
    sendScottTestNotification(emailPayload),
    sendMetaCapiEvent({
      eventName: "Lead",
      eventId,
      eventSourceUrl,
      userData: {
        email: data.email,
        phone: data.phone,
        firstName: data.name.split(" ")[0] || undefined,
        lastName: data.name.split(" ").slice(1).join(" ") || undefined,
        country: "cz",
        clientIp,
        userAgent,
        fbp,
        fbc,
      },
      customData: {
        content_name: "SCOTT test reservation",
        content_category: data.bike,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, eventId });
}
