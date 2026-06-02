import type {
  PriceRules,
  ProposalCalc,
  SuggestedAction,
  WatchlistRow,
  CompetitorPriceResult,
} from "./types";

/**
 * Aplikuje pravidla a vrátí navrhovanou akci + cenu.
 *
 * Rozhodovací logika:
 *  1) Pokud konkurenční scrape selhal → "no_data"
 *  2) Konkurent < nás → "lower" (s limity min_margin a max_daily_drop)
 *  3) Konkurent > nás + react_to_increase=true → "raise" (zachycení marže)
 *  4) Jinak → "hold" (rozdíl je v toleranci nebo brzděno pravidly)
 */
export function decideProposal(
  watch: Pick<WatchlistRow, "id">,
  ourPriceMinor: number,
  competitor: CompetitorPriceResult,
  rules: PriceRules,
  costPriceMinor: number | null,
): ProposalCalc {
  if (!competitor.ok || competitor.price_minor === null) {
    return {
      watchlist_id: watch.id,
      our_price_minor: ourPriceMinor,
      competitor_price_minor: null,
      suggested_price_minor: null,
      suggested_action: "no_data",
      reason: competitor.error ?? "scrape_failed",
    };
  }

  const comp = competitor.price_minor;
  // 1 % nahoru i dolů = tolerance
  const tolerance = Math.max(100, Math.round(ourPriceMinor * 0.01));

  if (comp < ourPriceMinor - tolerance) {
    // Konkurent levnější — navrhujeme sjet
    const targetMinor = comp; // match
    const { action, suggested, reason } = applyLowerRules(
      ourPriceMinor,
      targetMinor,
      rules,
      costPriceMinor,
    );
    return {
      watchlist_id: watch.id,
      our_price_minor: ourPriceMinor,
      competitor_price_minor: comp,
      suggested_price_minor: suggested,
      suggested_action: action,
      reason,
    };
  }

  if (comp > ourPriceMinor + tolerance && rules.react_to_increase) {
    return {
      watchlist_id: watch.id,
      our_price_minor: ourPriceMinor,
      competitor_price_minor: comp,
      suggested_price_minor: comp,
      suggested_action: "raise",
      reason: `competitor_higher_by_${pct(comp, ourPriceMinor)}pct`,
    };
  }

  return {
    watchlist_id: watch.id,
    our_price_minor: ourPriceMinor,
    competitor_price_minor: comp,
    suggested_price_minor: ourPriceMinor,
    suggested_action: "hold",
    reason:
      comp > ourPriceMinor
        ? "competitor_higher_react_off"
        : "within_tolerance",
  };
}

function applyLowerRules(
  ourPriceMinor: number,
  targetMinor: number,
  rules: PriceRules,
  costPriceMinor: number | null,
): { action: SuggestedAction; suggested: number; reason: string } {
  // 1) max_daily_drop_pct
  if (rules.max_daily_drop_pct && rules.max_daily_drop_pct > 0) {
    const minAllowed = Math.round(
      ourPriceMinor * (1 - rules.max_daily_drop_pct / 100),
    );
    if (targetMinor < minAllowed) {
      // navrhujeme limit místo full matche
      return {
        action: "lower",
        suggested: minAllowed,
        reason: `capped_by_max_daily_drop_${rules.max_daily_drop_pct}pct`,
      };
    }
  }

  // 2) min_margin_pct (potřebuje cost)
  if (
    rules.min_margin_pct !== null &&
    rules.min_margin_pct > 0 &&
    costPriceMinor !== null &&
    costPriceMinor > 0
  ) {
    const minMarginAllowed = Math.round(
      costPriceMinor * (1 + rules.min_margin_pct / 100),
    );
    if (targetMinor < minMarginAllowed) {
      if (minMarginAllowed >= ourPriceMinor) {
        // Naše cena je už pod min marží? Hold.
        return {
          action: "hold",
          suggested: ourPriceMinor,
          reason: `min_margin_blocked_at_${rules.min_margin_pct}pct`,
        };
      }
      return {
        action: "lower",
        suggested: minMarginAllowed,
        reason: `capped_by_min_margin_${rules.min_margin_pct}pct`,
      };
    }
  }

  return {
    action: "lower",
    suggested: targetMinor,
    reason: "match_competitor",
  };
}

function pct(a: number, b: number): string {
  if (b <= 0) return "?";
  return (((a - b) / b) * 100).toFixed(1);
}

export function formatCzk(minor: number | null): string {
  if (minor === null) return "—";
  const koruny = Math.round(minor / 100);
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(koruny) + " Kč";
}
