"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { importBrand, getServiceSupabase } from "@/lib/suppliers/importer";
import { getAdminContext } from "@/lib/admin-auth";

async function requireAdmin() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/suppliers");
}

export async function toggleBrand(brandId: string, enable: boolean): Promise<void> {
  await requireAdmin();
  const sb = getServiceSupabase();
  await sb.from("supplier_brands").update({ is_enabled: enable }).eq("id", brandId);
  revalidatePath("/admin/suppliers");
}

export async function toggleBrandPublic(brandId: string, isPublic: boolean): Promise<void> {
  await requireAdmin();
  const sb = getServiceSupabase();
  await sb.from("supplier_brands").update({ is_public: isPublic }).eq("id", brandId);
  // public katalog je revaliduj — /shop a každý slug v /shop/[slug]
  revalidatePath("/admin/suppliers");
  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");
}

export async function runImport(brandId: string): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const sb = getServiceSupabase();

  const { data: brand, error: bErr } = await sb
    .from("supplier_brands")
    .select("supplier_id, external_id, brand_name, is_enabled")
    .eq("id", brandId)
    .single();

  if (bErr || !brand) {
    return { ok: false, message: `Brand not found: ${bErr?.message}` };
  }
  if (!brand.is_enabled) {
    return { ok: false, message: `Brand ${brand.brand_name} je vypnutý — nejdřív zapni.` };
  }

  try {
    const res = await importBrand(brand.supplier_id, brand.external_id, {
      supabase: sb,
      triggeredBy: "admin:manual",
    });
    revalidatePath("/admin/suppliers");
    return {
      ok: true,
      message: `${res.brandName}: ${res.itemsTotal} items (${res.itemsAdded} new, ${res.itemsUpdated} updated, ${res.itemsRemoved} removed). ${res.warnings.length} warnings, ${res.errors.length} errors.`,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}
