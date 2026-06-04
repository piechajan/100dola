-- 032_returns.sql
-- Vrácení zboží (RMA — Return Merchandise Authorization).
-- ČR zákon: 14 dní bez udání důvodu od převzetí + reklamace záruka 24 měsíců.
-- Tato tabulka pokrývá obě cesty (odvolání od smlouvy + reklamace).

CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference na objednávku
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_email text NOT NULL,                 -- snapshot pro snadné vyhledání

  -- Typ vrácení
  return_type text NOT NULL CHECK (return_type IN ('withdrawal', 'warranty', 'damaged', 'other')),
  -- withdrawal = 14 dnů bez důvodu, warranty = reklamace, damaged = poškozeno v dopravě, other = jiný důvod

  -- Co se vrací (volné — Jan to potvrdí v adminu)
  items_description text NOT NULL,              -- "Pinarello Dogma GR L (1×)"
  reason text NOT NULL,                          -- "Velikost nesedí, koupil bych M"

  -- Lifecycle
  status text NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested',                                 -- customer submitted
    'approved',                                  -- admin OK, čekáme na zboží
    'received',                                  -- zboží přišlo zpět
    'refunded',                                  -- peníze poslány
    'rejected'                                   -- neakceptováno (např. po lhůtě, vada na straně customera)
  )),

  -- Refund
  refund_amount numeric(10, 2),                  -- finální částka k vrácení (může se lišit od orderu kvůli shipping)
  refund_method text,                            -- 'bank_transfer' / 'card_reverse' / 'voucher'
  refunded_at timestamptz,

  -- Admin
  admin_note text,
  approved_at timestamptz,
  approved_by text,
  received_at timestamptz,
  rejected_reason text,

  -- Customer attachments (urls k fotkám pokud customer nahraje, MVP bez upload)
  attachment_urls text[],

  -- Anti-spam
  honeypot_caught boolean DEFAULT false,
  ip_address inet,
  user_agent text,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_returns_status_created
  ON returns (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_order
  ON returns (order_id);
CREATE INDEX IF NOT EXISTS idx_returns_email
  ON returns (customer_email);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
-- žádné policies → service role only
