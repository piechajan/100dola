-- 038_bike_inquiries.sql (přečíslováno z 036 — kolidovalo s 036_preorders.sql)
-- Poptávky na kola, která zatím nejsou v e-shopu (Scott 2027 lineup atd.).
-- Endpoint /api/bike-inquiry zapisuje sem + paralelně posílá e-mail Janovi.
-- E-mail je primární kanál, DB je backup pro CRM/audit.

CREATE TABLE IF NOT EXISTS bike_inquiries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Co poptává
  bike_model   text NOT NULL,
  bike_variant text,

  -- Kdo poptává
  full_name    text NOT NULL,
  email        text NOT NULL,
  phone        text,
  notes        text,
  consent_gdpr boolean NOT NULL,

  -- Workflow status (manuální update přes admin později)
  status       text NOT NULL DEFAULT 'new'
               CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  admin_note   text,

  -- Attribution / observability
  client_ip    text,
  user_agent   text,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bike_inquiries_created_at_idx
  ON bike_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS bike_inquiries_status_idx
  ON bike_inquiries (status) WHERE status != 'lost';

CREATE INDEX IF NOT EXISTS bike_inquiries_model_idx
  ON bike_inquiries (bike_model);

-- Trigger pro updated_at — reuse function pokud už existuje (migrace 011 etc.)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bike_inquiries_updated_at ON bike_inquiries;
CREATE TRIGGER bike_inquiries_updated_at
  BEFORE UPDATE ON bike_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- RLS: služební role (server-side endpoint) má plný přístup, ne anon/auth.
ALTER TABLE bike_inquiries ENABLE ROW LEVEL SECURITY;

-- Žádné public policy = anon/authenticated klienti nic nevidí. Pouze
-- service_role klíč (server endpoint) projde díky bypass RLS.

COMMENT ON TABLE bike_inquiries IS
  'Nezávazné poptávky na kola mimo e-shop (Scott 2027 lineup, custom builds).';
COMMENT ON COLUMN bike_inquiries.status IS
  'Workflow: new (čeká) → contacted (Jan zavolal) → quoted (nabídka poslaná) → won/lost.';
