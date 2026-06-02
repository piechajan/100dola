-- 014_supplier_catalog.sql
-- Multi-supplier import infrastruktura + ISAAC konfigurátor (Cesta B = custom UI nad jejich data).
--
-- Architektura:
--   suppliers              — dodavatelé (Sportimport první; přibudou)
--   supplier_brands        — brand IDs v rámci dodavatele (ISAAC=9, KASK=43 v Sportimport)
--   supplier_feeds         — feed URL config (BRAND_ID + parametry CZK/EUR/lang/items-all)
--   supplier_category_map  — jejich eshopCategories → naše kategorie (manuální mapping)
--   supplier_imports       — log: kdy, co, kolik changes (zlatý standard pro rollback)
--   supplier_products      — RAW snapshot z feedu (per import; idempotentní upsert)
--   product_overrides      — naše modifikace (vlastní popis, badge, ceny, return_window_days)
--   configurator_options   — možnosti konfigurátoru per model (Kompletace, Velikost, Sada, …)
--   configurator_tags      — konkrétní hodnoty options (Ultegra Di2, vel. L, Disc 50mm, …)
--   configurator_sessions  — user-uložené konfigurace (cart resume + analytics + retargeting)
--
-- Order flow C hybrid: per-kategorie nastavené v `supplier_category_map.default_order_flow`.

-- ─────────────────────────────────────────────────────────────────────
-- 1. suppliers
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,            -- 'sportimport', 'velocikon', …
  name text NOT NULL,                   -- 'Sport Import s.r.o.'
  adapter_id text NOT NULL,             -- 'sportimport' (matches src/lib/suppliers/<id>/)
  feed_base_url text,                   -- 'https://www.sportimport.cz/export/xml/catalogue'
  dealer_id text,                       -- naše ID u nich (pro embed/orders)
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE suppliers IS 'Multi-supplier registry. Adapter pattern v src/lib/suppliers/<adapter_id>/.';

-- ─────────────────────────────────────────────────────────────────────
-- 2. supplier_brands
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supplier_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  external_id text NOT NULL,            -- '9' (ISAAC v Sportimport)
  brand_name text NOT NULL,             -- 'Isaac Cycle'
  brand_slug text NOT NULL,             -- 'isaac' (pro filter chips na frontendu)

  -- import preference
  is_enabled boolean NOT NULL DEFAULT false,  -- master switch — Jan zapne až po review
  import_filter jsonb,                  -- supplier-specific filtr (např. ALE: {"seasons":["SS26","AW26"],"genders":["M","F"]})
  default_order_flow text NOT NULL DEFAULT 'cart' CHECK (default_order_flow IN ('cart', 'lead', 'hybrid')),

  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (supplier_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_brands_enabled ON supplier_brands(is_enabled) WHERE is_enabled = true;
COMMENT ON TABLE supplier_brands IS 'Brand registry per supplier. is_enabled = master switch (default OFF kvůli safe deploy).';

-- ─────────────────────────────────────────────────────────────────────
-- 3. supplier_category_map (jejich kategorie → naše)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supplier_category_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  external_category_path text NOT NULL,  -- 'Silniční kola|Závodní' (jejich path)
  our_category_slug text NOT NULL,       -- 'kola/silnicni/zavodni'
  our_category_name text NOT NULL,       -- 'Silniční závodní kola'

  -- override default flow per kategorii (volitelné)
  order_flow text CHECK (order_flow IN ('cart', 'lead', 'hybrid')),

  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (supplier_id, external_category_path)
);

-- ─────────────────────────────────────────────────────────────────────
-- 4. supplier_imports (log)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supplier_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES supplier_brands(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),

  -- diff counts
  items_total int,
  items_added int DEFAULT 0,
  items_updated int DEFAULT 0,
  items_unchanged int DEFAULT 0,
  items_removed int DEFAULT 0,
  variants_total int,

  -- input
  triggered_by text,                    -- 'cron' | 'admin:<user>' | 'manual'
  filter_used jsonb,                    -- snapshot import_filter použitého při tomto importu

  -- errors
  error_message text,
  log_url text                          -- volitelně link na detail log
);

CREATE INDEX IF NOT EXISTS idx_supplier_imports_supplier ON supplier_imports(supplier_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_imports_status ON supplier_imports(status) WHERE status != 'completed';

-- ─────────────────────────────────────────────────────────────────────
-- 5. supplier_products (raw snapshot — source of truth z feedu)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES supplier_brands(id) ON DELETE CASCADE,
  external_id text NOT NULL,            -- jejich item id (e.g., '19144')

  -- identity
  sku text,                             -- jejich code
  ean text,
  name text NOT NULL,
  description_html text,                -- jejich popis (input, ne final)

  -- ceny (CZK + EUR snapshot)
  price_czk_retail numeric(12,2),       -- jejich `price`/`rrp`
  price_eur_retail numeric(12,2),
  price_czk_dealer numeric(12,2),       -- jejich `dealerPrices.rdp` CZK (= naše nákupka)
  price_eur_dealer numeric(12,2),

  -- atributy
  properties jsonb,                     -- {'Druh':'Dres', 'Pohlaví':'M', 'Sezóna':'SS26', …}
  raw_category_path text,               -- jejich eshopCategories (jeden, pipe-separated)

  -- konfigurátor
  has_configurator boolean NOT NULL DEFAULT false,
  configurator_schema jsonb,            -- parsed Sportimport `configurator` (PHP-deserialized)

  -- assets
  main_image_url text,
  image_urls text[],                    -- allImages

  -- variants jako jsonb (sloupec per variant by byl over-engineering)
  variants jsonb,                       -- [{ sku, size, color, in_stock, availability }]

  -- last import that touched this row
  last_import_id uuid REFERENCES supplier_imports(id) ON DELETE SET NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,  -- false pokud item zmizel z feedu

  UNIQUE (supplier_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_products_brand ON supplier_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_active ON supplier_products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_supplier_products_configurator ON supplier_products(has_configurator) WHERE has_configurator = true;
CREATE INDEX IF NOT EXISTS idx_supplier_products_properties ON supplier_products USING GIN (properties);

COMMENT ON TABLE supplier_products IS 'RAW snapshot z feedu. Source of truth pro public katalog. Edit jen přes product_overrides.';

-- ─────────────────────────────────────────────────────────────────────
-- 6. product_overrides (naše modifikace nad raw daty)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_overrides (
  supplier_product_id uuid PRIMARY KEY REFERENCES supplier_products(id) ON DELETE CASCADE,

  -- public flags
  is_published boolean NOT NULL DEFAULT false,  -- musí být explicitně publikováno (safe default)
  is_featured boolean NOT NULL DEFAULT false,   -- „Doporučuje tým" badge
  is_new boolean NOT NULL DEFAULT false,        -- „Novinka" badge
  is_must_see boolean NOT NULL DEFAULT false,   -- „Buď vidět" badge
  custom_badge_text text,                       -- volný badge text

  -- custom content (Jan svými slovy, NE jejich)
  custom_name text,                             -- pokud chceme přejmenovat
  short_description text,                       -- 1-2 věty pro card
  team_recommendation text,                     -- italics slogan (např. „Kolo, na kterém jezdíme v Malaze")
  bullets text[],                               -- 3-5 bullets pro card

  -- pricing override
  override_price_czk numeric(12,2),             -- pokud chceme jinou cenu než retail
  on_sale boolean NOT NULL DEFAULT false,
  sale_price_czk numeric(12,2),
  vat_rate numeric(4,2) NOT NULL DEFAULT 21.00,

  -- category mapping (override z auto-mapování)
  category_slug_override text,

  -- SEO
  slug text UNIQUE,                             -- /shop/<slug>
  meta_title text,
  meta_description text,

  -- order flow per produkt (jinak fallback na brand default → category default)
  order_flow_override text CHECK (order_flow_override IN ('cart', 'lead', 'hybrid')),

  -- bike-specific (pro fit calculator — Phase 5)
  bike_geometry jsonb,                          -- { 'M': { stack: 543, reach: 380, … }, 'L': {…} }

  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_overrides_published ON product_overrides(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_product_overrides_slug ON product_overrides(slug) WHERE slug IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- 7. configurator_options + configurator_tags (parsed ISAAC config schema)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS configurator_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_product_id uuid NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  external_id text NOT NULL,                    -- jejich option id (e.g., '673')
  name text NOT NULL,                           -- 'Kompletace' | 'Velikost' | …
  display_order int NOT NULL,
  is_required boolean NOT NULL DEFAULT true,
  display_style text,                           -- 'radio' | 'dropdown' | 'swatch'
  default_tag_external_id text,                 -- ID defaultně vybraného tagu
  note text,

  UNIQUE (supplier_product_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_configurator_options_product ON configurator_options(supplier_product_id, display_order);

CREATE TABLE IF NOT EXISTS configurator_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL REFERENCES configurator_options(id) ON DELETE CASCADE,
  external_id text NOT NULL,                    -- jejich tag id (e.g., '198')
  name text NOT NULL,                           -- 'Shimano Ultegra Di2' | 'vel. L' | …
  price_modifier_czk numeric(12,2) NOT NULL DEFAULT 0,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  display_order int,

  UNIQUE (option_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_configurator_tags_option ON configurator_tags(option_id);

COMMENT ON TABLE configurator_options IS 'Parsed ISAAC config — kroky wizardu (Kompletace, Velikost, …). Cesta B custom UI nad jejich daty.';
COMMENT ON TABLE configurator_tags IS 'Hodnoty per option. price_modifier_czk = příplatek/sleva k základní ceně modelu.';

-- ─────────────────────────────────────────────────────────────────────
-- 8. configurator_sessions (user configs — cart resume + analytics)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS configurator_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_product_id uuid NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,            -- pro persist přes localStorage

  -- selected tags (snapshot)
  selected_tags jsonb NOT NULL,                  -- { option_external_id: tag_external_id }
  computed_price_czk numeric(12,2),

  -- user info (volitelné, pro lead capture flow)
  email text,
  phone text,
  full_name text,
  notes text,
  marketing_consent boolean DEFAULT false,

  -- next step
  intent text CHECK (intent IN ('save_only', 'cart', 'lead', 'order')),
  converted_to_order_id uuid,                    -- FK na orders pokud converted (FK constraint optional)

  -- attribution (reuse z attribution_v1 pattern)
  attribution jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_configurator_sessions_product ON configurator_sessions(supplier_product_id);
CREATE INDEX IF NOT EXISTS idx_configurator_sessions_email ON configurator_sessions(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_configurator_sessions_intent ON configurator_sessions(intent);
CREATE INDEX IF NOT EXISTS idx_configurator_sessions_attribution ON configurator_sessions USING GIN (attribution);

COMMENT ON TABLE configurator_sessions IS 'Per-user uložené konfigurace. Cart resume + analytics + Meta retargeting source.';

-- ─────────────────────────────────────────────────────────────────────
-- 9. trigger updated_at
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_overrides_updated_at ON product_overrides;
CREATE TRIGGER trg_product_overrides_updated_at
  BEFORE UPDATE ON product_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_configurator_sessions_updated_at ON configurator_sessions;
CREATE TRIGGER trg_configurator_sessions_updated_at
  BEFORE UPDATE ON configurator_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────
-- 10. seed: Sportimport supplier + 4 brandy (is_enabled=false default!)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO suppliers (slug, name, adapter_id, feed_base_url, notes)
VALUES (
  'sportimport',
  'Sport Import s.r.o.',
  'sportimport',
  'https://www.sportimport.cz/export/xml/catalogue',
  'XML feed live. PHP serialized configurator. Free pro reseller use.'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO supplier_brands (supplier_id, external_id, brand_name, brand_slug, is_enabled, import_filter, default_order_flow, notes)
SELECT
  s.id,
  vals.ext_id,
  vals.brand_name,
  vals.brand_slug,
  false,  -- master switch OFF — Jan zapne explicit po review
  vals.filter::jsonb,
  vals.flow,
  vals.notes
FROM suppliers s
CROSS JOIN (VALUES
  ('9',  'Isaac Cycle',         'isaac',   '{}'::text,                                                       'hybrid', 'Silniční + gravel kola, 12 s konfigurátorem'),
  ('1',  'Fast Forward Wheels', 'ffwd',    '{}'::text,                                                       'hybrid', 'Wheelsety — technické otázky často'),
  ('10', '4iiii Innovations',   '4iiii',   '{}'::text,                                                       'hybrid', 'Powermetry — kompatibilita kliky'),
  ('2',  'ALE Cycling',         'ale',     '{"seasons":["SS26","AW26"],"genders":["M","F"]}'::text,         'cart',   'Oblečení — selektivní import: aktuální sezóna, M+Ž (no junior)')
) AS vals(ext_id, brand_name, brand_slug, filter, flow, notes)
WHERE s.slug = 'sportimport'
ON CONFLICT (supplier_id, external_id) DO NOTHING;
