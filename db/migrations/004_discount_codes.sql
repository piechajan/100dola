-- Discount codes — slevové kódy pro e-shop
-- Apply v Supabase SQL Editor.

create table if not exists discount_codes (
  code text primary key,                     -- např. "JARO2026"
  type text not null check (type in ('percent', 'fixed')),
  value integer not null,                    -- percent (1-100) nebo Kč
  min_order_total integer default 0,         -- minimální objem objednávky v Kč
  max_uses integer,                          -- null = unlimited
  used_count integer not null default 0,
  active boolean not null default true,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  description text,                          -- interní popis pro adminu
  created_at timestamptz not null default now()
);

create index if not exists discount_codes_active_idx on discount_codes (active) where active = true;

-- Audit redemption per order
alter table orders
  add column if not exists discount_code text references discount_codes(code) on delete set null,
  add column if not exists discount_amount integer default 0;

create index if not exists orders_discount_code_idx on orders (discount_code);

alter table discount_codes enable row level security;

-- Seed pár výchozích kódů (Jan upraví / vymaže)
insert into discount_codes (code, type, value, max_uses, description) values
  ('WELCOME10', 'percent', 10, 100, 'Welcome 10 % na první objednávku (max 100×)'),
  ('OMC500', 'fixed', 500, 50, '500 Kč sleva pro OMC členy')
on conflict (code) do nothing;
