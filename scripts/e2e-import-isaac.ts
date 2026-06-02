import { config } from "dotenv";
import { getServiceSupabase, importBrand } from "../src/lib/suppliers/importer";

config({ path: ".env.local" });
process.env.ENABLE_SUPPLIER_IMPORTS = "true";

async function main() {
  const sb = getServiceSupabase();

  console.log("→ enabling ISAAC brand…");
  const upd = await sb
    .from("supplier_brands")
    .update({ is_enabled: true })
    .eq("brand_slug", "isaac");
  if (upd.error) throw new Error(`enable failed: ${upd.error.message}`);

  const { data: brand, error: bErr } = await sb
    .from("supplier_brands")
    .select("id, supplier_id, external_id, brand_name, is_enabled")
    .eq("brand_slug", "isaac")
    .single();
  if (bErr || !brand) throw new Error(`brand fetch failed: ${bErr?.message}`);
  console.log(`  ISAAC enabled=${brand.is_enabled} ext=${brand.external_id} id=${brand.id}`);

  console.log("\n→ running import…");
  const t0 = Date.now();
  const res = await importBrand(brand.supplier_id, brand.external_id, {
    supabase: sb,
    triggeredBy: "admin:e2e-test",
  });
  console.log(`  done in ${Date.now() - t0}ms`);
  console.log("  result:", JSON.stringify(res, null, 2));

  const [p, o, t] = await Promise.all([
    sb
      .from("supplier_products")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", brand.id)
      .eq("is_active", true),
    sb.from("configurator_options").select("id", { count: "exact", head: true }),
    sb.from("configurator_tags").select("id", { count: "exact", head: true }),
  ]);

  console.log("\n=== DB verify ===");
  console.log(`  supplier_products active: ${p.count ?? "?"}`);
  console.log(`  configurator_options:     ${o.count ?? "?"}`);
  console.log(`  configurator_tags:        ${t.count ?? "?"}`);
}

main().catch((e) => {
  console.error("E2E FAIL:", e);
  process.exit(1);
});
