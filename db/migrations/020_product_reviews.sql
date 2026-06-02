-- 020_product_reviews.sql
-- Public product reviews. Sběr post-delivery (7d po odeslání), magic link,
-- admin moderation, schema.org AggregateRating na PDP.

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- target identifikace (slug-based — funguje pro own i supplier)
  product_slug text NOT NULL,
  product_name_snapshot text NOT NULL,  -- pro audit po případném smazání produktu

  -- recenzent
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_city text,                   -- volitelné, pro lepší trust

  -- obsah
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text NOT NULL,
  photos text[],                        -- max 3 URL ze Supabase storage

  -- vazba na objednávku (volitelná, pro „verified buyer" badge)
  order_id text,

  -- moderation
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  moderation_note text,
  moderated_at timestamptz,
  moderated_by text,

  -- anti-spam
  ip_address inet,
  user_agent text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_slug ON product_reviews (product_slug, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_email ON product_reviews (customer_email);

-- Materialized aggregate per produkt (pro rychlý PDP fetch)
-- Refresh manually nebo přes trigger
CREATE TABLE IF NOT EXISTS product_review_aggregates (
  product_slug text PRIMARY KEY,
  rating_avg numeric(3,2),
  rating_count int NOT NULL DEFAULT 0,
  rating_1 int NOT NULL DEFAULT 0,
  rating_2 int NOT NULL DEFAULT 0,
  rating_3 int NOT NULL DEFAULT 0,
  rating_4 int NOT NULL DEFAULT 0,
  rating_5 int NOT NULL DEFAULT 0,
  last_review_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger funkce: po insert/update/delete approved review aktualizuj agregát
CREATE OR REPLACE FUNCTION recompute_review_aggregate(p_slug text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO product_review_aggregates (product_slug, rating_avg, rating_count, rating_1, rating_2, rating_3, rating_4, rating_5, last_review_at, updated_at)
  SELECT
    p_slug,
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*),
    COUNT(*) FILTER (WHERE rating = 1),
    COUNT(*) FILTER (WHERE rating = 2),
    COUNT(*) FILTER (WHERE rating = 3),
    COUNT(*) FILTER (WHERE rating = 4),
    COUNT(*) FILTER (WHERE rating = 5),
    MAX(created_at),
    now()
  FROM product_reviews
  WHERE product_slug = p_slug AND status = 'approved'
  ON CONFLICT (product_slug) DO UPDATE SET
    rating_avg = EXCLUDED.rating_avg,
    rating_count = EXCLUDED.rating_count,
    rating_1 = EXCLUDED.rating_1,
    rating_2 = EXCLUDED.rating_2,
    rating_3 = EXCLUDED.rating_3,
    rating_4 = EXCLUDED.rating_4,
    rating_5 = EXCLUDED.rating_5,
    last_review_at = EXCLUDED.last_review_at,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION trg_recompute_review_aggregate()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM recompute_review_aggregate(OLD.product_slug);
    RETURN OLD;
  ELSE
    PERFORM recompute_review_aggregate(NEW.product_slug);
    IF (TG_OP = 'UPDATE' AND OLD.product_slug <> NEW.product_slug) THEN
      PERFORM recompute_review_aggregate(OLD.product_slug);
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS reviews_aggregate_trigger ON product_reviews;
CREATE TRIGGER reviews_aggregate_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION trg_recompute_review_aggregate();

-- RLS — service role only
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_review_aggregates ENABLE ROW LEVEL SECURITY;
