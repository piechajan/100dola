export type ProductKind = "own" | "supplier";

export type ParserStrategy = "heureka" | "generic_jsonld" | "manual";

export type SuggestedAction = "lower" | "raise" | "hold" | "no_data";

export type ProposalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "auto_applied";

export interface WatchlistRow {
  id: string;
  product_kind: ProductKind;
  product_id: string;
  product_name: string;
  competitor_url: string;
  competitor_label: string;
  parser_strategy: ParserStrategy;
  css_selector: string | null;
  last_seen_price_minor: number | null;
  last_checked_at: string | null;
  last_error: string | null;
  is_active: boolean;
  notes: string | null;
}

export interface PriceRules {
  min_margin_pct: number | null;
  max_daily_drop_pct: number | null;
  react_to_increase: boolean;
}

export interface CompetitorPriceResult {
  ok: boolean;
  price_minor: number | null;
  source_label: string;
  error?: string;
}

export interface ProposalCalc {
  watchlist_id: string;
  our_price_minor: number;
  competitor_price_minor: number | null;
  suggested_price_minor: number | null;
  suggested_action: SuggestedAction;
  reason: string;
}
