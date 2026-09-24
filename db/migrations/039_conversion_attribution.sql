-- 039_conversion_attribution.sql
-- JEDNA sdílená tabulka pro zdroj příchodu (attribution) napříč VŠEMI konverzemi:
-- objednávky, přihlášky (malaga/skupinové), servis, bike-inquiry, newsletter, vrácení,
-- stock-notify i email-only formuláře (kontakt, pojištění). Zapisuje shared helper
-- logConversionAttribution() — fire-and-forget, nikdy neshodí reálnou konverzi.
--
-- Proč jedna tabulka místo sloupce u každé tabulky: pokryje i formuláře bez vlastní
-- tabulky, nový endpoint = 1 řádek (automaticky pokrytý), přehled zdrojů napříč vším
-- na jednom místě. Detail konverze se dohledá joinem přes conversion_id / email.

CREATE TABLE IF NOT EXISTS conversion_attribution (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- typ konverze: 'order' | 'malaga-signup' | 'event-signup' | 'service-booking'
  --             | 'bike-inquiry' | 'newsletter' | 'return' | 'stock-notify'
  --             | 'contact' | 'pojisteni'
  conversion_type text NOT NULL,
  -- id vytvořeného záznamu (objednávka/přihláška…) — NULL u email-only formulářů
  conversion_id   text,
  -- e-mail leada (pro párování a Custom Audience export) — hashovat až při exportu
  email           text,
  -- zdroj: { utm_source, utm_medium, utm_campaign, utm_content, utm_term,
  --          fbclid, gclid, landing_url, landing_referrer, landing_at, fbp, fbc }
  attribution     jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Filtrování podle utm_source / utm_campaign apod.
CREATE INDEX IF NOT EXISTS idx_conversion_attribution_source
  ON conversion_attribution USING GIN (attribution);

-- Přehledy „co přišlo z jakého kanálu za období".
CREATE INDEX IF NOT EXISTS idx_conversion_attribution_type_time
  ON conversion_attribution (conversion_type, created_at DESC);

-- Párování zpět na konkrétní konverzi / lead.
CREATE INDEX IF NOT EXISTS idx_conversion_attribution_email
  ON conversion_attribution (email);

COMMENT ON TABLE conversion_attribution IS
  'Zdroj příchodu (UTM/referrer/fbp) ke každé konverzi napříč webem. Zapisuje server přes logConversionAttribution().';

-- RLS: zapnuto BEZ public policy → čte/píše jen service role (server), který RLS obchází.
-- Obsahuje e-maily → nikdy nesmí být čitelné z klienta.
ALTER TABLE conversion_attribution ENABLE ROW LEVEL SECURITY;
