-- 031_service_bookings.sql
-- Rezervace na servis / bikefit ve Šternberku. Customer vyplní form
-- s preferovaným termínem, Jan ho kontaktuje pro potvrzení (žádný rigid
-- kalendář — jeden mechanik, flex termíny).

CREATE TABLE IF NOT EXISTS service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,                          -- pro service je telefon povinný (rychlejší koordinace)

  -- Booking specs
  service_type text NOT NULL CHECK (service_type IN ('servis', 'bikefit', 'detailing', 'jine')),
  bike_brand text,
  bike_model text,
  bike_kind text,                               -- silnicni / gravel / mtb / elektrokolo

  -- Preferred slot (volný text — Jan koordinuje)
  preferred_date date,
  preferred_time_label text,                    -- "dopoledne", "odpoledne", "po 16h"…
  flexibility text,                             -- "kdykoliv tento týden", "jen víkend"…

  -- Popis problému/požadavku
  description text NOT NULL,

  -- Lifecycle
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled')),
  confirmed_at timestamptz,
  confirmed_by text,
  completed_at timestamptz,
  admin_note text,

  -- Anti-spam
  honeypot_caught boolean DEFAULT false,
  ip_address inet,
  user_agent text,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_status_created
  ON service_bookings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_bookings_preferred_date
  ON service_bookings (preferred_date) WHERE status = 'new';

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
-- žádné policies → service role only
