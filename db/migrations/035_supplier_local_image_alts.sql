-- 035_supplier_local_image_alts.sql
-- Per-image alt texty pro accessibility + SEO. Synchronní s local_image_urls.

ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS local_image_alts text[];
