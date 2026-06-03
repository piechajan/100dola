-- 023_supplier_local_images.sql
-- Persistent supplier images na Supabase Storage (bucket 'supplier-images').
-- Mapper preferuje local_* před remote URLs → instant CDN load, žádný proxy.

ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS local_image_url text,           -- main hero foto
  ADD COLUMN IF NOT EXISTS local_image_urls text[],        -- gallery
  ADD COLUMN IF NOT EXISTS image_migration_at timestamptz, -- kdy byly stažené
  ADD COLUMN IF NOT EXISTS image_migration_error text;     -- pokud download failnul

CREATE INDEX IF NOT EXISTS idx_supplier_products_migration
  ON supplier_products (image_migration_at) WHERE local_image_url IS NULL;

-- Storage bucket vytvoříme přes Supabase Dashboard / API:
--   bucket_name = 'supplier-images'
--   public = true (read-only, write přes service_role)
--   file_size_limit = 5 MB / file
--   allowed_mime_types = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
