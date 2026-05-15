// Setup endpoint — vytvoří webhook ve Fakturoidu pro invoice_paid events.
//
// Použití (jednorázově):
//   POST /api/admin/fakturoid/setup-webhook
//     → odpověď obsahuje secret_key
//     → zkopírovat do Vercel env: FAKTUROID_WEBHOOK_SECRET
//     → redeploy
//
// GET vrátí seznam existujících webhooků (pro kontrolu).

import { NextRequest, NextResponse } from "next/server";
import {
  createWebhook,
  listWebhooks,
  deleteWebhook,
  isFakturoidConfigured,
} from "@/lib/fakturoid";

function authGuard(req: NextRequest): NextResponse | null {
  const auth = req.cookies.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isFakturoidConfigured()) {
    return NextResponse.json(
      { error: "Fakturoid env vars chybí (SLUG / CLIENT_ID / CLIENT_SECRET)" },
      { status: 503 },
    );
  }
  return null;
}

function webhookUrl(req: NextRequest): string {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return `${envBase.replace(/\/$/, "")}/api/fakturoid/webhook`;
  // Fallback — z hostu z requestu, ale jen pokud je 100dola.com (aby se webhook neregistroval z localhost).
  // VŽDY používej www subdoménu — apex 100dola.com redirektuje 307 na www a webhook služby
  // při redirectu typicky neposlají Authorization header → 401.
  let host = req.headers.get("host") || "www.100dola.com";
  if (host === "100dola.com") host = "www.100dola.com";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}/api/fakturoid/webhook`;
}

export async function GET(req: NextRequest) {
  const guard = authGuard(req);
  if (guard) return guard;

  try {
    const webhooks = await listWebhooks();
    return NextResponse.json({
      ok: true,
      targetUrl: webhookUrl(req),
      webhooks: webhooks.map((w) => ({
        id: w.id,
        url: w.url,
        events: w.events,
        enabled: w.enabled,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = authGuard(req);
  if (guard) return guard;

  const url = webhookUrl(req);
  if (url.includes("localhost")) {
    return NextResponse.json(
      { error: "Nelze registrovat webhook s localhost URL. Nastav NEXT_PUBLIC_BASE_URL=https://100dola.com" },
      { status: 400 },
    );
  }

  try {
    // Pokud už existuje webhook na stejnou URL, smaž starý (aby nevznikly duplicity).
    const existing = await listWebhooks();
    for (const w of existing) {
      if (w.url === url) {
        await deleteWebhook(w.id);
        console.log(`[setup-webhook] deleted existing webhook id=${w.id}`);
      }
    }

    const webhook = await createWebhook({
      url,
      events: ["invoice_paid"],
      payloadType: "json",
    });

    return NextResponse.json({
      ok: true,
      webhookId: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secretKey: webhook.secret_key,
      nextSteps: [
        "1. Zkopíruj secretKey výše",
        "2. Vercel → Project → Settings → Environment Variables",
        "3. Přidej FAKTUROID_WEBHOOK_SECRET = <secretKey>",
        "4. Redeploy",
        "5. Zapni FIO bank sync ve Fakturoid (Nastavení → Účty → Přidat banku)",
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[setup-webhook] failed:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = authGuard(req);
  if (guard) return guard;

  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  if (!idParam) {
    return NextResponse.json({ error: "?id=<webhookId> required" }, { status: 400 });
  }
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await deleteWebhook(id);
    return NextResponse.json({ ok: true, deleted: id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
