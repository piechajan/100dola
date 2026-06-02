import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getServiceSupabase } from "@/lib/suppliers/importer";
import { ADAPTERS } from "@/lib/suppliers/registry";
import BrandRow from "./BrandRow";

export const metadata: Metadata = {
  title: "Admin · Dodavatelé — 100dola",
  robots: { index: false, follow: false },
};

type SupplierRow = {
  id: string;
  slug: string;
  name: string;
  adapter_id: string;
  is_active: boolean;
};

type BrandRowData = {
  id: string;
  supplier_id: string;
  external_id: string;
  brand_name: string;
  brand_slug: string;
  is_enabled: boolean;
  is_public: boolean;
  default_order_flow: string;
  import_filter: Record<string, unknown> | null;
};

type ImportRowData = {
  id: string;
  brand_id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  items_total: number | null;
  items_added: number | null;
  items_updated: number | null;
  items_removed: number | null;
  triggered_by: string | null;
  error_message: string | null;
};

type ProductCount = { brand_id: string; count: number };

export default async function AdminSuppliersPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    redirect("/login?from=/admin/suppliers");
  }

  const sb = getServiceSupabase();

  const [suppliersRes, brandsRes, importsRes] = await Promise.all([
    sb.from("suppliers").select("id, slug, name, adapter_id, is_active").order("name"),
    sb
      .from("supplier_brands")
      .select(
        "id, supplier_id, external_id, brand_name, brand_slug, is_enabled, is_public, default_order_flow, import_filter",
      )
      .order("brand_name"),
    sb
      .from("supplier_imports")
      .select(
        "id, brand_id, started_at, finished_at, status, items_total, items_added, items_updated, items_removed, triggered_by, error_message",
      )
      .order("started_at", { ascending: false })
      .limit(50),
  ]);

  const suppliers = (suppliersRes.data ?? []) as SupplierRow[];
  const brands = (brandsRes.data ?? []) as BrandRowData[];
  const imports = (importsRes.data ?? []) as ImportRowData[];

  // count products per brand
  const productCountsRaw = await sb
    .from("supplier_products")
    .select("brand_id", { count: "exact", head: false })
    .eq("is_active", true);
  const productCounts: ProductCount[] = [];
  for (const b of brands) {
    const { count } = await sb
      .from("supplier_products")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", b.id)
      .eq("is_active", true);
    productCounts.push({ brand_id: b.id, count: count ?? 0 });
  }
  void productCountsRaw;

  const featureEnabled = process.env.ENABLE_SUPPLIER_IMPORTS === "true";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">Dodavatelé</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            Multi-supplier import konfigurace. Cron běží denně 03:00 UTC, zpracuje všechny{" "}
            <em>zapnuté</em> brandy.{" "}
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${featureEnabled ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"}`}
            >
              ENABLE_SUPPLIER_IMPORTS={String(featureEnabled)}
            </span>
          </p>

          {/* registry stav */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Registrovaní dodavatelé</h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Slug</th>
                    <th className="text-left p-3 font-bold">Název</th>
                    <th className="text-left p-3 font-bold">Adapter</th>
                    <th className="text-left p-3 font-bold">Adapter v kódu</th>
                    <th className="text-left p-3 font-bold">Aktivní</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => {
                    const adapterOk = !!ADAPTERS[s.adapter_id];
                    return (
                      <tr key={s.id} className="border-t border-[#E2E6F3]">
                        <td className="p-3 font-mono text-xs">{s.slug}</td>
                        <td className="p-3 font-bold">{s.name}</td>
                        <td className="p-3 font-mono text-xs">{s.adapter_id}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${adapterOk ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"}`}
                          >
                            {adapterOk ? "OK" : "MISSING"}
                          </span>
                        </td>
                        <td className="p-3">{s.is_active ? "✓" : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* brand table */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Brandy</h2>
            <p className="text-xs text-[#5A6480] mb-3">
              Zapnutí brandu = připojí ho do cron importu. Manuální import = okamžitě spustí sync,
              ignoruje ENABLE_SUPPLIER_IMPORTS flag. Filter v JSONu se aplikuje per-item (např. ALE
              sezóna).
            </p>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Brand</th>
                    <th className="text-left p-3 font-bold">Ext. ID</th>
                    <th className="text-left p-3 font-bold">Slug</th>
                    <th className="text-left p-3 font-bold">Order flow</th>
                    <th className="text-left p-3 font-bold">Aktivních produktů</th>
                    <th className="text-left p-3 font-bold">Filter</th>
                    <th className="text-left p-3 font-bold">Import / Web</th>
                    <th className="text-left p-3 font-bold">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b) => (
                    <BrandRow
                      key={b.id}
                      brand={b}
                      productCount={productCounts.find((c) => c.brand_id === b.id)?.count ?? 0}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* recent imports */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Historie importů (50 posledních)</h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Začátek</th>
                    <th className="text-left p-3 font-bold">Brand</th>
                    <th className="text-left p-3 font-bold">Stav</th>
                    <th className="text-right p-3 font-bold">Total</th>
                    <th className="text-right p-3 font-bold">+ Nové</th>
                    <th className="text-right p-3 font-bold">~ Updated</th>
                    <th className="text-right p-3 font-bold">− Removed</th>
                    <th className="text-left p-3 font-bold">Triggered</th>
                    <th className="text-left p-3 font-bold">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {imports.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-[#9AA3C2]">
                        Žádné importy zatím. Spusť ručně v brand tabulce výše.
                      </td>
                    </tr>
                  ) : (
                    imports.map((imp) => {
                      const brandName =
                        brands.find((b) => b.id === imp.brand_id)?.brand_name ?? "—";
                      return (
                        <tr key={imp.id} className="border-t border-[#E2E6F3]">
                          <td className="p-3 text-xs">
                            {new Date(imp.started_at).toLocaleString("cs-CZ")}
                          </td>
                          <td className="p-3 font-bold">{brandName}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                imp.status === "completed"
                                  ? "bg-[#D1FAE5] text-[#065F46]"
                                  : imp.status === "failed"
                                    ? "bg-[#FEE2E2] text-[#991B1B]"
                                    : "bg-[#FEF3C7] text-[#92400E]"
                              }`}
                            >
                              {imp.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">{imp.items_total ?? "—"}</td>
                          <td className="p-3 text-right text-[#065F46]">
                            {imp.items_added ?? "—"}
                          </td>
                          <td className="p-3 text-right text-[#1E3A8A]">
                            {imp.items_updated ?? "—"}
                          </td>
                          <td className="p-3 text-right text-[#991B1B]">
                            {imp.items_removed ?? "—"}
                          </td>
                          <td className="p-3 text-xs text-[#9AA3C2]">{imp.triggered_by ?? "—"}</td>
                          <td className="p-3 text-xs text-[#991B1B] max-w-[200px] truncate">
                            {imp.error_message ?? ""}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
