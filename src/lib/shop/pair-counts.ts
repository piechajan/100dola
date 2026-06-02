import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Behavioral recommendations pipeline.
 * Po vytvoření objednávky se volá s polem slug-ů produktů v košíku.
 * Pro každou unikátní dvojici (A, B) inkrementujeme `pair_count` v
 * tabulce product_pair_counts.
 *
 * Lexicographic ordering — `(A,B)` a `(B,A)` mapujeme na stejný řádek.
 *
 * Slug-based: zatím rozlišujeme jen "supplier" / "own" podle prefixu
 * (configurator slugy mají vlastní hash). Jednodušší než joinovat IDs.
 */
export async function recordProductPairs(
  sb: SupabaseClient,
  slugs: string[],
): Promise<void> {
  const uniq = Array.from(new Set(slugs.filter(Boolean)));
  if (uniq.length < 2) return;

  // n choose 2 unikátních párů
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < uniq.length; i++) {
    for (let j = i + 1; j < uniq.length; j++) {
      const a = uniq[i];
      const b = uniq[j];
      // Lexicographic order
      pairs.push(a < b ? [a, b] : [b, a]);
    }
  }

  // Pro zjednodušení MVP: ukládáme jako kind='slug' (neřešíme own/supplier).
  // Pokud nutno, dál migrujeme na pravé kind+id.
  const rows = pairs.map(([a, b]) => ({
    product_a_kind: "slug",
    product_a_id: a,
    product_b_kind: "slug",
    product_b_id: b,
    pair_count: 1,
    last_seen_at: new Date().toISOString(),
  }));

  // Upsert s increment by 1
  // Supabase nemá native increment v insert/upsert → 2 query:
  //  1) upsert ignore conflict (vloží nové)
  //  2) RPC nebo update existujících +1
  // Pro jednoduchost MVP: postupně každý pár.
  for (const row of rows) {
    const { error } = await sb.rpc("increment_pair_count", {
      a_kind: row.product_a_kind,
      a_id: row.product_a_id,
      b_kind: row.product_b_kind,
      b_id: row.product_b_id,
    });
    if (error) {
      // Fallback: try upsert (rpc nemusí být deployed)
      await sb.from("product_pair_counts").upsert(row, {
        onConflict: "product_a_kind,product_a_id,product_b_kind,product_b_id",
      });
    }
  }
}
