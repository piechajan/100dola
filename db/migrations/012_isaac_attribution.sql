-- 012_isaac_attribution.sql
-- Přidá attribution JSONB sloupec pro ukládání zdroje rezervace
-- (fbp/fbc cookies + UTM tagy z landing URL). Volitelné, nullable.
-- Pro retrospektivní vyhodnocení paid vs organic acquisition.

ALTER TABLE isaac_test_reservations
  ADD COLUMN IF NOT EXISTS attribution jsonb;

-- GIN index pro rychlé filtrování podle utm_source / utm_campaign apod.
CREATE INDEX IF NOT EXISTS idx_isaac_test_reservations_attribution
  ON isaac_test_reservations USING GIN (attribution);

COMMENT ON COLUMN isaac_test_reservations.attribution IS
  'Zdroj rezervace: fbp, fbc, utm_*, fbclid, gclid, landing_url, landing_referrer, landing_at. NULL pro pre-2026-05-30 záznamy.';
