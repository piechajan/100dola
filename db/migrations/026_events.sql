-- 026_events.sql
-- Events table — admin písatelný zdroj pravdy pro community/skupinové akce.
-- Frontend (Navbar, EventsSection, /community, sitemap) zatím čte z src/data/events.ts.
-- Tato migrace pouze připravuje DB + admin UI; frontend swap přijde dalším commitem.

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  legacy_id int,                                -- mapping na Event.id z data/events.ts (pro idempotentní backfill)

  -- Core
  title text NOT NULL,
  sport text NOT NULL CHECK (sport IN ('Silnice', 'Gravel', 'MTB', 'Skialpy', 'Běžky', 'Turistika', 'Malaga')),
  date_label text NOT NULL,                     -- "So 17. 5. 2026" — display string
  date_iso date NOT NULL,                       -- "2026-05-17"
  time_label text NOT NULL,                     -- "08:00"

  -- Location
  location text NOT NULL,
  location_detail text,

  -- Ride profile
  distance text,                                -- "65 km"
  elevation text,                               -- "1200 m"
  difficulty text CHECK (difficulty IN ('Lehká', 'Střední', 'Náročná')),

  -- Capacity
  capacity int NOT NULL DEFAULT 0,
  filled int NOT NULL DEFAULT 0,

  -- Copy
  description text NOT NULL,
  long_description text,
  what_to_bring jsonb DEFAULT '[]'::jsonb,      -- string[]
  who_is_it_for text,

  -- Organizer (denormalized — jeden organizer per event je nejjednodušší)
  organizer_name text NOT NULL DEFAULT 'Jan Piecha',
  organizer_role text NOT NULL DEFAULT 'Organizátor',

  -- Media
  photo text NOT NULL DEFAULT '/media/omc-hero-panel.jpg',
  photo_gallery jsonb DEFAULT '[]'::jsonb,

  -- External links
  route_url text,
  map_url text,
  strava_activity_url text,

  -- CTA override
  external_url text,                            -- pokud set → CTA jde sem místo /community registrace
  external_cta_label text,

  -- Status
  is_past boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,   -- draft mode pro připravované akce

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text                               -- email admina, kdo naposled editoval
);

CREATE INDEX IF NOT EXISTS idx_events_date_iso ON events (date_iso DESC);
CREATE INDEX IF NOT EXISTS idx_events_sport ON events (sport);
CREATE INDEX IF NOT EXISTS idx_events_published ON events (is_published, date_iso DESC) WHERE is_published = true;

-- Trigger pro updated_at
CREATE OR REPLACE FUNCTION events_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION events_set_updated_at();

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- Public read pro is_published = true (až přepojíme frontend)
CREATE POLICY events_public_read ON events FOR SELECT USING (is_published = true);
