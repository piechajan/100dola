import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Jednoduchý unsubscribe endpoint pro newsletter subscribery.
// Po Phase 2 (Supabase events table) se přepíše tak, aby použil DB.

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "registrations.json");

interface FileRecord {
  source: string;
  id: string;
  email: string;
  registeredAt: string;
  unsubscribedAt?: string;
  unsubscribeToken?: string;
  [k: string]: unknown;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse(htmlPage("Chybí token.", "Odkaz pro odhlášení je neplatný."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  let all: FileRecord[] = [];
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    all = JSON.parse(raw);
  } catch {
    return new NextResponse(htmlPage("Žádné záznamy.", "Pro tento e-mail nemáme žádný záznam k odhlášení."), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const idx = all.findIndex(
    (r) => r.source === "newsletter" && r.unsubscribeToken === token,
  );
  if (idx === -1) {
    return new NextResponse(htmlPage("Token neplatný.", "Tento odhlašovací odkaz není platný (nebo už byl jednou použit)."), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Mark unsubscribed (necháváme záznam pro auditní účely, jen označíme)
  all[idx].unsubscribedAt = new Date().toISOString();
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf-8");

  return new NextResponse(
    htmlPage(
      "Odhlášení proběhlo.",
      `Tvůj e-mail ${escapeHtml(all[idx].email)} už od nás nedostane žádné akční notifikace. Mrzí nás to — pokud sis to rozmyslel/a, stačí se přihlásit znovu na 100dola.com/community.`,
    ),
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlPage(title: string, body: string): string {
  return `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — 100dola</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F5F7FF; color: #1a1a2e; min-height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border: 1px solid #E2E6F3; border-radius: 16px; padding: 32px; max-width: 480px; box-shadow: 0 4px 24px rgba(26,26,46,0.06); }
    h1 { font-size: 22px; margin: 0 0 12px 0; font-weight: 800; }
    p { font-size: 15px; line-height: 1.6; color: #5A6480; margin: 0; }
    a { color: #2EAA6E; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${body}</p>
    <p style="margin-top: 20px;"><a href="https://www.100dola.com/community">← Zpět na 100dola.com/community</a></p>
  </div>
</body>
</html>`;
}
