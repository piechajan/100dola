-- 015_supplier_brand_visibility.sql
-- Visibility flag oddělený od import flagu.
-- is_enabled  → cron sync zapnutý (data tečou do DB)
-- is_public   → produkty viditelné na veřejném /shop
-- Default false ⇒ ručně publish po review.

ALTER TABLE supplier_brands
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Index pro běžnou query "co ukazujeme na webu"
CREATE INDEX IF NOT EXISTS idx_supplier_brands_is_public
  ON supplier_brands (is_public) WHERE is_public = true;

-- Per produkt override (default null = honor brand)
ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS is_public_override boolean;

-- Slug + categoryId mapping (aby produkty fungovaly v existující /shop IA)
ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS public_slug text,
  ADD COLUMN IF NOT EXISTS public_category_id text,
  ADD COLUMN IF NOT EXISTS public_badges text[];

CREATE UNIQUE INDEX IF NOT EXISTS idx_supplier_products_public_slug
  ON supplier_products (public_slug) WHERE public_slug IS NOT NULL;
