-- 029_orders_tracking_carrier.sql
-- Rozšíření trackingu zásilek — admin v /admin/orders/[id] vyplní carrier
-- (Zásilkovna/GLS/DPD/...) + tracking number → web předgenruje tracking URL +
-- pošle customer email se sledováním.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_carrier text,
  ADD COLUMN IF NOT EXISTS tracking_notified_at timestamptz;

-- Hodnoty carrier (volné textfield ale admin form nabízí dropdown):
--   'zasilkovna', 'gls', 'dpd', 'ceska_posta', 'osobne' (osobní vyzvednutí)
