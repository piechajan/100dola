-- 018_variant_overrides.sql
-- Phase 5 variants hybrid — NESPUŠTĚNO, čeká na Janovo rozhodnutí spustit.
--
-- Sportimport feed neukládá size/color v jednotlivých variant records
-- (jen externalId + isInStock). Pro velikostní/barevný selector na PDP
-- musíme my sami mapovat externalId → size/color.
--
-- Tato tabulka drží naše override mappingy:
--   • Manuální per-produkt (Jan klikne v admin UI „velikost L pro variant
--     externalId=75713")
--   • Nebo bulk import z CSV (Sportimport pošle email s mappingem)
--
-- Cron import supplier_products NEPŘEPISUJE tyto overrides — drží se
-- nezávisle. Pokud variant z feedu zmizí, override se zachová (může
-- znamenat dočasně nedostupné), pokud změnil externalId, override
-- ztratí vazbu — admin UI by mělo upozornit.

CREATE TABLE IF NOT EXISTS product_variant_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_product_id uuid NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  -- externalId variantu ze Sportimport (např. "75713")
  variant_external_id text NOT NULL,
  -- naše mapping: velikost (XS, S, M, L, XL, XXL, K-XS...K-XXL pro děti)
  size_label text,
  -- naše mapping: barva (snake-case ID + human label)
  color_id text,
  color_label text,
  color_hex text,  -- pro swatch
  -- dostupnost — můžeme přepsat is_in_stock z feedu pokud potřeba
  in_stock_override boolean,
  -- SKU pro Fakturoid / order management
  internal_sku text,
  notes text,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (supplier_product_id, variant_external_id)
);

CREATE INDEX IF NOT EXISTS idx_variant_overrides_product
  ON product_variant_overrides (supplier_product_id);

ALTER TABLE product_variant_overrides ENABLE ROW LEVEL SECURITY;
-- žádné permissive policies → default-deny pro anon/authenticated
