// Smoke test pro Sportimport parser.
// Použití: cd web && npx tsx scripts/test-sportimport-parser.ts <brand_id|all>
// Verifikuje, že XML parsing + PHP unserialize funguje proti reálným feedům.

import { readFileSync, writeFileSync } from "node:fs";
import { sportimport } from "../src/lib/suppliers/sportimport";
import { parseSportimportFeed } from "../src/lib/suppliers/sportimport/parser";

const FEEDS: Record<string, { name: string; file: string }> = {
  "1": { name: "FFWD", file: "/tmp/feed-1.xml" },
  "2": { name: "ALE", file: "/tmp/feed-2.xml" },
  "9": { name: "ISAAC", file: "/tmp/feed-9.xml" },
  "10": { name: "4iiii", file: "/tmp/feed-10.xml" },
};

function summarize(brandId: string) {
  const cfg = FEEDS[brandId];
  if (!cfg) {
    console.error(`unknown brand ${brandId}`);
    return;
  }
  const xml = readFileSync(cfg.file, "utf8");
  const t0 = Date.now();
  const products = parseSportimportFeed(xml);
  const dt = Date.now() - t0;

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`Brand ${brandId} (${cfg.name}) — parsed v ${dt}ms`);
  console.log("═══════════════════════════════════════════════════");
  console.log(`  total items: ${products.length}`);
  console.log(`  with CZK retail price: ${products.filter((p) => p.prices.retailCzk).length}`);
  console.log(`  with CZK dealer price: ${products.filter((p) => p.prices.dealerCzk).length}`);
  console.log(`  with main image: ${products.filter((p) => p.mainImageUrl).length}`);
  console.log(`  with properties: ${products.filter((p) => p.properties && Object.keys(p.properties).length > 0).length}`);
  console.log(`  with variants: ${products.filter((p) => p.variants && p.variants.length > 0).length}`);

  const withConfig = products.filter((p) => p.hasConfigurator);
  const configOk = withConfig.filter((p) => p.configuratorSchema);
  console.log(`  with useConfigurator=1: ${withConfig.length}`);
  console.log(`  with parsed config schema: ${configOk.length} (${withConfig.length - configOk.length} failed)`);

  // distinct properties
  const props = new Set<string>();
  for (const p of products) {
    if (p.properties) Object.keys(p.properties).forEach((k) => props.add(k));
  }
  console.log(`  distinct property keys: ${[...props].slice(0, 20).join(", ")}`);

  // sample first item
  const sample = products[0];
  if (sample) {
    console.log("\n  --- SAMPLE first item ---");
    console.log(`    ext_id: ${sample.externalId}, sku: ${sample.sku}`);
    console.log(`    name: ${sample.name.slice(0, 80)}`);
    console.log(`    price CZK retail/dealer: ${sample.prices.retailCzk}/${sample.prices.dealerCzk}`);
    console.log(`    image: ${sample.mainImageUrl?.slice(0, 80)}`);
    console.log(`    properties: ${JSON.stringify(sample.properties).slice(0, 200)}`);
    console.log(`    variants: ${sample.variants?.length ?? 0}`);
    if (sample.configuratorSchema) {
      console.log(`    config: ${sample.configuratorSchema.options.length} options, ${sample.configuratorSchema.tags.length} tags`);
      console.log(`    options: ${sample.configuratorSchema.options.map((o) => o.name).join(", ")}`);
    }
  }

  // dump first item with config to JSON for inspection
  const firstConfig = withConfig[0];
  if (firstConfig?.configuratorSchema) {
    const out = `/tmp/sample-config-${brandId}.json`;
    writeFileSync(out, JSON.stringify(firstConfig.configuratorSchema, null, 2));
    console.log(`  → full config dumped: ${out}`);
  }

  // validation
  if (sportimport.validateFeed) {
    sportimport.validateFeed(products).then((v) => {
      if (v.warnings?.length) console.log("  warnings:", v.warnings);
      if (v.errors?.length) console.log("  errors:", v.errors);
      if (v.ok && !v.warnings?.length) console.log("  ✓ validation clean");
    });
  }
}

const arg = process.argv[2] ?? "all";
if (arg === "all") {
  for (const id of Object.keys(FEEDS)) summarize(id);
} else {
  summarize(arg);
}
