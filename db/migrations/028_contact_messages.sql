-- 028_contact_messages.sql
-- Inbox pro chat widget "Napiš nám" + AI draft pro Janovu odpověď.
-- Zákazník napíše zprávu → uložíme + zavoláme Claude pro draft →
-- pošleme Janovi mail s formulářem + AI návrhem + auto-reply zákazníkovi.

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer input
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  page_url text,                                -- URL stránky, ze které napsal (kontext)
  product_slug text,                            -- pokud z PDP → produkt o kterém se ptá

  -- AI draft (volitelné — pokud máme ANTHROPIC_API_KEY)
  ai_draft text,
  ai_model text,                                -- claude-haiku-4-5-* nebo similar
  ai_tokens_in int,
  ai_tokens_out int,
  ai_error text,                                -- pokud AI selhala (Jan stejně dostane mail bez draftu)

  -- Lifecycle
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'spam', 'archived')),
  replied_at timestamptz,
  replied_by text,                              -- email admina
  reply_text text,                              -- co Jan reálně poslal (pokud reply trackujeme)

  -- Auto-reply zákazníkovi
  auto_reply_sent_at timestamptz,
  notification_sent_at timestamptz,             -- kdy přišel mail Janovi

  -- Anti-spam
  ip_address inet,
  user_agent text,
  honeypot_caught boolean DEFAULT false,        -- zachycené spam pokusy (honeypot field vyplněn)

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON contact_messages (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email
  ON contact_messages (email, created_at DESC);

-- Rate-limit helper: spočítá zprávy z IP za poslední hodinu
CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_recent
  ON contact_messages (ip_address, created_at DESC) WHERE honeypot_caught = false;

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- žádné policies → service role only (POST endpoint validuje + inserttuje)
