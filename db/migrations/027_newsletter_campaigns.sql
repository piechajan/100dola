-- 027_newsletter_campaigns.sql
-- Newsletter campaign tracking — admin si napíše text, uloží draft,
-- pak ručně klikne Send → Resend audience batch.
--
-- MVP: žádný subscriber management v této tabulce — recipients odkazují
-- jen na agregátní counts. Audience source = newsletter_subscribers (TBD migrace)
-- nebo zatím jen seznam emailů z orders.

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  preheader text,                              -- preview text v inboxu
  body_html text NOT NULL,                     -- final HTML (admin edit jako HTML/markdown)
  body_md text,                                -- raw markdown (pro re-edit)

  -- Lifecycle
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sending', 'sent', 'failed')),
  scheduled_for timestamptz,                   -- pokud queued s budoucím časem
  sent_at timestamptz,

  -- Stats
  recipients_count int DEFAULT 0,              -- kolik emailů cílíme
  sent_count int DEFAULT 0,                    -- kolik se reálně odeslalo (Resend success)
  failed_count int DEFAULT 0,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by text,                             -- email admina
  sent_by text,
  error_message text,

  -- Audience filter (JSON pro flexibility)
  audience_filter jsonb DEFAULT '{}'::jsonb    -- e.g. {"source":"orders","status":"paid"}
);

CREATE INDEX IF NOT EXISTS idx_newsletter_status_created
  ON newsletter_campaigns (status, created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION newsletter_campaigns_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_nc_updated_at ON newsletter_campaigns;
CREATE TRIGGER trg_nc_updated_at
  BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW EXECUTE FUNCTION newsletter_campaigns_set_updated_at();

ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
-- žádné policies → service role only
