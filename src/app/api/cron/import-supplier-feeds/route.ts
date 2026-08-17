import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getServiceSupabase, importBrand, type ImportResult } from "@/lib/suppliers/importer";
import { getShopProducts } from "@/lib/shop/get-products";
import { logCronRun } from "@/lib/cron-monitor";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — ALE s 923 items může trvat

/**
 * Cron: importuje všechny enabled brandy napříč všemi suppliers.
 *
 * Chráněno `CRON_SECRET` (Vercel cron passes Authorization: Bearer header).
 * Plus `ENABLE_SUPPLIER_IMPORTS` env var = master kill switch.
 *
 * Schedule: vercel.json `0 3 * * *` (denně 03:00 UTC = 05:00 CEST)
 */
export async function GET(req: NextRequest) {
  // Auth check
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return logCronRun("import-supplier-feeds", "0 3 * * *", async () => {
  // Master kill switch
  if (process.env.ENABLE_SUPPLIER_IMPORTS !== "true") {
    return NextResponse.json(
      {
        ok: true,
        skipped: true,
        reason: "ENABLE_SUPPLIER_IMPORTS != 'true' — feature flag off",
        ranAt: new Date().toISOString(),
      },
      { headers: { "x-cron-status": "gated" } },
    );
  }

  const supabase = getServiceSupabase();
  const results: Array<ImportResult | { brandId: string; error: string }> = [];

  // Najdi všechny enabled brandy
  const { data: brands, error: brErr } = await supabase
    .from("supplier_brands")
    .select("id, supplier_id, external_id, brand_name")
    .eq("is_enabled", true);

  if (brErr) {
    return NextResponse.json({ ok: false, error: brErr.message }, { status: 500 });
  }
  if (!brands || brands.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "No enabled brands to import.",
      ranAt: new Date().toISOString(),
    });
  }

  // Sequential — Sportimport feed je real-time generovaný, paralelní fetch je nezdvořilé + DB writes by se serializovaly
  for (const brand of brands) {
    try {
      const res = await importBrand(brand.supplier_id, brand.external_id, {
        supabase,
        triggeredBy: "cron",
      });
      results.push(res);
    } catch (e) {
      results.push({
        brandId: brand.id,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // Invaliduj sdílenou katalog cache → nové produkty se projeví hned
  // (jinak až po 6 h revalidaci getShopProducts).
  revalidateTag("shop-products", "hours");
  revalidatePath("/shop/[...slug]", "page"); // broad net (kategorie + listing)

  // Regeneruj KAŽDÝ supplier PDP jednotlivě — catch-all `/shop/[...slug]` sám
  // spolehlivě nevyčistí konkrétní zacachované 404 (produkt bez traffiku, který
  // se kdysi vyrenderoval jako notFound při výpadku supplier fetch, by 404 držel
  // napořád). Per-path revalidace to hojí každý import. Viz [[project-supplier-pdp-404]].
  let revalidatedPdp = 0;
  try {
    const all = await getShopProducts();
    for (const p of all) {
      if (p.fulfillment === "supplier") {
        revalidatePath(`/shop/${p.slug}`);
        revalidatedPdp++;
      }
    }
  } catch (e) {
    console.warn("[import-supplier-feeds] PDP revalidation failed:", e);
  }

  return NextResponse.json({
    ok: true,
    brandsProcessed: brands.length,
    revalidatedPdp,
    results,
    ranAt: new Date().toISOString(),
  });
  });
}
