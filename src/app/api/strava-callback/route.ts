import { NextRequest, NextResponse } from "next/server";

// Veřejný callback pro Strava OAuth flow.
// Zachytí `code` z query stringu a zobrazí ho ve stránce — uživatel ho ručně
// zkopíruje a pošle dál (nebo Claude exchange přes API).
//
// Excluded from middleware preview-auth (viz src/middleware.ts).

export function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const state = req.nextUrl.searchParams.get("state");

  if (error) {
    return new NextResponse(
      htmlPage({
        title: "Strava OAuth — chyba",
        body: `<h1 style="color: #E8431A">Strava authorization selhal</h1><p><strong>Error:</strong> ${escapeHtml(error)}</p><p>Vrať se zpět a zkus to znovu.</p>`,
      }),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (!code) {
    return new NextResponse(
      htmlPage({
        title: "Strava OAuth — chybí code",
        body: `<h1>Chybí parametr <code>code</code></h1><p>Tato stránka je callback pro Strava OAuth flow. Není určená pro přímou návštěvu.</p>`,
      }),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  return new NextResponse(
    htmlPage({
      title: "Strava OAuth — code přijat",
      body: `
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FC4C02; font-weight: 700; margin-bottom: 8px;">100dola × Strava</div>
          <h1 style="font-size: 28px; margin: 0; color: #1a1a2e;">Authorization úspěšný 🎉</h1>
          <p style="color: #5A6480; margin-top: 8px;">Zkopíruj kód níže a pošli ho zpět do chatu s Claude.</p>
        </div>

        <div style="margin-bottom: 24px;">
          <label style="display: block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6480; font-weight: 700; margin-bottom: 6px;">Authorization Code</label>
          <input
            type="text"
            value="${escapeHtml(code)}"
            readonly
            onclick="this.select()"
            style="width: 100%; padding: 14px; font-family: 'SF Mono', 'Menlo', monospace; font-size: 13px; border: 2px solid #E2E6F3; border-radius: 12px; background: #FAFAFC; color: #1a1a2e; box-sizing: border-box;"
          />
        </div>

        <button
          onclick="navigator.clipboard.writeText('${escapeHtml(code)}'); this.textContent='✓ Zkopírováno'; this.style.background='#2EAA6E'"
          style="width: 100%; padding: 14px; font-size: 14px; font-weight: 700; color: white; background: #FC4C02; border: none; border-radius: 12px; cursor: pointer;"
        >
          Zkopírovat do clipboardu
        </button>

        ${state ? `<p style="margin-top: 16px; font-size: 12px; color: #9AA3C2;">State: ${escapeHtml(state)}</p>` : ""}

        <div style="margin-top: 32px; padding: 16px; background: #FFEFE9; border-radius: 12px; font-size: 13px; color: #5A6480; line-height: 1.5;">
          <strong style="color: #1a1a2e;">⚠ Pozor:</strong> tento kód platí jen ~5 minut. Pošli ho do chatu hned, nebo opakuj OAuth flow.
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
