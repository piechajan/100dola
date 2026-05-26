-- Orders payment lifecycle: reminder tracking + payment metadata snapshots
-- Apply v Supabase SQL Editor.

-- Den 2 reminder timestamp (NULL = ještě neposláno).
alter table orders
  add column if not exists reminder_sent_at timestamptz;

-- Snapshot platebních údajů (pro reminder e-mail bez nutnosti složit znova).
alter table orders
  add column if not exists iban text;

alter table orders
  add column if not exists variable_symbol text;

alter table orders
  add column if not exists qr_data_url text;

-- Index pro cron query (orders status=pending starší než N dní).
create index if not exists orders_status_registered_idx
  on orders (status, registered_at)
  where status = 'pending';
