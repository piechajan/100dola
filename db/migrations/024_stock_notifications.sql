-- 024_stock_notifications.sql
-- Email signup pro out-of-stock variants. Když se variant naskladní
-- (cron import detekuje isInStock false → true), pošle se Resend mail.

CREATE TABLE IF NOT EXISTS stock_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Reference na supplier_products UUID (own products zatím neřešíme — vždy skladem)
  supplier_product_id uuid NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  -- Variant externalId v supplier_products.variants array. Null = jakákoliv velikost.
  variant_external_id text,
  -- Customer
  customer_email text NOT NULL,
  customer_name text,
  -- Lifecycle
  notified_at timestamptz,
  unsubscribed_at timestamptz,
  -- Anti-spam
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Same email + same product/variant = no duplicate
  UNIQUE (supplier_product_id, variant_external_id, customer_email)
);

CREATE INDEX IF NOT EXISTS idx_stock_notifications_product
  ON stock_notifications (supplier_product_id) WHERE notified_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stock_notifications_email
  ON stock_notifications (customer_email);

-- RLS — service role only (insert přes POST endpoint)
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;
