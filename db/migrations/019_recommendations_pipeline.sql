-- 019_recommendations_pipeline.sql
-- Hybrid recommendations: behavioral data sběr (od dne 1) + rule-based
-- fallback dokud nemáme dost objednávek (~100).

-- Materialized view-style agregát kolik krát se 2 produkty objevily
-- spolu v jednom košíku. Cron build z order_items.
CREATE TABLE IF NOT EXISTS product_pair_counts (
  product_a_kind text NOT NULL,                 -- 'own' | 'supplier'
  product_a_id text NOT NULL,
  product_b_kind text NOT NULL,
  product_b_id text NOT NULL,
  pair_count int NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_a_kind, product_a_id, product_b_kind, product_b_id),
  -- aby `(A,B)` a `(B,A)` byly stejný řádek, ukládáme s lexicographic
  -- ordering — caller musí dodržet (a_id < b_id pokud kind stejný).
  CHECK (
    (product_a_kind = product_b_kind AND product_a_id < product_b_id)
    OR (product_a_kind <> product_b_kind)
  )
);

CREATE INDEX IF NOT EXISTS idx_pair_counts_a
  ON product_pair_counts (product_a_kind, product_a_id, pair_count DESC);
CREATE INDEX IF NOT EXISTS idx_pair_counts_b
  ON product_pair_counts (product_b_kind, product_b_id, pair_count DESC);

ALTER TABLE product_pair_counts ENABLE ROW LEVEL SECURITY;
-- žádné permissive policies → service role only
