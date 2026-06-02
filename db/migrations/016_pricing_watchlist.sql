-- 016_pricing_watchlist.sql
-- Phase 2b — Pricing watchlist scaffold (NESPOUŠTĚT na prod cron until flag flipped).
-- Sledujeme ceny vybraných produktů u konkurence (primárně Heureka), denně
-- vyrobíme návrhy a pošleme e-mail Janovi s magic-link approve buttons.

-- 1) Co sledujeme + kde se dívat -------------------------------------------
CREATE TABLE IF NOT EXISTS price_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- "own" reservation pro budoucnost; MVP funguje s "supplier"
  product_kind text NOT NULL CHECK (product_kind IN ('own', 'supplier')),
  product_id text NOT NULL,                      -- UUID supplier_products nebo 'own:<id>'
  product_name text NOT NULL,                    -- snapshot pro čitelnost emailu
  competitor_url text NOT NULL,
  competitor_label text NOT NULL,                -- "Heureka", "Alza", "alecko.cz"
  parser_strategy text NOT NULL DEFAULT 'heureka'
    CHECK (parser_strategy IN ('heureka', 'generic_jsonld', 'manual')),
  css_selector text,                             -- volitelné pro generic
  last_seen_price_minor int,                     -- haléře
  last_checked_at timestamptz,
  last_error text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

CREATE INDEX IF NOT EXISTS idx_price_watchlist_product
  ON price_watchlist (product_kind, product_id);
CREATE INDEX IF NOT EXISTS idx_price_watchlist_active
  ON price_watchlist (is_active) WHERE is_active = true;

-- 2) Pravidla per produkt -----------------------------------------------
CREATE TABLE IF NOT EXISTS price_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_kind text NOT NULL CHECK (product_kind IN ('own', 'supplier')),
  product_id text NOT NULL,
  min_margin_pct numeric(5,2),                   -- nikdy nesnížit pod tuto marži
  max_daily_drop_pct numeric(5,2) DEFAULT 5.0,   -- brzda proti scraper bugu
  react_to_increase boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_kind, product_id)
);

-- 3) Denní návrhy ze cronu, čekají na schválení ----------------------------
CREATE TABLE IF NOT EXISTS price_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid NOT NULL REFERENCES price_watchlist(id) ON DELETE CASCADE,
  ran_at timestamptz NOT NULL DEFAULT now(),
  our_price_minor int NOT NULL,
  competitor_price_minor int,                    -- null = scrape failed
  suggested_price_minor int,                     -- po aplikaci rules
  suggested_action text NOT NULL
    CHECK (suggested_action IN ('lower', 'raise', 'hold', 'no_data')),
  reason text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'auto_applied')),
  approve_token text UNIQUE,                     -- HMAC token pro magic link
  expires_at timestamptz NOT NULL,
  decided_at timestamptz,
  decided_by text,
  decided_via text
    CHECK (decided_via IS NULL OR decided_via IN ('magic_link', 'admin_ui'))
);

CREATE INDEX IF NOT EXISTS idx_price_proposals_status
  ON price_proposals (status, expires_at);

-- 4) Audit log změn cen ----------------------------------------------------
CREATE TABLE IF NOT EXISTS price_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_kind text NOT NULL CHECK (product_kind IN ('own', 'supplier')),
  product_id text NOT NULL,
  old_price_minor int,
  new_price_minor int NOT NULL,
  source text NOT NULL,                          -- 'proposal' | 'manual_admin'
  proposal_id uuid REFERENCES price_proposals(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by text
);

CREATE INDEX IF NOT EXISTS idx_price_changes_product
  ON price_changes (product_kind, product_id, changed_at DESC);

-- 5) RLS — pouze service_role smí (bypass) -----------------------------
ALTER TABLE price_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_changes ENABLE ROW LEVEL SECURITY;

-- žádné permissive policy ⇒ default-deny pro anon/authenticated.
-- service_role bypassuje RLS automaticky (Supabase chování).
