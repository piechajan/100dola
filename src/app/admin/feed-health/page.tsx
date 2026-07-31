import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminContext } from "@/lib/admin-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Feed health — admin · 100dola",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface BrandHealth {
  slug: string;
  isPublic: boolean;
  activeTotal: number;
  withPhoto: number;
  visible: number; // reálně by se ukázaly v shopu
}

interface IsaacDeepDive {
  brandPublic: boolean;
  totalRows: number;
  activeRows: number;
  withPhoto: number;
  overrideTrue: number;
  overrideFalse: number;
  hasConfigurator: number;
  sampleSchema: unknown;
  sampleName: string | null;
}

interface Health {
  brands: BrandHealth[];
  alerts: string[];
  isaac: IsaacDeepDive | null;
  lastImport: {
    status: string | null;
    finished_at: string | null;
    duration_ms: number | null;
    error_message: string | null;
    result_json: unknown;
  } | null;
}

async function loadHealth(): Promise<Health | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();

  const { data: brands } = await sb
    .from("supplier_brands")
    .select("id, brand_slug, is_public");
  const brandRows = brands ?? [];

  // Bulk: aktivní produkty (lehká pole) → agregace per brand
  const { data: active } = await sb
    .from("supplier_products")
    .select("brand_id, main_image_url, image_urls, is_public_override")
    .eq("is_active", true);

  const byId = new Map<string, BrandHealth>();
  const publicById = new Map<string, boolean>();
  for (const b of brandRows) {
    byId.set(b.id, { slug: b.brand_slug, isPublic: b.is_public, activeTotal: 0, withPhoto: 0, visible: 0 });
    publicById.set(b.id, b.is_public);
  }
  for (const r of active ?? []) {
    const h = byId.get(r.brand_id as string);
    if (!h) continue;
    h.activeTotal++;
    const hasPhoto = !!r.main_image_url || (Array.isArray(r.image_urls) && r.image_urls.length > 0);
    if (hasPhoto) h.withPhoto++;
    const ov = r.is_public_override as boolean | null;
    const visible = ov === false ? false : ov === true ? true : (publicById.get(r.brand_id as string) && hasPhoto);
    if (visible) h.visible++;
  }

  const brandsOut = [...byId.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  const alerts: string[] = [];
  for (const b of brandsOut) {
    if (b.isPublic && b.visible === 0) {
      alerts.push(`Značka „${b.slug}" je veřejná, ale ${b.visible} viditelných produktů (aktivních: ${b.activeTotal}, s fotkou: ${b.withPhoto}).`);
    }
  }

  // ISAAC deep-dive (bez is_active filtru → uvidíme i deaktivované)
  let isaac: IsaacDeepDive | null = null;
  const isaacBrand = brandRows.find((b) => b.brand_slug === "isaac");
  if (isaacBrand) {
    const { data: rows } = await sb
      .from("supplier_products")
      .select("name, is_active, main_image_url, image_urls, is_public_override, has_configurator, configurator_schema")
      .eq("brand_id", isaacBrand.id)
      .limit(200);
    const list = rows ?? [];
    const withPhoto = list.filter((r) => !!r.main_image_url || (Array.isArray(r.image_urls) && r.image_urls.length > 0)).length;
    const sampleWithSchema = list.find((r) => r.configurator_schema);
    isaac = {
      brandPublic: isaacBrand.is_public,
      totalRows: list.length,
      activeRows: list.filter((r) => r.is_active).length,
      withPhoto,
      overrideTrue: list.filter((r) => r.is_public_override === true).length,
      overrideFalse: list.filter((r) => r.is_public_override === false).length,
      hasConfigurator: list.filter((r) => r.has_configurator).length,
      sampleSchema: sampleWithSchema?.configurator_schema ?? null,
      sampleName: (sampleWithSchema?.name as string) ?? (list[0]?.name as string) ?? null,
    };
  }

  let lastImport: Health["lastImport"] = null;
  try {
    const { data } = await sb
      .from("cron_runs")
      .select("status, finished_at, duration_ms, error_message, result_json")
      .ilike("cron_name", "%supplier%")
      .order("finished_at", { ascending: false, nullsFirst: false })
      .limit(1);
    lastImport = data?.[0] ?? null;
  } catch {
    lastImport = null;
  }

  return { brands: brandsOut, alerts, isaac, lastImport };
}

export default async function FeedHealthPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/feed-health");

  const health = await loadHealth();

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 bg-[#F7F9FF] min-h-screen">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-[#1a1a2e]">Feed health</h1>
            <Link href="/admin" className="text-sm text-[#3B7CF4] font-bold">← Admin</Link>
          </div>

          {!health && (
            <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 text-sm text-amber-900">
              Supabase není nakonfigurován v tomto prostředí.
            </div>
          )}

          {health && (
            <div className="space-y-6">
              {/* Alerty */}
              {health.alerts.length > 0 ? (
                <div className="rounded-xl p-4 bg-red-50 border border-red-200">
                  <div className="text-sm font-black text-red-800 mb-1">⚠️ Upozornění</div>
                  <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                    {health.alerts.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl p-4 bg-green-50 border border-green-200 text-sm text-green-800 font-bold">
                  ✓ Všechny veřejné značky mají viditelné produkty.
                </div>
              )}

              {/* Poslední import */}
              <div className="rounded-2xl bg-white border border-[#E2E6F3] p-5">
                <h2 className="font-black text-[#1a1a2e] mb-2">Poslední import dodavatelských feedů</h2>
                {health.lastImport ? (
                  <div className="text-sm text-[#5A6480] space-y-1">
                    <div>Status: <strong className={health.lastImport.status === "success" ? "text-green-700" : "text-red-700"}>{health.lastImport.status ?? "?"}</strong></div>
                    <div>Dokončeno: {health.lastImport.finished_at ? new Date(health.lastImport.finished_at).toLocaleString("cs-CZ") : "—"}{health.lastImport.duration_ms ? ` · ${Math.round(health.lastImport.duration_ms / 1000)}s` : ""}</div>
                    {health.lastImport.error_message && <div className="text-red-700">Chyba: {health.lastImport.error_message}</div>}
                    {health.lastImport.result_json != null && (
                      <pre className="mt-2 text-xs bg-[#F7F9FF] p-2 rounded overflow-auto max-h-40">{JSON.stringify(health.lastImport.result_json, null, 2)}</pre>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-[#9AA3C2]">Žádný záznam běhu importu.</div>
                )}
              </div>

              {/* Per-brand tabulka */}
              <div className="rounded-2xl bg-white border border-[#E2E6F3] p-5 overflow-x-auto">
                <h2 className="font-black text-[#1a1a2e] mb-3">Značky</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#9AA3C2] text-xs uppercase tracking-wider">
                      <th className="py-2 pr-4">Značka</th>
                      <th className="py-2 pr-4">Veřejná</th>
                      <th className="py-2 pr-4">Aktivní</th>
                      <th className="py-2 pr-4">S fotkou</th>
                      <th className="py-2 pr-4">Viditelné</th>
                    </tr>
                  </thead>
                  <tbody>
                    {health.brands.map((b) => (
                      <tr key={b.slug} className={`border-t border-[#F0F2FA] ${b.isPublic && b.visible === 0 ? "bg-red-50" : ""}`}>
                        <td className="py-2 pr-4 font-bold text-[#1a1a2e]">{b.slug}</td>
                        <td className="py-2 pr-4">{b.isPublic ? "✓" : "—"}</td>
                        <td className="py-2 pr-4">{b.activeTotal}</td>
                        <td className="py-2 pr-4">{b.withPhoto}</td>
                        <td className={`py-2 pr-4 font-bold ${b.isPublic && b.visible === 0 ? "text-red-700" : "text-[#1a1a2e]"}`}>{b.visible}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ISAAC deep-dive */}
              {health.isaac && (
                <div className="rounded-2xl bg-white border border-[#E2E6F3] p-5">
                  <h2 className="font-black text-[#1a1a2e] mb-2">ISAAC — detail</h2>
                  <div className="text-sm text-[#5A6480] grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    <div>Značka veřejná: <strong>{health.isaac.brandPublic ? "ANO" : "NE"}</strong></div>
                    <div>Řádků celkem: <strong>{health.isaac.totalRows}</strong></div>
                    <div>Aktivních: <strong className={health.isaac.activeRows === 0 ? "text-red-700" : ""}>{health.isaac.activeRows}</strong></div>
                    <div>S fotkou: <strong>{health.isaac.withPhoto}</strong></div>
                    <div>override=true: <strong>{health.isaac.overrideTrue}</strong></div>
                    <div>override=false: <strong>{health.isaac.overrideFalse}</strong></div>
                    <div>s konfigurátorem: <strong>{health.isaac.hasConfigurator}</strong></div>
                  </div>
                  <div className="text-xs text-[#9AA3C2] mb-1">Vzorek configurator_schema ({health.isaac.sampleName ?? "—"}) — hledám base-config marker:</div>
                  <pre className="text-xs bg-[#F7F9FF] p-3 rounded overflow-auto max-h-96">{health.isaac.sampleSchema ? JSON.stringify(health.isaac.sampleSchema, null, 2) : "žádné configurator_schema"}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
