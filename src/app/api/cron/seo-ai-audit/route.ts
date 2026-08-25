import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";
import { logCronRun } from "@/lib/cron-monitor";
import { sendInternalReport } from "@/lib/email";

/**
 * Měsíční automatický audit SEO + AI-search (GEO/AEO) zdraví webu.
 * Self-fetch produkčních URL, ověří klíčové signály (llms.txt, robots pro AI
 * crawlery, sitemap, Product/Organization JSON-LD, SearchAction, meta na
 * homepage) a pošle report e-mailem přes Resend na notifikační adresu.
 *
 * Cron: 1× měsíčně (viz vercel.json). Doplňuje hlubší čtvrtletní cloud agent
 * (routines dashboard). Referraly z AI (ChatGPT/Perplexity…) tento cron neměří
 * — na to je Vercel Analytics → Referrers (report to připomene).
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

type Status = "ok" | "warn" | "fail";
interface Check {
  area: "AI-search" | "SEO";
  name: string;
  status: Status;
  detail: string;
}

async function fetchText(path: string): Promise<{ status: number; ok: boolean; body: string }> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "user-agent": "100dola-seo-ai-audit/1.0" },
      cache: "no-store",
    });
    const body = await res.text();
    return { status: res.status, ok: res.ok, body };
  } catch (e) {
    return { status: 0, ok: false, body: e instanceof Error ? e.message : String(e) };
  }
}

async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const sampleSlug =
    PRODUCTS.find((p) => p.categoryId.startsWith("kola"))?.slug ?? PRODUCTS[0]?.slug ?? "";

  const [llms, robots, sitemap, home, pdp] = await Promise.all([
    fetchText("/llms.txt"),
    fetchText("/robots.txt"),
    fetchText("/sitemap.xml"),
    fetchText("/"),
    fetchText(`/shop/${sampleSlug}`),
  ]);

  // ── AI-search ──────────────────────────────────────────────────────────────
  checks.push({
    area: "AI-search",
    name: "/llms.txt",
    status:
      llms.ok && llms.body.includes("# 100dola sport") && llms.body.includes("E-shop")
        ? "ok"
        : "fail",
    detail:
      llms.status === 200
        ? llms.body.includes("# 100dola sport")
          ? "200, obsahuje očekávané sekce"
          : "200, ale chybí očekávaný obsah"
        : `HTTP ${llms.status} — index pro AI crawlery nedostupný!`,
  });

  const robotsAllowsAi = /GPTBot/i.test(robots.body);
  const robotsGlobalBlock = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*$/im.test(robots.body);
  checks.push({
    area: "AI-search",
    name: "robots.txt (AI crawlery)",
    status: robots.ok && robotsAllowsAi && !robotsGlobalBlock ? "ok" : robots.ok ? "warn" : "fail",
    detail: !robots.ok
      ? `HTTP ${robots.status}`
      : robotsGlobalBlock
        ? "POZOR: globální Disallow: / — web blokován!"
        : robotsAllowsAi
          ? "AI boti (GPTBot…) explicitně povoleni"
          : "AI boti nejsou explicitně uvedeni (povoleni přes *)",
  });

  const hasProduct =
    pdp.body.includes('"@type":"Product"') || pdp.body.includes('"@type": "Product"');
  const hasOffer = /"@type":\s*"Offer"/.test(pdp.body);
  const hasAvail = pdp.body.includes("availability");
  checks.push({
    area: "AI-search",
    name: `Product JSON-LD (PDP ${sampleSlug})`,
    status: pdp.ok && hasProduct && hasOffer && hasAvail ? "ok" : pdp.ok ? "warn" : "fail",
    detail: !pdp.ok
      ? `HTTP ${pdp.status}`
      : hasProduct && hasOffer && hasAvail
        ? "Product + Offer + availability přítomny"
        : `chybí: ${[!hasProduct && "Product", !hasOffer && "Offer", !hasAvail && "availability"].filter(Boolean).join(", ")}`,
  });

  checks.push({
    area: "AI-search",
    name: "SearchAction (homepage)",
    status: home.ok && home.body.includes('"SearchAction"') ? "ok" : "warn",
    detail: home.body.includes('"SearchAction"')
      ? "sitelinks searchbox přítomen"
      : "SearchAction nenalezen",
  });

  // ── Klasické SEO ─────────────────────────────────────────────────────────────
  const locCount = (sitemap.body.match(/<loc>/g) || []).length;
  checks.push({
    area: "SEO",
    name: "sitemap.xml",
    status: sitemap.ok && locCount > 10 ? "ok" : sitemap.ok ? "warn" : "fail",
    detail: sitemap.ok ? `${locCount} URL` : `HTTP ${sitemap.status}`,
  });

  const hasTitle = /<title>[^<]{5,}<\/title>/i.test(home.body);
  const hasDesc = /name=["']description["']/i.test(home.body);
  const hasOg = /property=["']og:title["']/i.test(home.body);
  const hasCanonical = /rel=["']canonical["']/i.test(home.body);
  const missing = [
    !hasTitle && "title",
    !hasDesc && "description",
    !hasOg && "og:title",
    !hasCanonical && "canonical",
  ].filter(Boolean);
  checks.push({
    area: "SEO",
    name: "Homepage meta (title/desc/OG/canonical)",
    status: home.ok && missing.length === 0 ? "ok" : home.ok ? "warn" : "fail",
    detail: !home.ok ? `HTTP ${home.status}` : missing.length ? `chybí: ${missing.join(", ")}` : "vše přítomno",
  });

  checks.push({
    area: "SEO",
    name: "Organization JSON-LD (homepage)",
    status: home.body.includes('"@type":"Organization"') || home.body.includes('"@type": "Organization"') ? "ok" : "warn",
    detail: home.body.includes("Organization") ? "přítomno" : "nenalezeno",
  });

  return checks;
}

function icon(s: Status): string {
  return s === "ok" ? "✅" : s === "warn" ? "⚠️" : "❌";
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return logCronRun("seo-ai-audit", "0 7 1 * *", async () => {
    const checks = await runChecks();
    const fails = checks.filter((c) => c.status === "fail").length;
    const warns = checks.filter((c) => c.status === "warn").length;
    const overall = fails > 0 ? "❌ REGRESE" : warns > 0 ? "⚠️ drobnosti" : "✅ vše OK";
    const date = new Date().toISOString().split("T")[0];

    const lines = checks.map((c) => `${icon(c.status)} [${c.area}] ${c.name} — ${c.detail}`);
    const text = [
      `SEO + AI-search audit 100dola.com — ${date}`,
      `Souhrn: ${overall} (${checks.length} kontrol, ${warns} varování, ${fails} chyb)`,
      "",
      ...lines,
      "",
      "Pozn.: AI referraly (ChatGPT/Perplexity/Gemini/Copilot) tento cron neměří —",
      "mrkni ručně do Vercel Analytics → Referrers, nebo počkej na čtvrtletní hloubkový přehled.",
    ].join("\n");

    const htmlRows = checks
      .map(
        (c) =>
          `<tr><td style="padding:4px 8px">${icon(c.status)}</td><td style="padding:4px 8px;color:#666">${c.area}</td><td style="padding:4px 8px"><b>${c.name}</b></td><td style="padding:4px 8px;color:#333">${c.detail}</td></tr>`,
      )
      .join("");
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:720px">
        <h2>SEO + AI-search audit — ${date}</h2>
        <p style="font-size:16px"><b>Souhrn: ${overall}</b> · ${checks.length} kontrol · ${warns} varování · ${fails} chyb</p>
        <table style="border-collapse:collapse;font-size:14px;width:100%">${htmlRows}</table>
        <p style="color:#888;font-size:12px;margin-top:16px">AI referraly (ChatGPT/Perplexity/Gemini/Copilot) tento cron neměří — Vercel Analytics → Referrers, nebo čtvrtletní hloubkový přehled (routines).</p>
      </div>`;

    await sendInternalReport({
      subject: `${overall} SEO+AI audit 100dola — ${date}`,
      html,
      text,
    });

    const res = NextResponse.json({
      ok: fails === 0,
      overall,
      checks,
      emailed: true,
      ranAt: new Date().toISOString(),
    });
    if (fails > 0) res.headers.set("x-cron-status", "failed");
    return res;
  });
}
