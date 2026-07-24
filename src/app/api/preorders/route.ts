import { NextRequest, NextResponse } from "next/server";
import { PreorderPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  sendPreorderConfirmation,
  sendPreorderNotification,
} from "@/lib/email";
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
  // Rate-limit: max 5 předobjednávek / 10 min / IP
  const rl = await checkRateLimit(req, { bucket: "preorders", max: 5, windowSec: 600 });
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
    // Tichá odpověď botům — předstíráme úspěch.
    return NextResponse.json({ ok: true });
  }

  const parsed = PreorderPayloadSchema.safeParse(body);
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

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "DB momentálně nedostupná, zkus to za chvíli" },
      { status: 503 },
    );
  }

  const sb = getSupabase();
  const { clientIp, userAgent } = extractClientContext(req.headers);
  const { fbp, fbc } = extractFbCookies(req.headers);

  // Insert
  const { data: row, error } = await sb
    .from("preorders")
    .insert({
      model_slug: data.modelSlug,
      model_label: data.modelLabel,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone.replace(/\s+/g, ""),
      variant_interest: data.variantInterest || null,
      size_interest: data.sizeInterest || null,
      notes: data.notes || null,
      consent_gdpr: data.consentGdpr,
      subscribe_newsletter: data.subscribeNewsletter ?? false,
      attribution: data.attribution
        ? {
            ...data.attribution,
            fbp: data.attribution.fbp ?? fbp ?? undefined,
            fbc: data.attribution.fbc ?? fbc ?? undefined,
          }
        : { fbp: fbp ?? undefined, fbc: fbc ?? undefined },
      client_ip: clientIp ?? null,
      user_agent: userAgent ?? null,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("[preorders] insert failed:", error);
    return NextResponse.json(
      { error: "Nepodařilo se uložit předobjednávku, zkus to za chvíli." },
      { status: 500 },
    );
  }

  const reservationId = row.id as string;

  // Newsletter signup (volitelný, double opt-in zatím přeskočen — interní lead, ne newsletter list)
  if (data.subscribeNewsletter) {
    try {
      await sb.from("newsletter_subscribers").upsert(
        {
          email: data.email,
          source: `preorder:${data.modelSlug}`,
          status: "pending",
        },
        { onConflict: "email" },
      );
    } catch (e) {
      console.error("[preorders] newsletter upsert failed:", e);
      // non-fatal
    }
  }

  // Emails — non-blocking; selhání nezpůsobí 500
  const emailPayload = {
    modelSlug: data.modelSlug,
    modelLabel: data.modelLabel,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    variantInterest: data.variantInterest,
    sizeInterest: data.sizeInterest,
    notes: data.notes,
    subscribeNewsletter: data.subscribeNewsletter ?? false,
  };
  await Promise.allSettled([
    sendPreorderNotification(emailPayload),
    sendPreorderConfirmation(emailPayload),
  ]);

  // Meta CAPI Lead event s dedup ID = preorder ID
  try {
    await sendMetaCapiEvent({
      eventName: "Lead",
      eventId: `preorder-${reservationId}`,
      eventSourceUrl: `https://www.100dola.com/predobjednavka/${data.modelSlug}`,
      userData: {
        email: data.email,
        phone: data.phone,
        firstName: data.fullName.split(" ")[0],
        lastName: data.fullName.split(" ").slice(1).join(" ") || undefined,
        clientIp: clientIp ?? undefined,
        userAgent: userAgent ?? undefined,
        fbp: fbp ?? undefined,
        fbc: fbc ?? undefined,
        externalId: reservationId,
      },
      customData: {
        content_name: data.modelLabel,
        content_category: "preorder",
        content_ids: [data.modelSlug],
        currency: "CZK",
        value: 150000, // průměrná hodnota Scott Spark RC; aktualizovat až bude finální ceník
      },
    });
  } catch (e) {
    console.error("[preorders] Meta CAPI failed:", e);
  }

  return NextResponse.json({
    ok: true,
    id: reservationId,
    eventId: `preorder-${reservationId}`, // shodné s CAPI Lead → browser pixel dedup
  });
}
