// Discount code business logic — validation + amount calc.
// Source: Supabase `discount_codes` table (s file-storage fallback nepoužíváme,
// místo toho při no-DB necháme kód jako "no discount" — slevy mají jen smysl s DB).

import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { DiscountCodeRow } from "./supabase";

export interface AppliedDiscount {
  code: string;
  type: "percent" | "fixed";
  value: number;
  /** Konkrétní Kč částka aplikované slevy (vždy ne větší než subtotal). */
  amount: number;
  description?: string;
}

export interface ValidateOptions {
  /** Mezisoučet objednávky vč. DPH (Kč). */
  subtotal: number;
}

export type DiscountValidation =
  | { ok: true; discount: AppliedDiscount }
  | { ok: false; error: string };

/**
 * Validuje code + spočítá slevu. Read-only — neuvyšuje `used_count`.
 * Použij pro real-time preview v checkoutu. Použití (increment) by mělo
 * proběhnout až ve transakci s order insertem.
 */
export async function validateDiscountCode(
  code: string,
  opts: ValidateOptions,
): Promise<DiscountValidation> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Slevové kódy zatím nejsou aktivované." };
  }

  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, error: "Zadej slevový kód." };

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("discount_codes")
      .select("*")
      .eq("code", normalized)
      .eq("active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, error: "Tento kód nenajdeme nebo není aktivní." };

    const row = data as DiscountCodeRow;
    const now = Date.now();
    if (row.valid_from && new Date(row.valid_from).getTime() > now) {
      return { ok: false, error: "Kód ještě není platný." };
    }
    if (row.valid_until && new Date(row.valid_until).getTime() < now) {
      return { ok: false, error: "Kód už není platný." };
    }
    if (row.max_uses !== null && row.used_count >= row.max_uses) {
      return { ok: false, error: "Kód už byl plně využit." };
    }
    if (opts.subtotal < row.min_order_total) {
      return {
        ok: false,
        error: `Kód platí jen pro objednávky od ${row.min_order_total} Kč.`,
      };
    }

    let amount: number;
    if (row.type === "percent") {
      amount = Math.round((opts.subtotal * row.value) / 100);
    } else {
      amount = row.value;
    }
    // Nikdy větší než subtotal
    amount = Math.min(amount, opts.subtotal);

    return {
      ok: true,
      discount: {
        code: row.code,
        type: row.type,
        value: row.value,
        amount,
        description: row.description || undefined,
      },
    };
  } catch (e) {
    console.error("[discounts] validate failed:", e);
    return { ok: false, error: "Chyba ověření kódu. Zkus to znovu." };
  }
}

/** Po úspěšném order insertu inkrementuje `used_count`. */
export async function incrementDiscountUsage(code: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = getSupabase();
    // PostgreSQL RPC nemá, ale můžeme udělat select + update s atomic increment
    // přes raw SQL by potřebovalo `rpc`. Místo toho prostý update s expression:
    const { data: row } = await sb
      .from("discount_codes")
      .select("used_count")
      .eq("code", code)
      .maybeSingle();
    if (row) {
      await sb
        .from("discount_codes")
        .update({ used_count: (row.used_count as number) + 1 })
        .eq("code", code);
    }
  } catch (e) {
    console.warn("[discounts] increment usage failed:", e);
  }
}
