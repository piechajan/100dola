-- 025_cron_runs.sql
-- Persistent log Vercel cron execution — Jan vidí v admin co kdy běželo,
-- jak dlouho, s jakým výsledkem, jestli failed.

CREATE TABLE IF NOT EXISTS cron_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cron_name text NOT NULL,                    -- 'stock-notify', 'dmarc-check', 'import-supplier-feeds'…
  schedule text,                              -- '0 9 * * *' (info only, ne pro execution)
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms int,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'no_op', 'gated')),
  -- 'no_op'  = cron běžel ale neměl co dělat (žádné pending)
  -- 'gated'  = feature flag off (price-watchlist bez ENABLE_PRICE_WATCHLIST)
  -- 'failed' = exception nebo error response
  error_message text,
  -- Volné struktura per cron — agregace, counts, IDs zpracovaných items
  result_json jsonb
);

CREATE INDEX IF NOT EXISTS idx_cron_runs_name_started
  ON cron_runs (cron_name, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_runs_status
  ON cron_runs (status, started_at DESC) WHERE status IN ('failed', 'running');

ALTER TABLE cron_runs ENABLE ROW LEVEL SECURITY;
-- žádné permissive policies → service role only
