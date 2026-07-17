// Importer — orchestruje data flow z adapter → DB.
//
// Flow:
//   1. fetchFeed(brand.external_id, opts) → RawSupplierProduct[]
//   2. validate (optional, soft warning)
//   3. začni supplier_imports záznam (status='running')
//   4. per item:
//      - upsert do supplier_products (idempotentní)
//      - pokud má configurator_schema, upsert configurator_options + configurator_tags
//      - track diff (added / updated / unchanged)
//   5. flag items co zmizely z feedu jako is_active=false
//   6. ukonči supplier_imports (status='completed')
//
// Returns: { importId, counts }
//
// SAFETY:
//   - Idempotentní — opakované volání vrací stejný state
//   - Nikdy nemaže historická data (jen flaguje is_active=false)
//   - Pokud cokoli selže, import zůstane status='running' + error_message

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAdapter } from "./registry";
import { matchesFilter, type RawSupplierProduct } from "./types";

/**
 * Pojistka „nikdy pod nákupní cenou". Sportimport dealer ceny jsou bez DPH
 * (B2B velkoobchod), retail je s DPH → break-even = dealer × 1.21. Když feed
 * pošle retail pod break-even (chyba dat), zvedni na break-even zaokrouhlený
 * nahoru na 10 Kč a zaloguj varování. Chrání marži proti chybným feed cenám.
 * Triggeruje jen na skutečné anomálie (běžný markup je ~2×).
 */
function guardRetailNotBelowCost(
  retailCzk: number | null | undefined,
  dealerCzk: number | null | undefined,
  name: string,
): number | null {
  const retail = retailCzk ?? null;
  if (retail == null) return null;
  const dealer = dealerCzk ?? null;
  if (dealer == null || dealer <= 0) return retail;
  const breakEven = Math.ceil((dealer * 1.21) / 10) * 10;
  if (retail < breakEven) {
    console.warn(
      `[importer] retail pod nákupkou u "${name}": feed ${retail} < break-even ${breakEven} Kč (dealer ${dealer} bez DPH) → zvednuto na ${breakEven}`,
    );
    return breakEven;
  }
  return retail;
}

type ImporterDeps = {
  supabase: SupabaseClient;
  triggeredBy: string; // 'cron' | 'admin:<email>' | 'manual'
};

export type ImportResult = {
  importId: string;
  brandId: string;
  brandName: string;
  itemsTotal: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsUnchanged: number;
  itemsRemoved: number;
  variantsTotal: number;
  warnings: string[];
  errors: string[];
};

export async function importBrand(
  supplierId: string,
  brandExternalId: string,
  deps: ImporterDeps,
): Promise<ImportResult> {
  const { supabase, triggeredBy } = deps;

  // 1. Načti supplier + brand row
  const { data: supplier, error: supErr } = await supabase
    .from("suppliers")
    .select("id, adapter_id, name")
    .eq("id", supplierId)
    .single();
  if (supErr || !supplier) throw new Error(`Supplier ${supplierId} not found: ${supErr?.message}`);

  const adapter = getAdapter(supplier.adapter_id);
  if (!adapter) throw new Error(`Adapter ${supplier.adapter_id} not registered`);

  const { data: brand, error: brErr } = await supabase
    .from("supplier_brands")
    .select("id, brand_name, brand_slug, import_filter, is_enabled")
    .eq("supplier_id", supplierId)
    .eq("external_id", brandExternalId)
    .single();
  if (brErr || !brand) throw new Error(`Brand ${brandExternalId} not found: ${brErr?.message}`);
  if (!brand.is_enabled) throw new Error(`Brand ${brand.brand_name} is not enabled (is_enabled=false)`);

  // 2. Začni import log
  const { data: importRow, error: impErr } = await supabase
    .from("supplier_imports")
    .insert({
      supplier_id: supplierId,
      brand_id: brand.id,
      status: "running",
      triggered_by: triggeredBy,
      filter_used: brand.import_filter ?? null,
    })
    .select("id")
    .single();
  if (impErr || !importRow) throw new Error(`Failed to create import row: ${impErr?.message}`);
  const importId = importRow.id as string;

  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // 3. Fetch + filter
    const products = await adapter.fetchFeed(brandExternalId, {
      filter: brand.import_filter ?? undefined,
      // 5 min pro velké feedy (ALE má 800+ položek, XML přes 10 MB)
      timeoutMs: 300_000,
    });

    if (adapter.validateFeed) {
      const v = await adapter.validateFeed(products);
      if (v.warnings) warnings.push(...v.warnings);
      if (v.errors) errors.push(...v.errors);
    }

    let added = 0;
    let updated = 0;
    let unchanged = 0;
    let variantsTotal = 0;

    // 4. Per-item upsert
    for (const p of products) {
      // post-fetch filter check (adapter může už aplikovat, ale defensive)
      if (brand.import_filter && !matchesFilter(p, brand.import_filter)) continue;
      variantsTotal += p.variants?.length ?? 0;

      // Pojistka: retail nikdy pod nákupní cenou (dealer × 1.21). Chybné feed ceny se zvednou.
      const safeRetailCzk = guardRetailNotBelowCost(p.prices.retailCzk, p.prices.dealerCzk, p.name);

      const row = {
        supplier_id: supplierId,
        brand_id: brand.id,
        external_id: p.externalId,
        sku: p.sku ?? null,
        ean: p.ean ?? null,
        name: p.name,
        description_html: p.descriptionHtml ?? null,
        price_czk_retail: safeRetailCzk,
        price_eur_retail: p.prices.retailEur ?? null,
        price_czk_dealer: p.prices.dealerCzk ?? null,
        price_eur_dealer: p.prices.dealerEur ?? null,
        properties: p.properties ?? null,
        raw_category_path: p.rawCategoryPath ?? null,
        has_configurator: p.hasConfigurator ?? false,
        configurator_schema: p.configuratorSchema ?? null,
        main_image_url: p.mainImageUrl ?? null,
        image_urls: p.imageUrls ?? null,
        variants: p.variants ?? null,
        last_import_id: importId,
        last_seen_at: new Date().toISOString(),
        is_active: true,
      };

      // existing?
      const { data: existing } = await supabase
        .from("supplier_products")
        .select("id, name, price_czk_retail")
        .eq("supplier_id", supplierId)
        .eq("external_id", p.externalId)
        .maybeSingle();

      if (!existing) {
        const { error: insErr, data: insData } = await supabase
          .from("supplier_products")
          .insert(row)
          .select("id")
          .single();
        if (insErr) {
          errors.push(`insert ${p.externalId}: ${insErr.message}`);
          continue;
        }
        added += 1;
        if (insData && p.configuratorSchema) {
          await upsertConfiguratorSchema(supabase, insData.id as string, p);
        }
      } else {
        // detekce změn (lehká heuristika: name+price)
        const changed = existing.name !== p.name || existing.price_czk_retail !== safeRetailCzk;
        if (changed) {
          const { error: updErr } = await supabase
            .from("supplier_products")
            .update(row)
            .eq("id", existing.id);
          if (updErr) {
            errors.push(`update ${p.externalId}: ${updErr.message}`);
            continue;
          }
          updated += 1;
        } else {
          // jen update last_seen_at
          await supabase
            .from("supplier_products")
            .update({ last_seen_at: row.last_seen_at, last_import_id: importId })
            .eq("id", existing.id);
          unchanged += 1;
        }
        if (p.configuratorSchema) {
          await upsertConfiguratorSchema(supabase, existing.id as string, p);
        }
      }
    }

    // 5. Items co zmizely z feedu — flagnout jako is_active=false
    const { data: removedRows } = await supabase
      .from("supplier_products")
      .update({ is_active: false })
      .eq("brand_id", brand.id)
      .neq("last_import_id", importId)
      .eq("is_active", true)
      .select("id");
    const itemsRemoved = removedRows?.length ?? 0;

    // 6. Ukonči import log
    await supabase
      .from("supplier_imports")
      .update({
        status: errors.length > 0 ? "completed" : "completed", // completed s errors[] zachováno v warnings
        finished_at: new Date().toISOString(),
        items_total: products.length,
        items_added: added,
        items_updated: updated,
        items_unchanged: unchanged,
        items_removed: itemsRemoved,
        variants_total: variantsTotal,
        error_message: errors.length > 0 ? errors.slice(0, 5).join("\n") : null,
      })
      .eq("id", importId);

    return {
      importId,
      brandId: brand.id,
      brandName: brand.brand_name,
      itemsTotal: products.length,
      itemsAdded: added,
      itemsUpdated: updated,
      itemsUnchanged: unchanged,
      itemsRemoved,
      variantsTotal,
      warnings,
      errors,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase
      .from("supplier_imports")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: msg,
      })
      .eq("id", importId);
    throw e;
  }
}

async function upsertConfiguratorSchema(
  supabase: SupabaseClient,
  supplierProductId: string,
  p: RawSupplierProduct,
): Promise<void> {
  if (!p.configuratorSchema) return;
  const s = p.configuratorSchema;

  // pro idempotentnost: nejdřív smaž staré options (cascade odebere tagy)
  await supabase.from("configurator_options").delete().eq("supplier_product_id", supplierProductId);

  for (const opt of s.options) {
    const { data: optRow, error: optErr } = await supabase
      .from("configurator_options")
      .insert({
        supplier_product_id: supplierProductId,
        external_id: opt.externalId,
        name: opt.name,
        display_order: opt.displayOrder,
        is_required: opt.isRequired,
        display_style: opt.displayStyle ?? null,
        default_tag_external_id: opt.defaultTagExternalId ?? null,
        note: opt.note ?? null,
      })
      .select("id")
      .single();
    if (optErr || !optRow) continue;

    const tagsForOption = s.tags.filter((t) => t.optionExternalId === opt.externalId);
    if (tagsForOption.length === 0) continue;

    await supabase.from("configurator_tags").insert(
      tagsForOption.map((t, idx) => ({
        option_id: optRow.id,
        external_id: t.externalId,
        name: t.name,
        price_modifier_czk: t.priceModifierCzk ?? 0,
        image_url: t.imageUrl ?? null,
        is_available: t.isAvailable ?? true,
        display_order: t.displayOrder ?? idx,
      })),
    );
  }
}

export function getServiceSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
