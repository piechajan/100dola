-- 033_newsletter_subscribers_extend.sql
-- Rozšíření existující newsletter_subscribers (migrace 002 + 009) o sloupce
-- potřebné pro send-to-all newsletter campaign delivery tracking.

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS name text,                          -- personalizace ("Ahoj Honzo,")
  ADD COLUMN IF NOT EXISTS last_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS send_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS open_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bounce_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ip_address inet,
  ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS idx_newsletter_subs_confirmed_sendable
  ON newsletter_subscribers (registered_at DESC)
  WHERE confirmed = true AND unsubscribed_at IS NULL;
