-- 022_admin_auth.sql
-- Admin magic-link auth + audit log.
-- Nahrazuje sdílenou cookie preview_auth=100dola2025 (deprecated po 14 dnech).

-- Whitelist admin e-mailů — Jan ručně přidá kdo má přístup
CREATE TABLE IF NOT EXISTS admin_users (
  email text PRIMARY KEY,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Default Jan
INSERT INTO admin_users (email, role, display_name)
VALUES ('piecha.jan@gmail.com', 'admin', 'Jan Piecha')
ON CONFLICT (email) DO NOTHING;

-- Magic link tokens — krátkodobé (15 min), one-time use
CREATE TABLE IF NOT EXISTS admin_login_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL REFERENCES admin_users(email) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,         -- SHA-256 hex
  expires_at timestamptz NOT NULL,
  used_at timestamptz,                     -- null = nepoužitý
  created_ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_login_tokens_email
  ON admin_login_tokens (email, created_at DESC);

-- Aktivní sessions (cookie 'admin_session' obsahuje session_token jwt)
-- Session se ukládá pro revocation + audit visibility
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL REFERENCES admin_users(email) ON DELETE CASCADE,
  session_token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  user_agent text,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_email
  ON admin_sessions (email, created_at DESC);

-- Audit log — kdo dělal co, kdy
CREATE TABLE IF NOT EXISTS admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,                        -- null = legacy preview_auth fallback
  action text NOT NULL,                    -- 'login', 'review.approve', 'supplier.toggle_public', …
  resource_type text,                      -- 'review', 'supplier_brand', 'order', …
  resource_id text,                        -- UUID nebo string ID
  metadata jsonb,                          -- volné struktura per action
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_actor
  ON admin_audit (actor_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_resource
  ON admin_audit (resource_type, resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action
  ON admin_audit (action, created_at DESC);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;
