#!/usr/bin/env node
/**
 * Nastaví DMARC politiku pro 100dola.com přes Cloudflare API (žádný prohlížeč).
 *
 * Použití:
 *   node scripts/cloudflare/dmarc-set.mjs --pct 100
 *   node scripts/cloudflare/dmarc-set.mjs --policy reject        # Phase 4
 *   node scripts/cloudflare/dmarc-set.mjs --pct 100 --policy reject --dry
 *
 * Token: čte CLOUDFLARE_API_TOKEN z env nebo z web/.env.local.
 *   Token vytvoř na https://dash.cloudflare.com/profile/api-tokens
 *   šablona "Edit zone DNS", scope = Zone:100dola.com.
 *
 * Zone ID 100dola.com je fixní (z paměti project_cloudflare_dns.md).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ZONE_ID = "0b313c74556787d3b28f9f59ce10f98c";
const RECORD_NAME = "_dmarc.100dola.com";

// --- args ---
const args = process.argv.slice(2);
const getArg = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const pct = getArg("pct");                       // např. "100"
const policy = getArg("policy");                 // "none" | "quarantine" | "reject"
const dry = args.includes("--dry");

// --- token ---
function loadToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(here, "../../.env.local");
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^CLOUDFLARE_API_TOKEN=(.*)$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  } catch { /* ignore */ }
  return null;
}
const token = loadToken();
if (!token) {
  console.error("❌ CLOUDFLARE_API_TOKEN chybí (env ani web/.env.local). Vytvoř token a ulož ho tam.");
  process.exit(1);
}
const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
const API = "https://api.cloudflare.com/client/v4";

async function main() {
  // 1) najdi existující _dmarc TXT
  const listRes = await fetch(
    `${API}/zones/${ZONE_ID}/dns_records?type=TXT&name=${encodeURIComponent(RECORD_NAME)}`,
    { headers: H }
  );
  const list = await listRes.json();
  if (!list.success) { console.error("❌ list error:", JSON.stringify(list.errors)); process.exit(1); }
  const rec = (list.result || []).find((r) => r.content.includes("v=DMARC1"));
  if (!rec) { console.error("❌ _dmarc TXT záznam nenalezen."); process.exit(1); }

  console.log("Aktuální:", rec.content);

  // 2) uprav jen požadované tagy, zbytek nech
  let content = rec.content.replace(/^"|"$/g, "");
  if (pct) {
    content = /pct=\d+/.test(content)
      ? content.replace(/pct=\d+/g, `pct=${pct}`)
      : content.replace(/(p=[a-z]+;?)/, `$1 pct=${pct};`);
  }
  if (policy) {
    content = content.replace(/\bp=[a-z]+/g, `p=${policy}`)
                     .replace(/\bsp=[a-z]+/g, `sp=${policy}`)
                     .replace(/\bnp=[a-z]+/g, `np=${policy}`);
  }
  console.log("Nový:    ", content);

  if (dry) { console.log("\n(--dry) nic se neuložilo."); return; }
  if (content === rec.content.replace(/^"|"$/g, "")) { console.log("\nBeze změny, neukládám."); return; }

  // 3) PATCH
  const upd = await fetch(`${API}/zones/${ZONE_ID}/dns_records/${rec.id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({ content }),
  });
  const updJson = await upd.json();
  if (!updJson.success) { console.error("❌ update error:", JSON.stringify(updJson.errors)); process.exit(1); }
  console.log("\n✅ Uloženo. Ověř za ~1–2 min přes: dig +short TXT _dmarc.100dola.com");
}
main().catch((e) => { console.error(e); process.exit(1); });
