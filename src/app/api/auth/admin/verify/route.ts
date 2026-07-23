import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyLoginTokenAndStart,
  logAdminAction,
  COOKIE_NAMES,
  SESSION_TTL_SECONDS,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Magic link verifier — PREFETCH-SAFE dvoukrok.
 *
 * GET  /api/auth/admin/verify?token=<rawToken>
 *   Jen zobrazí potvrzovací stránku s tlačítkem. NESAHÁ na DB, token NEspotřebuje.
 *   (Gmail/bezpečnostní skenery odkaz přednačtou GETem — kdybychom token
 *    spotřebovali už tady, uživateli by pak hlásil „už použit". Skenery ale
 *    neposílají POST, takže formulář níže token ochrání.)
 * POST /api/auth/admin/verify  (form: token, from)
 *   Teprve tady se token ověří + spotřebuje, nastaví se session cookie a redirect.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const from = safePath(searchParams.get("from"));
  if (!token) return errorHtml("Chybí token.");
  return confirmHtml(token, from);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = form ? String(form.get("token") ?? "") : "";
  const from = safePath(form ? String(form.get("from") ?? "") : "");
  if (!token) return errorHtml("Chybí token.");

  const ua = request.headers.get("user-agent");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  const result = await verifyLoginTokenAndStart(token, ua, ip).catch((e) => {
    console.error("[admin/verify] failed:", e);
    return null;
  });

  if (!result) return errorHtml("Odkaz je neplatný nebo už byl použit.");

  const jar = await cookies();
  jar.set(COOKIE_NAMES.session, result.sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    expires: result.expiresAt,
  });

  await logAdminAction(
    { email: result.email, role: "admin", via: "session" },
    { action: "login", metadata: { method: "magic_link" } },
    ip,
    ua,
  );

  // 303 → prohlížeč přejde na cíl GETem (ne POST)
  return NextResponse.redirect(new URL(from, request.url), 303);
}

/** Jen interní cesty (ochrana proti open-redirect / HTML injekci do value). */
function safePath(p: string | null): string {
  if (p && p.startsWith("/") && !p.startsWith("//")) return p;
  return "/admin/orders";
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function confirmHtml(token: string, from: string): Response {
  const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Přihlášení do administrace</title></head>
<body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:420px;margin:80px auto;padding:0 16px;text-align:center;">
  <h2 style="font-size:20px;margin-bottom:8px;">Přihlášení do administrace</h2>
  <p style="color:#5A6480;font-size:14px;margin-bottom:28px;">Klikni pro dokončení přihlášení.</p>
  <form method="POST" action="/api/auth/admin/verify">
    <input type="hidden" name="token" value="${esc(token)}">
    <input type="hidden" name="from" value="${esc(from)}">
    <button type="submit" style="display:inline-block;padding:13px 26px;background:#1a1a2e;color:#fff;border:0;border-radius:9999px;font-weight:700;font-size:15px;cursor:pointer;">
      Přihlásit se
    </button>
  </form>
  <p style="color:#9AA3C2;font-size:12px;margin-top:24px;">Odkaz je jednorázový a platí 15 minut.</p>
</body></html>`;
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}

function errorHtml(msg: string): Response {
  const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Přihlášení</title></head>
<body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:480px;margin:80px auto;padding:0 16px;text-align:center;">
  <h2 style="font-size:18px;">Přihlášení selhalo</h2>
  <p style="color:#5A6480;">${esc(msg)}</p>
  <p style="margin-top:24px;">
    <a href="/admin/login" style="color:#3B7CF4;">Zkus to znova</a>
  </p>
</body></html>`;
  return new Response(html, { status: 401, headers: { "content-type": "text/html; charset=utf-8" } });
}
