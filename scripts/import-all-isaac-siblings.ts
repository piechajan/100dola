import { config } from "dotenv";
import { getServiceSupabase, importBrand } from "../src/lib/suppliers/importer";

config({ path: ".env.local" });
process.env.ENABLE_SUPPLIER_IMPORTS = "true";

const SLUGS = ["ffwd", "4iiii", "ale"];

async function main() {
  const sb = getServiceSupabase();

  for (const slug of SLUGS) {
    console.log(`\n══════ ${slug.toUpperCase()} ══════`);
    const upd = await sb
      .from("supplier_brands")
      .update({ is_enabled: true })
      .eq("brand_slug", slug)
      .select("id, supplier_id, external_id, brand_name, is_enabled, is_public, import_filter")
      .single();
    if (upd.error || !upd.data) {
      console.error(`  enable failed: ${upd.error?.message}`);
      continue;
    }
    const brand = upd.data;
    console.log(`  ${brand.brand_name} ext=${brand.external_id} enabled=${brand.is_enabled}`);
    if (brand.import_filter) console.log(`  filter: ${JSON.stringify(brand.import_filter)}`);

    const t0 = Date.now();
    try {
      const res = await importBrand(brand.supplier_id, brand.external_id, {
        supabase: sb,
        triggeredBy: "admin:bulk-import",
      });
      console.log(`  done in ${Date.now() - t0}ms`);
      console.log(`    total=${res.itemsTotal} +${res.itemsAdded} ~${res.itemsUpdated} -${res.itemsRemoved} variants=${res.variantsTotal}`);
      if (res.warnings.length) console.log(`    warnings: ${res.warnings.length} → ${res.warnings.slice(0, 3).join(" | ")}`);
      if (res.errors.length) console.log(`    errors: ${res.errors.length} → ${res.errors.slice(0, 3).join(" | ")}`);
    } catch (e) {
      console.error(`  IMPORT FAILED:`, e instanceof Error ? e.message : e);
    }
  }

  // Souhrn
  console.log("\n══════ summary ══════");
  for (const slug of SLUGS) {
    const { data: b } = await sb
      .from("supplier_brands")
      .select("id, brand_name, is_public")
      .eq("brand_slug", slug)
      .single();
    if (!b) continue;
    const { count } = await sb
      .from("supplier_products")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", b.id)
      .eq("is_active", true);
    console.log(`  ${b.brand_name}: ${count} aktivních produktů  is_public=${b.is_public}`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
