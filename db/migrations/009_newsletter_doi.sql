-- Newsletter double opt-in — confirmed flag + token + confirmed_at timestamp.
-- Po vytvoření subscriberovi jde mail s confirm linkem; teprve klik nastaví
-- confirmed=TRUE a podle toho se rozhoduje, jestli ho zařadit do rozesílky.

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT;

CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation_token
  ON newsletter_subscribers (confirmation_token)
  WHERE confirmation_token IS NOT NULL;
