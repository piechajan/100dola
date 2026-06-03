import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { sportimport } from "../src/lib/suppliers/sportimport";

config({ path: ".env.local" });

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: brands } = await sb
    .from("supplier_brands")
    .select("id, brand_slug, external_id, brand_name, import_filter")
    .eq("is_enabled", true);

  for (const b of brands ?? []) {
    console.log(`\n→ ${b.brand_name}`);
    const parsed = await sportimport.fetchFeed(b.external_id, {
      filter: b.import_filter ?? undefined,
      timeoutMs: 180_000,
    });
    let updated = 0;
    for (const p of parsed) {
      if (!p.variants || p.variants.length === 0) continue;
      const { error } = await sb
        .from("supplier_products")
        .update({ variants: p.variants })
        .eq("supplier_id", (await sb.from("supplier_brands").select("supplier_id").eq("id", b.id).single()).data!.supplier_id)
        .eq("external_id", p.externalId);
      if (!error) updated++;
    }
    console.log(`  updated variants for ${updated}/${parsed.length} products`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
