/**
 * Configurator tag price modifier override layer (migrace 034).
 *
 * Sportimport feed neposílá priceModifierCzk — všechny tagy přicházejí s 0.
 * Override tabulka umožňuje Janovi v admin /admin/suppliers/configurator-prices
 * vyplnit reálné modifiers, ConfiguratorUI je pak použije místo 0.
 *
 * Tag externalId je global napříč produkty (Sportimport sdílí), takže override
 * pro „Shimano 105 Di2" se aplikuje na všechny modely co tento tag mají.
 */

import { createClient } from "@supabase/supabase-js";
import type { ConfiguratorSchema } from "@/data/products";

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface TagOverride {
  tag_external_id: string;
  tag_name: string | null;
  option_external_id: string | null;
  option_name: string | null;
  price_modifier_czk_override: number;
  note: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

/** Načte override mapping pro daný set tag externalIds. */
export async function fetchOverrides(tagIds: string[]): Promise<Map<string, number>> {
  if (tagIds.length === 0) return new Map();
  const client = sb();
  if (!client) return new Map();
  const { data } = await client
    .from("configurator_tag_overrides")
    .select("tag_external_id, price_modifier_czk_override")
    .in("tag_external_id", tagIds);
  const m = new Map<string, number>();
  for (const r of data ?? []) {
    m.set((r as { tag_external_id: string }).tag_external_id, Number((r as { price_modifier_czk_override: number }).price_modifier_czk_override));
  }
  return m;
}

/**
 * Aplikuje override na ConfiguratorSchema. Vrátí nový schema s upravenými
 * tag.priceModifierCzk hodnotami pokud override existuje.
 */
export async function applyOverridesToSchema(schema: ConfiguratorSchema): Promise<ConfiguratorSchema> {
  if (!schema?.tags?.length) return schema;
  const tagIds = schema.tags.map((t) => t.externalId);
  const overrides = await fetchOverrides(tagIds);
  if (overrides.size === 0) return schema;
  return {
    ...schema,
    tags: schema.tags.map((t) => {
      const o = overrides.get(t.externalId);
      return o !== undefined ? { ...t, priceModifierCzk: o } : t;
    }),
  };
}

/** Pro admin UI — vrátí všechny overrides + cached metadata. */
export async function listAllOverrides(): Promise<TagOverride[]> {
  const client = sb();
  if (!client) return [];
  const { data } = await client
    .from("configurator_tag_overrides")
    .select("tag_external_id, tag_name, option_external_id, option_name, price_modifier_czk_override, note, updated_by, updated_at")
    .order("option_name", { ascending: true })
    .order("tag_name", { ascending: true });
  return (data ?? []) as TagOverride[];
}

export interface UpsertOverrideInput {
  tag_external_id: string;
  tag_name?: string | null;
  option_external_id?: string | null;
  option_name?: string | null;
  price_modifier_czk_override: number;
  note?: string | null;
  updated_by: string;
}

export async function upsertOverride(input: UpsertOverrideInput): Promise<{ ok: boolean; error?: string }> {
  const client = sb();
  if (!client) return { ok: false, error: "no_db" };
  const { error } = await client
    .from("configurator_tag_overrides")
    .upsert(
      {
        tag_external_id: input.tag_external_id,
        tag_name: input.tag_name ?? null,
        option_external_id: input.option_external_id ?? null,
        option_name: input.option_name ?? null,
        price_modifier_czk_override: input.price_modifier_czk_override,
        note: input.note ?? null,
        updated_by: input.updated_by,
      },
      { onConflict: "tag_external_id" },
    );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteOverride(tagExternalId: string): Promise<{ ok: boolean; error?: string }> {
  const client = sb();
  if (!client) return { ok: false, error: "no_db" };
  const { error } = await client
    .from("configurator_tag_overrides")
    .delete()
    .eq("tag_external_id", tagExternalId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
