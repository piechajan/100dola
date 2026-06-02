import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchHeurekaPrice } from "./heureka";
import { decideProposal } from "./comparator";
import { sendDailyPriceReport, type DailyPriceReport } from "./email";
import type { ProposalCalc, WatchlistRow } from "./types";

/**
 * Hlavní orchestrátor denního cyklu pricing watchlistu.
 * Kroky:
 *   1) Load active watchlist
 *   2) Pro každý: fetch our price + competitor + rules
 *   3) decideProposal → uložit do price_proposals
 *   4) Pošli jeden agregátní e-mail Janovi
 *
 * GATING: caller (cron route) musí zkontrolovat ENABLE_PRICE_WATCHLIST.
 */
export async function runPricingWatchlist(sb: SupabaseClient): Promise<{
  watched: number;
  proposalsCreated: number;
  emailSent: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  const { data: rows, error } = await sb
    .from("price_watchlist")
    .select(
      "id, product_kind, product_id, product_name, competitor_url, competitor_label, parser_strategy, css_selector, last_seen_price_minor, last_checked_at, last_error, is_active, notes",
    )
    .eq("is_active", true);

  if (error) {
    return { watched: 0, proposalsCreated: 0, emailSent: false, errors: [error.message] };
  }
  if (!rows || rows.length === 0) {
    return { watched: 0, proposalsCreated: 0, emailSent: false, errors: [] };
  }

  const watchlist = rows as WatchlistRow[];

  // Bulk load: our prices + rules
  const supplierIds = watchlist
    .filter((w) => w.product_kind === "supplier")
    .map((w) => w.product_id);

  const priceMap = new Map<string, { our_minor: number; cost_minor: number | null; name: string }>();

  if (supplierIds.length > 0) {
    const { data: products } = await sb
      .from("supplier_products")
      .select("id, name, price_czk_retail, price_czk_dealer")
      .in("id", supplierIds);
    for (const p of products ?? []) {
      const row = p as { id: string; name: string; price_czk_retail: number | null; price_czk_dealer: number | null };
      priceMap.set(row.id, {
        our_minor: Math.round(Number(row.price_czk_retail ?? 0) * 100),
        cost_minor: row.price_czk_dealer !== null ? Math.round(Number(row.price_czk_dealer) * 100) : null,
        name: row.name,
      });
    }
  }

  const { data: rulesData } = await sb
    .from("price_rules")
    .select("product_kind, product_id, min_margin_pct, max_daily_drop_pct, react_to_increase, active");

  const rulesMap = new Map<string, { min_margin_pct: number | null; max_daily_drop_pct: number | null; react_to_increase: boolean }>();
  for (const r of rulesData ?? []) {
    const row = r as { product_kind: string; product_id: string; min_margin_pct: number | null; max_daily_drop_pct: number | null; react_to_increase: boolean; active: boolean };
    if (!row.active) continue;
    rulesMap.set(`${row.product_kind}:${row.product_id}`, {
      min_margin_pct: row.min_margin_pct,
      max_daily_drop_pct: row.max_daily_drop_pct,
      react_to_increase: row.react_to_increase,
    });
  }

  const calcs: Array<ProposalCalc & { watch: WatchlistRow }> = [];

  for (const w of watchlist) {
    const priceInfo = priceMap.get(w.product_id);
    if (!priceInfo) {
      errors.push(`product not found: ${w.product_id}`);
      continue;
    }

    let scraped;
    if (w.parser_strategy === "heureka") {
      scraped = await fetchHeurekaPrice(w.competitor_url);
    } else {
      scraped = {
        ok: false as const,
        price_minor: null,
        source_label: w.competitor_label,
        error: `parser_strategy_${w.parser_strategy}_not_implemented`,
      };
    }

    await sb
      .from("price_watchlist")
      .update({
        last_seen_price_minor: scraped.price_minor,
        last_checked_at: new Date().toISOString(),
        last_error: scraped.ok ? null : scraped.error ?? "unknown",
      })
      .eq("id", w.id);

    const rules = rulesMap.get(`${w.product_kind}:${w.product_id}`) ?? {
      min_margin_pct: null,
      max_daily_drop_pct: 5,
      react_to_increase: false,
    };

    const calc = decideProposal(
      w,
      priceInfo.our_minor,
      scraped,
      rules,
      priceInfo.cost_minor,
    );
    calcs.push({ ...calc, watch: w });
  }

  // Persist proposals
  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const inserts = calcs
    .filter((c) => c.suggested_action !== "no_data")
    .map((c) => ({
      watchlist_id: c.watchlist_id,
      our_price_minor: c.our_price_minor,
      competitor_price_minor: c.competitor_price_minor,
      suggested_price_minor: c.suggested_price_minor,
      suggested_action: c.suggested_action,
      reason: c.reason,
      status: "pending" as const,
      expires_at: expiresAt,
    }));

  let proposalsCreated = 0;
  if (inserts.length > 0) {
    const { data: created, error: insErr } = await sb
      .from("price_proposals")
      .insert(inserts)
      .select("id, watchlist_id");
    if (insErr) errors.push(`insert_proposals: ${insErr.message}`);
    else proposalsCreated = created?.length ?? 0;
  }

  // Build email
  const today = new Date().toISOString().slice(0, 10);
  const reportProposals: DailyPriceReport["proposals"] = calcs
    .map((c) => {
      // Match created proposal id zpátky podle watchlist_id (1:1 v rámci tohoto runu)
      return {
        proposalId: `${c.watchlist_id}:placeholder`, // překryje níže
        productName: priceMap.get(c.watch.product_id)?.name ?? c.watch.product_name,
        competitorLabel: c.watch.competitor_label,
        competitorUrl: c.watch.competitor_url,
        ...c,
      };
    });

  // Načíst skutečná proposal IDs z DB (po insertu)
  if (proposalsCreated > 0) {
    const { data: justCreated } = await sb
      .from("price_proposals")
      .select("id, watchlist_id, ran_at")
      .gte("ran_at", new Date(Date.now() - 60_000).toISOString());
    const byWatch = new Map<string, string>();
    for (const row of justCreated ?? []) {
      const r = row as { id: string; watchlist_id: string };
      byWatch.set(r.watchlist_id, r.id);
    }
    for (const p of reportProposals) {
      const real = byWatch.get(p.watchlist_id);
      if (real) p.proposalId = real;
    }
  }

  const emailResult = await sendDailyPriceReport({ date: today, proposals: reportProposals });

  return {
    watched: watchlist.length,
    proposalsCreated,
    emailSent: emailResult.sent,
    errors,
  };
}
