-- Rate limiting přes Supabase. In-memory by Vercel serverless nešel
-- (každá instance má vlastní stav). Counter table je idempotentní napříč regiony.

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  bucket TEXT NOT NULL,
  ip TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON rate_limits (bucket, ip, ts DESC);

-- Cleanup starých záznamů (manual nebo přes cron):
-- DELETE FROM rate_limits WHERE ts < NOW() - INTERVAL '1 day';

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
