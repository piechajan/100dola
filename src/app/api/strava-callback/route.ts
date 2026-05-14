import { NextRequest, NextResponse } from "next/server";

// Veřejný callback pro Strava OAuth flow.
// Auto-exchange code → tokens. Klient dostane refresh_token + scope info
// k zkopírování do Vercel env (manuálně, anebo přes nepublic admin API).
//
// Excluded from middleware preview-auth (viz src/middleware.ts).

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const scope = req.nextUrl.searchParams.get("scope");

  if (error) {
    return new NextResponse(
      htmlPage({
        title: "Strava OAuth — chyba",
        body: `<h1 style="color: #E8431A">Authorization selhal</h1><p><strong>Error:</strong> ${escapeHtml(error)}</p>`,
      }),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (!code) {
    return new NextResponse(
      htmlPage({
        title: "Strava OAuth — chybí code",
        body: `<h1>Chybí parametr <code>code</code></h1><p>Tato stránka je callback. Spusť flow na /admin/strava.</p>`,
      }),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  // Auto-exchange code → tokens
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new NextResponse(
      htmlPage({
        title: "Strava OAuth — config error",
        body: `<h1 style="color: #E8431A">Chybí Strava credentials</h1><p>STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET nejsou nastavené ve Vercel env.</p>`,
      }),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  let tokens: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    athlete?: { id: number; firstname: string; lastname: string };
    scope?: string;
    errors?: unknown;
  };
  try {
    const r = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }).toString(),
    });
    tokens = await r.json();
  } catch (e) {
    return new NextResponse(
      htmlPage({
        title: "Strava OAuth — exchange failed",
        body: `<h1 style="color: #E8431A">Token exchange selhal</h1><p>${escapeHtml(String(e))}</p>`,
      }),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (!tokens.refresh_token) {
    return new NextResponse(
      htmlPage({
        title: "Strava OAuth — chyba",
        body: `<h1 style="color: #E8431A">Token neobsahuje refresh_token</h1><pre style="background:#F0F2FA;padding:12px;border-radius:8px;font-size:11px;overflow:auto">${escapeHtml(JSON.stringify(tokens, null, 2))}</pre>`,
      }),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const athlete = tokens.athlete;

  return new NextResponse(
    htmlPage({
      title: "Strava OAuth — hotovo",
      body: `
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FC4C02; font-weight: 700; margin-bottom: 8px;">100dola × Strava</div>
          <h1 style="font-size: 28px; margin: 0; color: #1a1a2e;">Authorization hotovo 🎉</h1>
          ${athlete ? `<p style="color: #5A6480; margin-top: 8px;">Přihlášeno jako <strong>${escapeHtml(athlete.firstname)} ${escapeHtml(athlete.lastname)}</strong></p>` : ""}
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6480; font-weight: 700; margin-bottom: 6px;">Refresh token (uložit do Vercel env jako STRAVA_REFRESH_TOKEN)</label>
          <input
            type="text"
            value="${escapeHtml(tokens.refresh_token)}"
            readonly
            onclick="this.select()"
            style="width: 100%; padding: 14px; font-family: 'SF Mono', 'Menlo', monospace; font-size: 12px; border: 2px solid #E2E6F3; border-radius: 12px; background: #FAFAFC; color: #1a1a2e; box-sizing: border-box;"
          />
          <button
            onclick="navigator.clipboard.writeText('${escapeHtml(tokens.refresh_token)}'); this.textContent='✓ Zkopírováno'; this.style.background='#2EAA6E'"
            style="margin-top: 8px; padding: 8px 16px; font-size: 12px; font-weight: 700; color: white; background: #FC4C02; border: none; border-radius: 8px; cursor: pointer;"
          >Zkopírovat</button>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6480; font-weight: 700; margin-bottom: 6px;">Scope (povolené oprávnění)</label>
          <div style="padding: 12px; background: #F0F4FF; border-radius: 8px; font-family: 'SF Mono', monospace; font-size: 12px; word-break: break-all;">${escapeHtml(scope || tokens.scope || "—")}</div>
        </div>

        ${athlete ? `
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6480; font-weight: 700; margin-bottom: 6px;">Athlete ID</label>
            <div style="padding: 12px; background: #F0F4FF; border-radius: 8px; font-family: 'SF Mono', monospace; font-size: 13px;">${athlete.id}</div>
          </div>
        ` : ""}

        <div style="margin-top: 28px; padding: 16px; background: #FFEFE9; border-radius: 12px; font-size: 13px; color: #5A6480; line-height: 1.6;">
          <strong style="color: #1a1a2e;">Co teď:</strong>
          <ol style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Otevři <a href="https://vercel.com" style="color: #FC4C02">Vercel</a> → projekt 100dola → Settings → Environment Variables</li>
            <li>Najdi <code>STRAVA_REFRESH_TOKEN</code> → Edit → vlož nový token</li>
            <li>Save → trigger redeploy z latest commit</li>
            <li>Hotovo. Nový refresh token bude self-renew donekonečna.</li>
          </ol>
        </div>
      `,
    }),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function htmlPage({ title, body }: { title: string; body: string }) {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 64px auto; padding: 32px; color: #1a1a2e; }
    h1 { font-weight: 800; line-height: 1.1; }
    code { background: #F0F2FA; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
