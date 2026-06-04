-- 030_search_trgm.sql
-- Fuzzy search pro supplier_products přes Postgres pg_trgm extension.
-- Result: search snese překlepy ("isac" → "isaac"), víc-slovní query
-- (Postgres najde i pořadí slov), a má rychlý GIN index pro 1000+ produktů.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index na lowercase name (case-insensitive) — supplier feed je největší dataset
CREATE INDEX IF NOT EXISTS idx_supplier_products_name_trgm
  ON supplier_products USING gin (lower(name) gin_trgm_ops);

-- RPC funkce volaná z /api/shop/search:
-- vrací rows seřazené podle podobnosti name vůči query.
-- Threshold 0.18 = mírná tolerance překlepů; pod tím se row neukáže.
CREATE OR REPLACE FUNCTION supplier_products_fuzzy_search(
  search_query text,
  brand_ids uuid[],
  row_limit int DEFAULT 18
)
RETURNS TABLE (
  id uuid,
  brand_id uuid,
  name text,
  sku text,
  price_czk_retail numeric,
  main_image_url text,
  image_urls text[],
  is_public_override boolean,
  public_slug text,
  has_configurator boolean,
  properties jsonb,
  local_image_url text,
  score real
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    sp.id,
    sp.brand_id,
    sp.name,
    sp.sku,
    sp.price_czk_retail,
    sp.main_image_url,
    sp.image_urls,
    sp.is_public_override,
    sp.public_slug,
    sp.has_configurator,
    sp.properties,
    sp.local_image_url,
    GREATEST(
      similarity(lower(sp.name), lower(search_query)),
      CASE WHEN lower(sp.name) LIKE '%' || lower(search_query) || '%' THEN 0.5 ELSE 0 END
    ) AS score
  FROM supplier_products sp
  WHERE sp.brand_id = ANY(brand_ids)
    AND sp.is_active = true
    AND (
      lower(sp.name) % lower(search_query)
      OR lower(sp.name) LIKE '%' || lower(search_query) || '%'
    )
  ORDER BY score DESC, sp.name ASC
  LIMIT row_limit;
$$;

GRANT EXECUTE ON FUNCTION supplier_products_fuzzy_search(text, uuid[], int) TO service_role;
GRANT EXECUTE ON FUNCTION supplier_products_fuzzy_search(text, uuid[], int) TO anon;
GRANT EXECUTE ON FUNCTION supplier_products_fuzzy_search(text, uuid[], int) TO authenticated;
