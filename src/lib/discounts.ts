// Discount code business logic — validation + amount calc.
// Source: Supabase `discount_codes` table (s file-storage fallback nepoužíváme,
// místo toho při no-DB necháme kód jako "no discount" — slevy mají jen smysl s DB).

import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { DiscountCodeRow } from "./supabase";
import { PRODUCTS } from "@/data/products";

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
  /**
   * Řádky košíku. Povinné u kódů s omezeným rozsahem (viz CODE_SCOPES) —
   * bez nich nejde spočítat, z čeho se sleva počítá. Kategorie se dohledává
   * na serveru podle slugu, klientovi se v tomhle nevěří.
   */
  items?: Array<{ slug: string; priceWithVat: number; qty: number }>;
}

/**
 * Kódy omezené jen na část sortimentu.
 *
 * Rozsah držíme v kódu, ne v DB: tabulka `discount_codes` sloupec pro rozsah
 * nemá a přidat ho znamená migraci (ta je Gate). Pro jednorázové kampaňové
 * kódy je tohle dostatečné — až jich bude víc, přesunout do DB.
 */
interface CodeScope {
  /** Kategorie, na které sleva platí vždy. */
  categoryIds: string[];
  /**
   * Slugy, které se zlevní jen **spolu** s něčím z `categoryIds` — výhodná sada.
   * Samostatně je kód odmítne.
   */
  bundleSlugs?: string[];
  /**
   * Vyšší sazba, když si zákazník vezme i doplněk ze `bundleSlugs`.
   * Sada jede v jedné krabici, takže dopravu platíme jednou — díky tomu
   * vyšší sleva vydělá v absolutní částce víc než trenažér samotný.
   */
  percentWithBundle?: number;
  /**
   * Které slugy z `bundleSlugs` zvedají sazbu na `percentWithBundle`.
   * Ostatní doplňky (osy — levná položka) se jen zlevní stejnou základní sazbou
   * jako trenažér. Bez tohoto pole zvedá sazbu jakýkoli doplněk.
   */
  boostSlugs?: string[];
  label: string;
}

const CODE_SCOPES: Record<string, CodeScope> = {
  // Kampaň „Venku tma a zima", platnost do 11. 10. 2026.
  //
  // Chytré trenažéry + smart bike T7 vždy. Ventilátor a osy jen v sadě
  // s trenažérem: samostatně jsme u ventilátoru přesně na mediánu trhu
  // (5 799 Kč drží šest z deseti prodejců), takže sleva by jen ukrojila marži
  // bez konkurenční výhody. V sadě je to jiná situace — zvedá to hodnotu
  // košíku a osu i chlazení k trenažéru stejně člověk potřebuje.
  "100DOLA": {
    categoryIds: ["trenazery-chytre", "trenazery-smart-bike"],
    bundleSlugs: [
      "cycplus-f1-ventilator",
      "osa-trenazer-12mm-m12x10",
      "osa-trenazer-12mm-m12x15",
      "osa-trenazer-focus-rat-boost",
      // Kazety: jen Rival a RED. Force (XG-1270) by po slevě 12 % vyšel pod
      // nákupem (3 775 Kč vs. 3 782 Kč s DPH z Cykložitného), proto ho vynecháváme.
      "sram-rival-xg-1250-d1-10-30",
      "sram-red-xg-1290-e1-10-33",
    ],
    percentWithBundle: 15,
    // Jen ventilátor zvedá sazbu na 15 %; osa s trenažérem dostane stejných 12 %.
    boostSlugs: ["cycplus-f1-ventilator"],
    label: "trenažéry a smart bike",
  },
};

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

    // Základ pro výpočet slevy. U kódů s omezeným rozsahem je to jen ta část
    // košíku, která do rozsahu patří — ne celý mezisoučet.
    let base = opts.subtotal;
    let bundlePercent: number | null = null;
    const scope = CODE_SCOPES[normalized];
    if (scope) {
      if (!opts.items) {
        return { ok: false, error: "Tento kód jde uplatnit až v košíku." };
      }
      // Nejdřív hlavní produkty — podle nich se pozná, jestli vznikla sada.
      base = opts.items.reduce((sum, i) => {
        const p = PRODUCTS.find((x) => x.slug === i.slug);
        if (!p || !scope.categoryIds.includes(p.categoryId)) return sum;
        return sum + i.priceWithVat * i.qty;
      }, 0);
      if (base <= 0) {
        return { ok: false, error: `Kód platí jen na ${scope.label}.` };
      }
      // Sada: doplňky se přidají do základu, až když je hlavní produkt v košíku.
      if (scope.bundleSlugs?.length) {
        const doplnky = opts.items.reduce(
          (sum, i) => (scope.bundleSlugs!.includes(i.slug) ? sum + i.priceWithVat * i.qty : sum),
          0,
        );
        base += doplnky;
        const zvedaSazbu = opts.items.some((i) =>
          (scope.boostSlugs ?? scope.bundleSlugs!).includes(i.slug),
        );
        if (zvedaSazbu && scope.percentWithBundle) bundlePercent = scope.percentWithBundle;
      }
    }

    let amount: number;
    if (row.type === "percent") {
      amount = Math.round((base * (bundlePercent ?? row.value)) / 100);
    } else {
      amount = row.value;
    }
    // Nikdy větší než základ, na který se kód vztahuje
    amount = Math.min(amount, base);

    return {
      ok: true,
      discount: {
        code: row.code,
        type: row.type,
        value: bundlePercent ?? row.value,
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
