"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/admin-auth";
import { upsertOverride, deleteOverride } from "@/lib/shop/configurator-overrides";
import { createClient } from "@supabase/supabase-js";

export async function saveOverrideAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/suppliers/configurator-prices");

  const tagExternalId = String(fd.get("tagExternalId") ?? "").trim();
  const tagName = String(fd.get("tagName") ?? "").trim();
  const optionExternalId = String(fd.get("optionExternalId") ?? "").trim();
  const optionName = String(fd.get("optionName") ?? "").trim();
  const productId = String(fd.get("productId") ?? "").trim();
  const valueRaw = String(fd.get("value") ?? "").trim();

  if (!tagExternalId) throw new Error("tag_external_id required");
  if (valueRaw === "") {
    // Empty = delete
    await deleteOverride(tagExternalId);
  } else {
    const value = parseFloat(valueRaw);
    if (Number.isNaN(value)) throw new Error("invalid_number");
    const r = await upsertOverride({
      tag_external_id: tagExternalId,
      tag_name: tagName,
      option_external_id: optionExternalId,
      option_name: optionName,
      price_modifier_czk_override: value,
      updated_by: ctx.email,
    });
    if (!r.ok) throw new Error(r.error ?? "upsert_failed");
  }

  revalidatePath("/admin/suppliers/configurator-prices", "page");
  // Také invaliduj cache na PDP
  revalidatePath("/shop/[...slug]", "page");

  redirect(`/admin/suppliers/configurator-prices?product=${productId}&saved=1`);
}

export async function deleteOverrideAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/suppliers/configurator-prices");

  const tagExternalId = String(fd.get("tagExternalId") ?? "").trim();
  const productId = String(fd.get("productId") ?? "").trim();
  if (!tagExternalId) throw new Error("tag_external_id required");

  await deleteOverride(tagExternalId);
  revalidatePath("/admin/suppliers/configurator-prices", "page");
  revalidatePath("/shop/[...slug]", "page");
  redirect(`/admin/suppliers/configurator-prices?product=${productId}&saved=1`);
}

/**
 * Bulk paste: vstup typu "Shimano 105 Di2 = +25000\nFFWD RYOT55 = +18000".
 * Najde tagy podle name v daném produktu, upsertne overrides.
 */
export async function bulkSaveAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/suppliers/configurator-prices");

  const productId = String(fd.get("productId") ?? "").trim();
  const bulkText = String(fd.get("bulkText") ?? "");
  if (!productId || !bulkText) {
    redirect(`/admin/suppliers/configurator-prices?product=${productId}`);
  }

  // Načti schema produktu
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("no_db");
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: prod } = await sb
    .from("supplier_products")
    .select("configurator_schema")
    .eq("id", productId)
    .maybeSingle();
  if (!prod) throw new Error("product_not_found");

  const schema = (prod as { configurator_schema: { tags?: Array<{ name: string; externalId: string; optionExternalId: string }>; options?: Array<{ name: string; externalId: string }> } | null }).configurator_schema;
  if (!schema?.tags) {
    redirect(`/admin/suppliers/configurator-prices?product=${productId}`);
  }

  const optionMap = new Map((schema.options ?? []).map((o) => [o.externalId, o.name]));

  // Parse text → "Tag name = value" lines
  for (const line of bulkText.split("\n")) {
    const m = line.match(/^(.+?)\s*=\s*([+-]?\d+(?:[.,]\d+)?)/);
    if (!m) continue;
    const tagName = m[1].trim();
    const value = parseFloat(m[2].replace(",", "."));
    if (Number.isNaN(value)) continue;
    // Najdi tag podle name (case-insensitive)
    const tag = (schema.tags ?? []).find((t) => t.name.toLowerCase() === tagName.toLowerCase());
    if (!tag) continue;
    await upsertOverride({
      tag_external_id: tag.externalId,
      tag_name: tag.name,
      option_external_id: tag.optionExternalId,
      option_name: optionMap.get(tag.optionExternalId) ?? null,
      price_modifier_czk_override: value,
      updated_by: ctx.email,
    });
  }

  revalidatePath("/admin/suppliers/configurator-prices", "page");
  revalidatePath("/shop/[...slug]", "page");
  redirect(`/admin/suppliers/configurator-prices?product=${productId}&saved=1`);
}
