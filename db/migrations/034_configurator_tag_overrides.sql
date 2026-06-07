-- 034_configurator_tag_overrides.sql
-- Per-tag override pro Sportimport feed který neposílá priceModifierCzk.
-- Admin v /admin/suppliers/configurator-prices vyplní reálné modifiers
-- pro každou option/tag kombinaci → ConfiguratorUI použije override
-- místo původní (vždy 0) feed hodnoty.

CREATE TABLE IF NOT EXISTS configurator_tag_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifikuje tag napříč všemi produkty (Sportimport tag externalId je global).
  -- Jeden override aplikuje na všechny produkty které tento tag používají
  -- (např. „Shimano 105 Di2" má stejné externalId u Boson, Meson, Element).
  tag_external_id text NOT NULL UNIQUE,

  -- Cached metadata pro admin UI (denormalizováno; updates při save).
  tag_name text,
  option_external_id text,
  option_name text,

  -- Override hodnota (může být negativní pro downgrade)
  price_modifier_czk_override numeric(10, 2) NOT NULL,

  -- Volitelná poznámka pro Jana
  note text,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cto_tag ON configurator_tag_overrides(tag_external_id);
CREATE INDEX IF NOT EXISTS idx_cto_option ON configurator_tag_overrides(option_external_id);

CREATE OR REPLACE FUNCTION cto_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cto_updated_at ON configurator_tag_overrides;
CREATE TRIGGER trg_cto_updated_at
  BEFORE UPDATE ON configurator_tag_overrides
  FOR EACH ROW EXECUTE FUNCTION cto_set_updated_at();

ALTER TABLE configurator_tag_overrides ENABLE ROW LEVEL SECURITY;
-- žádné policies → service role only
