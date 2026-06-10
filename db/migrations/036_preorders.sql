-- Předobjednávky kol — flexibilní lead capture pro nadcházející / limitované modely.
-- Použití: Scott Spark RC 2027 první case, dál ostatní nové modely (ISAAC, NORCO atd.).

CREATE TABLE IF NOT EXISTS preorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifikace modelu (slug pro routing, label pro mail)
  model_slug text NOT NULL,             -- např. "scott-spark-rc-2027"
  model_label text NOT NULL,            -- např. "Scott Spark RC 2027"

  -- Kontakt
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,

  -- Preference (volitelné, free text)
  variant_interest text,                -- např. "RC Pro · barva tba"
  size_interest text,                   -- "S / M / L / XL"
  notes text,                           -- volný text — dotazy / požadavky

  -- GDPR + marketing
  consent_gdpr boolean NOT NULL DEFAULT false,
  subscribe_newsletter boolean NOT NULL DEFAULT false,

  -- Atribuce + tech
  attribution jsonb,                    -- fbp, fbc, utm_*, gclid, landing_url
  client_ip inet,
  user_agent text,

  -- Stav
  status text NOT NULL DEFAULT 'new'    -- 'new' / 'contacted' / 'reserved' / 'cancelled'
    CHECK (status IN ('new','contacted','reserved','cancelled')),
  admin_note text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_preorders_model ON preorders(model_slug);
CREATE INDEX IF NOT EXISTS idx_preorders_status ON preorders(status);
CREATE INDEX IF NOT EXISTS idx_preorders_email ON preorders(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_preorders_created ON preorders(created_at DESC);

ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;

-- Žádné public policies — píše jen service_role (API endpoint), čte jen admin.
-- (RLS bez policy = deny by default pro anon/authenticated rolí.)

COMMENT ON TABLE preorders IS
  'Pre-order / "ozvěte se mi" lead capture pro nové modely kol. Service-role only.';
