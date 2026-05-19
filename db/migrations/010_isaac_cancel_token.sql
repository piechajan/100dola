-- ISAAC cancel token — pro zrušení rezervace přes link z e-mailu.
-- Token je unikátní per-rezervace, generován při insert.

ALTER TABLE isaac_test_reservations
  ADD COLUMN IF NOT EXISTS cancel_token TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_isaac_cancel_token
  ON isaac_test_reservations (cancel_token)
  WHERE cancel_token IS NOT NULL;
