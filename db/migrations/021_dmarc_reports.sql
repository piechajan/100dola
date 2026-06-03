-- 021_dmarc_reports.sql
-- DMARC aggregate report storage + parsing pipeline.
-- Reports chodí denně od Google, Yahoo, Seznam, Microsoft jako ZIP s XML.
-- Jan je nahraje přes /admin/dmarc/upload, parser je rozbalí, uloží + agreguje.

CREATE TABLE IF NOT EXISTS dmarc_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Source identifikace
  org_name text NOT NULL,                   -- 'google.com', 'Yahoo', 'seznam.cz'
  org_email text,
  report_id text NOT NULL,                  -- unikátní per provider, např. '17803...'
  -- Reporting period
  date_range_begin timestamptz NOT NULL,
  date_range_end timestamptz NOT NULL,
  -- Policy snapshot kterým byl report generován
  policy_domain text NOT NULL,              -- vždy '100dola.com'
  policy_p text,                            -- 'quarantine' | 'reject' | 'none'
  policy_sp text,
  policy_pct int,
  policy_adkim text,
  policy_aspf text,
  -- Pre-computed aggregations
  total_count int NOT NULL DEFAULT 0,       -- součet všech records.count
  pass_count int NOT NULL DEFAULT 0,        -- kde dkim=pass AND spf=pass (aligned)
  fail_count int NOT NULL DEFAULT 0,
  unique_source_ips int NOT NULL DEFAULT 0,

  raw_xml text,                             -- pro audit
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by text,                         -- 'admin' nebo 'inbound:resend'

  UNIQUE (org_name, report_id)
);

CREATE INDEX IF NOT EXISTS idx_dmarc_reports_period
  ON dmarc_reports (date_range_end DESC);
CREATE INDEX IF NOT EXISTS idx_dmarc_reports_org
  ON dmarc_reports (org_name, date_range_end DESC);

-- Jednotlivé records per report (per source IP / outcome)
CREATE TABLE IF NOT EXISTS dmarc_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES dmarc_reports(id) ON DELETE CASCADE,

  source_ip inet NOT NULL,
  message_count int NOT NULL,

  -- Evaluation outcome
  disposition text,                         -- 'none' | 'quarantine' | 'reject'
  policy_evaluated_dkim text,               -- 'pass' | 'fail'
  policy_evaluated_spf text,

  header_from text,

  -- Auth results — kdo byl podle DKIM/SPF identifikován
  auth_dkim_domain text,
  auth_dkim_selector text,
  auth_dkim_result text,
  auth_spf_domain text,
  auth_spf_result text,

  -- Reason (pokud disposition byl override)
  override_type text,
  override_comment text,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dmarc_records_report
  ON dmarc_records (report_id);
CREATE INDEX IF NOT EXISTS idx_dmarc_records_source
  ON dmarc_records (source_ip);

-- RLS
ALTER TABLE dmarc_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmarc_records ENABLE ROW LEVEL SECURITY;
