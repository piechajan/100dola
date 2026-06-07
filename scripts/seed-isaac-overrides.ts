/**
 * Seed configurator_tag_overrides — výchozí odhady price modifiers pro ISAAC tagy.
 * Sportimport feed posílá 0; tyto hodnoty jsou orientační AI odhady (2026-06-07)
 * podle standardního MSRP rozdílu mezi komponenty.
 *
 * JAN MUSÍ OVĚŘIT v /admin/suppliers/configurator-prices a upravit kde nesedí.
 * Tag externalId je global → override se aplikuje na všechny modely.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-isaac-overrides.ts
 */

import { createClient } from "@supabase/supabase-js";

const NOTE = "AI odhad 2026-06-07 — Jan ověř a uprav";

// Mapping tag name (case-insensitive substring match) → CZK modifier
// Postaveno na standardních MSRP rozdílech mezi komponenty.
const PRICING: Array<{ pattern: RegExp; value: number; label: string }> = [
  // === SADA (Shimano hierarchy) ===
  { pattern: /^Shimano 105$/i, value: 0, label: "105 mechanical = base" },
  { pattern: /^Shimano 105 Di2$/i, value: 15000, label: "105 Di2 +15k" },
  { pattern: /^Shimano Ultegra$/i, value: 18000, label: "Ultegra mech +18k" },
  { pattern: /^Shimano Ultegra Di2$/i, value: 35000, label: "Ultegra Di2 +35k" },
  { pattern: /^Shimano Dura.?Ace$/i, value: 55000, label: "Dura-Ace mech +55k" },
  { pattern: /^Shimano Dura.?Ace Di2$/i, value: 85000, label: "Dura-Ace Di2 +85k" },
  { pattern: /^SRAM Rival$/i, value: 12000, label: "SRAM Rival +12k" },
  { pattern: /^SRAM Rival AXS$/i, value: 18000, label: "SRAM Rival AXS +18k" },
  { pattern: /^SRAM Force$/i, value: 28000, label: "SRAM Force +28k" },
  { pattern: /^SRAM Force AXS$/i, value: 38000, label: "SRAM Force AXS +38k" },
  { pattern: /^SRAM Red$/i, value: 60000, label: "SRAM Red +60k" },
  { pattern: /^SRAM Red AXS$/i, value: 75000, label: "SRAM Red AXS +75k" },

  // === KOLA (wheels) ===
  { pattern: /^FFWD TYRO/i, value: 0, label: "TYRO = base alu" },
  { pattern: /^DT Swiss E1800/i, value: -2000, label: "E1800 -2k (entry alu)" },
  { pattern: /^FFWD RYOT33 Carbon$/i, value: 12000, label: "RYOT33 +12k" },
  { pattern: /^FFWD RYOT44 Carbon$/i, value: 14000, label: "RYOT44 +14k" },
  { pattern: /^FFWD RYOT55 Carbon$/i, value: 17000, label: "RYOT55 +17k" },
  { pattern: /^FFWD RAW33 CS Carbon$/i, value: 24000, label: "RAW33 CS +24k" },
  { pattern: /^FFWD RAW44 CS Carbon$/i, value: 27000, label: "RAW44 CS +27k" },
  { pattern: /^FFWD RAW55 CS Carbon$/i, value: 30000, label: "RAW55 CS +30k" },
  { pattern: /^bez kol/i, value: -8000, label: "bez kol -8k" },

  // === NÁBOJE (hubs) — když lze měnit hub samostatně ===
  { pattern: /^DT Swiss 370 OEM/i, value: 0, label: "DT 370 = base" },
  { pattern: /^DT Swiss 350/i, value: 2000, label: "DT 350 +2k" },
  { pattern: /^DT Swiss 240 SP 2:1/i, value: 7000, label: "DT 240 SP +7k" },
  { pattern: /^FFWD N\/GAGE SP 2:1/i, value: 4000, label: "N/GAGE +4k" },
  { pattern: /^FFWD 1:1 SP/i, value: 3000, label: "FFWD 1:1 +3k" },
  { pattern: /^FFWD\/CeramicSpeed 2:1/i, value: 18000, label: "CeramicSpeed +18k" },

  // === KLIKY (cranks) — délka se neúčtuje, všechny 0 ===
  { pattern: /^\d+\/\d+ zubů, délka /i, value: 0, label: "kliky = 0 (default)" },

  // === KAZETA — rozdíly mezi rozsahy obvykle ne ===
  { pattern: /^\d+-\d+ zubů$/i, value: 0, label: "kazeta = 0" },

  // === ŘIDÍTKA — ISAAC Airflow různé velikosti, všechny 0 (stejná cena) ===
  { pattern: /^ISAAC Airflow Carbon/i, value: 0, label: "Airflow = 0" },
  { pattern: /^ISAAC OEM Carbon/i, value: -2000, label: "OEM Carbon -2k (downgrade)" },
  { pattern: /^ISAAC Aero Carbon/i, value: 4000, label: "Aero Carbon +4k" },

  // === KOMPLETACE — Sportimport posílá: Rámová sada -13953, Celé kolo 0 ===
  // Neoverridingujeme, ponecháváme feed hodnoty.

  // === VELIKOST — 0 vždy ===
  { pattern: /^(XS|S|M|L|XL|XXL)$/, value: 0, label: "velikost = 0" },
];

interface TagInfo {
  externalId: string;
  name: string;
  optionExternalId: string;
  optionName: string;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Chybí SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // ISAAC brand
  const { data: brand } = await sb
    .from("supplier_brands")
    .select("id")
    .eq("brand_slug", "isaac")
    .maybeSingle();
  if (!brand) {
    console.error("ISAAC brand nenalezen");
    process.exit(1);
  }

  // Fetch všechny ISAAC produkty s konfigurátorem
  const { data: products } = await sb
    .from("supplier_products")
    .select("id, name, configurator_schema")
    .eq("brand_id", (brand as { id: string }).id)
    .eq("has_configurator", true)
    .eq("is_active", true);

  // Sesbírej UNIKÁTNÍ tagy přes všechny produkty (tag externalId je global)
  const uniqueTags = new Map<string, TagInfo>();
  for (const p of products ?? []) {
    const schema = (p as { configurator_schema: { options?: Array<{ name: string; externalId: string }>; tags?: Array<{ name: string; externalId: string; optionExternalId: string }> } | null }).configurator_schema;
    if (!schema?.tags) continue;
    const optionMap = new Map((schema.options ?? []).map((o) => [o.externalId, o.name]));
    for (const t of schema.tags) {
      if (!uniqueTags.has(t.externalId)) {
        uniqueTags.set(t.externalId, {
          externalId: t.externalId,
          name: t.name,
          optionExternalId: t.optionExternalId,
          optionName: optionMap.get(t.optionExternalId) ?? "",
        });
      }
    }
  }

  console.log(`Unikátních tagů přes všechny ISAAC produkty: ${uniqueTags.size}`);
  console.log(`Pricing rules: ${PRICING.length}\n`);

  let matched = 0;
  let unmatched = 0;
  const unmatchedSamples: string[] = [];

  for (const tag of uniqueTags.values()) {
    const rule = PRICING.find((r) => r.pattern.test(tag.name));
    if (!rule) {
      unmatched++;
      if (unmatchedSamples.length < 30) {
        unmatchedSamples.push(`[${tag.optionName}] ${tag.name}`);
      }
      continue;
    }

    // Upsert override
    const { error } = await sb
      .from("configurator_tag_overrides")
      .upsert(
        {
          tag_external_id: tag.externalId,
          tag_name: tag.name,
          option_external_id: tag.optionExternalId,
          option_name: tag.optionName,
          price_modifier_czk_override: rule.value,
          note: NOTE,
          updated_by: "ai-seed-script",
        },
        { onConflict: "tag_external_id" },
      );
    if (error) {
      console.error(`  ✗ ${tag.name}: ${error.message}`);
    } else {
      matched++;
      if (matched <= 50) {
        console.log(`  ✓ [${tag.optionName}] ${tag.name} → ${rule.value >= 0 ? "+" : ""}${rule.value} Kč (${rule.label})`);
      }
    }
  }

  console.log(`\n━━━ Souhrn ━━━`);
  console.log(`Matched + saved: ${matched}`);
  console.log(`Unmatched (Jan ručně): ${unmatched}`);
  if (unmatchedSamples.length > 0) {
    console.log(`\nUkázka unmatchovaných tagů (ručně doplnit přes admin):`);
    for (const s of unmatchedSamples) console.log(`  · ${s}`);
  }
  console.log(`\nNote: ${NOTE}`);
  console.log(`Admin UI: https://www.100dola.com/admin/suppliers/configurator-prices`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
