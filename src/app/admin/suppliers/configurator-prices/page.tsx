import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import { listAllOverrides } from "@/lib/shop/configurator-overrides";
import { saveOverrideAction, deleteOverrideAction, bulkSaveAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin · Configurator price overrides",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ProductRow {
  id: string;
  name: string;
  price_czk_retail: number;
  configurator_schema: {
    options?: Array<{ name: string; externalId: string }>;
    tags?: Array<{
      name: string;
      externalId: string;
      optionExternalId: string;
      priceModifierCzk: number;
      isAvailable: boolean;
    }>;
  } | null;
}

export default async function ConfiguratorPricesPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; saved?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/suppliers/configurator-prices");

  const sp = await searchParams;
  const selectedProductId = sp?.product ?? null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-[#F7F9FF] py-8">
          <div className="max-w-[1100px] mx-auto px-6"><p className="text-red-600">Supabase env chybí.</p></div>
        </main>
        <Footer />
      </div>
    );
  }

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Najdi ISAAC brand
  const { data: brand } = await sb
    .from("supplier_brands")
    .select("id")
    .eq("brand_slug", "isaac")
    .maybeSingle();
  const isaacBrandId = brand ? (brand as { id: string }).id : null;

  // List ISAAC produkty s konfigurátorem
  const { data: products } = isaacBrandId
    ? await sb
        .from("supplier_products")
        .select("id, name, price_czk_retail, configurator_schema, has_configurator")
        .eq("brand_id", isaacBrandId)
        .eq("has_configurator", true)
        .eq("is_active", true)
        .order("name", { ascending: true })
    : { data: null };

  const productList = (products ?? []) as ProductRow[];
  const selectedProduct = selectedProductId
    ? productList.find((p) => p.id === selectedProductId)
    : null;

  // Existující overrides (mapa tagId → value)
  const overrideList = await listAllOverrides();
  const overrideMap = new Map(overrideList.map((o) => [o.tag_external_id, o.price_modifier_czk_override]));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <Link href="/admin" className="text-xs text-[#5A6480] hover:underline">← Zpět na admin</Link>
          <h1 className="text-3xl font-black text-[#1a1a2e] mt-1">Configurator price overrides</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            Sportimport feed neposílá <code>priceModifierCzk</code> — všechny tagy přicházejí s 0.
            Tady vyplň reálné modifiers pro každou option/tag kombinaci. Override se aplikuje na
            <strong> všechny produkty</strong> co tento tag externalId používají (např. „Shimano 105 Di2"
            sdílí všechny modely). <strong>{overrideList.length}</strong> overrides aktivních.
          </p>

          {/* Product selector */}
          <form
            method="GET"
            action="/admin/suppliers/configurator-prices"
            className="bg-white rounded-2xl border border-[#E2E6F3] p-5 mb-5"
          >
            <label className="block">
              <span className="text-[11px] text-[#5A6480] font-bold block mb-1">Vyber ISAAC produkt</span>
              <div className="flex gap-2">
                <select
                  name="product"
                  defaultValue={selectedProductId ?? ""}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] outline-none bg-white"
                >
                  <option value="">— vyber —</option>
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button type="submit" className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg text-xs font-bold">Načíst</button>
              </div>
            </label>
            {sp?.saved === "1" && (
              <div className="mt-3 text-[11px] text-[#065F46] bg-[#D1FAE5] p-2 rounded-lg font-bold">
                ✓ Uloženo
              </div>
            )}
          </form>

          {selectedProduct && selectedProduct.configurator_schema && (
            <>
              {/* Bulk paste */}
              <form
                action={bulkSaveAction}
                className="bg-white rounded-2xl border border-[#E2E6F3] p-5 mb-5"
              >
                <input type="hidden" name="productId" value={selectedProduct.id} />
                <h2 className="text-sm font-black text-[#1a1a2e] mb-2">Bulk paste</h2>
                <p className="text-xs text-[#5A6480] mb-3">
                  Vlož řádky ve formátu <code>Tag name = +25000</code> (jeden tag na řádek).
                  Hledá podle tag name přesné shody. Negativní hodnoty OK (downgrade).
                </p>
                <textarea
                  name="bulkText"
                  rows={4}
                  placeholder={`Shimano 105 Di2 = +20000\nShimano Ultegra Di2 = +45000\nFFWD RYOT55 Carbon = +18000\n…`}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm font-mono focus:border-[#3B7CF4] outline-none"
                />
                <div className="flex justify-end mt-3">
                  <button className="px-4 py-2 bg-[#10B981] text-white rounded-full text-xs font-bold hover:opacity-90">
                    Importovat
                  </button>
                </div>
              </form>

              {/* Per-option grid */}
              <div className="space-y-4">
                {selectedProduct.configurator_schema.options?.map((opt) => {
                  const tags = (selectedProduct.configurator_schema?.tags ?? []).filter(
                    (t) => t.optionExternalId === opt.externalId,
                  );
                  return (
                    <div key={opt.externalId} className="bg-white rounded-2xl border border-[#E2E6F3] p-5">
                      <h3 className="text-sm font-black text-[#1a1a2e] mb-3">{opt.name}</h3>
                      <div className="space-y-2">
                        {tags.map((tag) => {
                          const override = overrideMap.get(tag.externalId);
                          const hasOverride = override !== undefined;
                          return (
                            <form
                              key={tag.externalId}
                              action={saveOverrideAction}
                              className="flex items-center gap-2 text-xs"
                            >
                              <input type="hidden" name="tagExternalId" value={tag.externalId} />
                              <input type="hidden" name="tagName" value={tag.name} />
                              <input type="hidden" name="optionExternalId" value={opt.externalId} />
                              <input type="hidden" name="optionName" value={opt.name} />
                              <input type="hidden" name="productId" value={selectedProduct.id} />
                              <span className={`flex-1 ${!tag.isAvailable ? "text-[#9AA3C2] line-through" : "text-[#1a1a2e]"}`}>
                                {tag.name}
                              </span>
                              <span
                                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: hasOverride ? "#3B7CF420" : "#F0F2FA",
                                  color: hasOverride ? "#3B7CF4" : "#9AA3C2",
                                }}
                              >
                                {hasOverride ? "override" : "feed"}
                              </span>
                              <input
                                type="number"
                                name="value"
                                step="0.01"
                                defaultValue={hasOverride ? override : ""}
                                placeholder={tag.priceModifierCzk.toString()}
                                className="w-32 px-2 py-1 rounded border border-[#E2E6F3] text-xs text-right focus:border-[#3B7CF4] outline-none"
                              />
                              <span className="text-[#9AA3C2] text-[11px] shrink-0">Kč</span>
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-[#1a1a2e] text-white rounded-full text-[10px] font-bold hover:opacity-90 shrink-0"
                              >
                                Save
                              </button>
                              {hasOverride && (
                                <button
                                  formAction={deleteOverrideAction}
                                  className="px-2 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-full shrink-0"
                                >
                                  ✕
                                </button>
                              )}
                            </form>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!selectedProductId && productList.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center text-sm text-[#5A6480]">
              Žádné ISAAC produkty s konfigurátorem.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
