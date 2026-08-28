#!/usr/bin/env node
// Verifikační průchod (§8 zadání malaga-trasy): přepočítá DS z metrik ze stopy
// a ověří tier. Čte reports/malaga-gpx-stats.json (výstup build-routes.mjs).
// Výsledek → reports/malaga-verifikace.md.
import { readFileSync, writeFileSync } from "node:fs";

const stats = JSON.parse(readFileSync("reports/malaga-gpx-stats.json", "utf8"));
const lines = ["# Malaga trasy — verifikace (§8)", "", `Přepočet DS = km/10 + ascent/100 + maxgrad×0.5`, ""];
let ok = 0;
let bad = 0;
for (const [slug, s] of Object.entries(stats)) {
  if (s.error) {
    lines.push(`- ⚠ **${slug}** — GPX chyba: ${s.error}`);
    bad++;
    continue;
  }
  const ds = Math.round((s.distance_km / 10 + s.ascent_m / 100 + s.max_gradient_pct * 0.5) * 10) / 10;
  const tier = ds <= 26 ? 1 : ds <= 36 ? 2 : ds <= 46 ? 3 : 4;
  const match = Math.abs(ds - s.difficulty_score) < 0.15 && tier === s.tier;
  lines.push(
    `- ${match ? "✅" : "❌"} **${slug}** — ${s.distance_km} km / +${s.ascent_m} m → DS ${ds} (T${tier})` +
      (match ? "" : ` ⟵ uložené DS ${s.difficulty_score} / T${s.tier}`),
  );
  if (match) ok++;
  else bad++;
}
lines.push("", `**Souhrn:** ${ok} OK, ${bad} k opravě.`, "");
lines.push("⚠ Všechny trasy jsou confidence:\"medium\" (routing engine) — čekají na projetí v terénu (9.–16. 9. 2026) a nahrazení reálným GPX z Janovy Stravy.");
writeFileSync("reports/malaga-verifikace.md", lines.join("\n"));
console.log(lines.join("\n"));
