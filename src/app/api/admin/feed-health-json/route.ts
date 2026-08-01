import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only diagnostika (autentizovaná CRON_SECRET) — zdraví dodavatelských
 * feedů + ISAAC deep-dive + configurator_schema vzorek + admin-auth diagnostika
 * (proč magic-link nechodí). Slouží k pravidelné kontrole feedů bez admin loginu.
 * ŽÁDNÉ zápisy. ŽÁDNÉ secrety ve výstupu.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "no_db" }, { status: 503 });
  }

  const sb = getSupabase();

  // ── Feed health per brand ──────────────────────────────────────────────────
  const { data: brands } = await sb.from("supplier_brands").select("id, brand_slug, is_public");
  const brandRows = brands ?? [];
  const { data: active } = await sb
    .from("supplier_products")
    .select("brand_id, main_image_url, image_urls, is_public_override")
    .eq("is_active", true);

  const pub = new Map(brandRows.map((b) => [b.id, b.is_public]));
  const health: Record<string, { public: boolean; active: number; withPhoto: number; visible: number }> = {};
  for (const b of brandRows) health[b.brand_slug] = { public: b.is_public, active: 0, withPhoto: 0, visible: 0 };
  const slugById = new Map(brandRows.map((b) => [b.id, b.brand_slug]));
  for (const r of active ?? []) {
    const slug = slugById.get(r.brand_id as string);
    if (!slug) continue;
    const h = health[slug];
    h.active++;
    const hasPhoto = !!r.main_image_url || (Array.isArray(r.image_urls) && r.image_urls.length > 0);
    if (hasPhoto) h.withPhoto++;
    const ov = r.is_public_override as boolean | null;
    const vis = ov === false ? false : ov === true ? true : (pub.get(r.brand_id as string) && hasPhoto);
    if (vis) h.visible++;
  }

  // ── ISAAC deep-dive (bez is_active filtru) ─────────────────────────────────
  let isaac: unknown = null;
  const isaacBrand = brandRows.find((b) => b.brand_slug === "isaac");
  if (isaacBrand) {
    const { data: rows } = await sb
      .from("supplier_products")
      .select("name, sku, is_active, main_image_url, image_urls, is_public_override, has_configurator, configurator_schema")
      .eq("brand_id", isaacBrand.id)
      .limit(200);
    const list = rows ?? [];
    const sampleSchemaRow = list.find((r) => r.configurator_schema);
    isaac = {
      brandPublic: isaacBrand.is_public,
      totalRows: list.length,
      activeRows: list.filter((r) => r.is_active).length,
      withPhoto: list.filter((r) => !!r.main_image_url || (Array.isArray(r.image_urls) && r.image_urls.length > 0)).length,
      overrideTrue: list.filter((r) => r.is_public_override === true).length,
      overrideFalse: list.filter((r) => r.is_public_override === false).length,
      hasConfigurator: list.filter((r) => r.has_configurator).length,
      firstFive: list.slice(0, 5).map((r) => ({ name: r.name, sku: r.sku, active: r.is_active, hasPhoto: !!r.main_image_url })),
      sampleSchemaName: sampleSchemaRow?.name ?? null,
      sampleSchema: sampleSchemaRow?.configurator_schema ?? null,
    };
  }

  // ── Poslední import feedů ──────────────────────────────────────────────────
  let lastImport: unknown = null;
  try {
    const { data } = await sb
      .from("cron_runs")
      .select("cron_name, status, finished_at, duration_ms, error_message, result_json")
      .ilike("cron_name", "%supplier%")
      .order("finished_at", { ascending: false, nullsFirst: false })
      .limit(1);
    lastImport = data?.[0] ?? null;
  } catch (e) {
    lastImport = { error: String(e) };
  }

  // ── Admin-auth diagnostika (proč magic-link nechodí) ───────────────────────
  const authDiag: Record<string, unknown> = {};
  try {
    const { data: admins, error } = await sb.from("admin_users").select("email, is_active");
    if (error) authDiag.adminUsersTable = `ERROR: ${error.message}`;
    else {
      authDiag.adminUsersCount = admins?.length ?? 0;
      authDiag.emails = (admins ?? []).map((a) => ({ email: a.email, active: a.is_active }));
    }
  } catch (e) {
    authDiag.adminUsersTable = `EXCEPTION: ${String(e)}`;
  }
  try {
    const { count, error } = await sb
      .from("admin_login_tokens")
      .select("id", { count: "exact", head: true });
    authDiag.loginTokensTable = error ? `ERROR: ${error.message}` : "ok";
    authDiag.totalLoginTokens = count ?? 0;
  } catch (e) {
    authDiag.loginTokensTable = `EXCEPTION: ${String(e)}`;
  }

  return NextResponse.json(
    { ok: true, health, isaac, lastImport, authDiag },
    { headers: { "Cache-Control": "no-store" } },
  );
}
