-- 017_b2b_clubs_skeleton.sql
-- NESPOUŠTĚT — připraveno pro Phase B2B (Jan spustí později).
-- Až budeš ready: spustit přes Supabase SQL Editor (viz reference_supabase memory).
--
-- B2B mode pro cyklistické kluby:
--   • klub má vlastní profil (IČO, sleva %, kontakt)
--   • členové klubu mají user_id přiřazené ke klubu
--   • klubová sleva se aplikuje na vybrané kategorie/brandy
--   • souhrnná měsíční faktura (FUTUNATU → Fakturoid)

-- 1) Kluby
CREATE TABLE IF NOT EXISTS b2b_clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,                  -- 'omc-prague', 'cycling-team-ostrava'
  name text NOT NULL,                          -- 'Open Miles Clinic'
  legal_name text,                             -- 'OMC z.s.'
  ico text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  -- sleva: % off retail. Per-kategorie override v b2b_club_pricing.
  default_discount_pct numeric(5,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,    -- Jan musí aktivovat
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Per-kategorie / per-brand pricing override
CREATE TABLE IF NOT EXISTS b2b_club_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES b2b_clubs(id) ON DELETE CASCADE,
  category_id text,                            -- 'kola', 'obleceni', 'doplnky', nebo NULL
  brand_slug text,                             -- 'isaac', 'ale', nebo NULL
  discount_pct numeric(5,2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- aspoň jedno z (category_id, brand_slug) musí být not null
  CHECK (category_id IS NOT NULL OR brand_slug IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_b2b_pricing_club ON b2b_club_pricing (club_id);

-- 3) Členové klubu (mapping email → club)
CREATE TABLE IF NOT EXISTS b2b_club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES b2b_clubs(id) ON DELETE CASCADE,
  member_email text NOT NULL,
  member_name text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, member_email)
);

CREATE INDEX IF NOT EXISTS idx_b2b_members_email ON b2b_club_members (member_email);

-- 4) Klubové objednávky reference (orders FK nedáváme — orders.club_id nullable)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS b2b_club_id uuid REFERENCES b2b_clubs(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS b2b_member_email text;

-- RLS
ALTER TABLE b2b_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_club_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_club_members ENABLE ROW LEVEL SECURITY;

-- žádné permissive policies → default-deny (jen service role)
