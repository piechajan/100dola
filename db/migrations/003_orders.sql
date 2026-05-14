-- E-shop orders — 100dola sport objednávky
-- Apply v Supabase SQL Editor.

create table if not exists orders (
  id text primary key,                       -- formát YYMMDDNNNN
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),

  -- Total
  subtotal integer not null,                 -- Kč × 1 (whole crowns)
  shipping_fee integer not null,
  total integer not null,

  -- Contact
  name text not null,
  email text not null,
  phone text not null,
  company_name text,
  company_ico text,
  company_dic text,

  -- Shipping
  shipping_method text not null,
  shipping_method_label text not null,
  street text,
  city text,
  zip text,
  zasilkovna_pickup text,
  has_bulky boolean default false,

  -- Payment
  payment_method text not null,
  payment_method_label text not null,
  paid_at timestamptz,

  notes text,
  registered_at timestamptz not null default now(),

  -- Tracking
  tracking_number text,
  shipped_at timestamptz
);

create index if not exists orders_email_idx on orders (email);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_registered_at_idx on orders (registered_at desc);

create table if not exists order_items (
  id bigserial primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id integer not null,
  slug text not null,
  name text not null,
  price_with_vat integer not null,           -- snapshot ceny v okamžiku objednání (Kč)
  vat_rate smallint not null,                -- 21, 12, 0
  qty smallint not null,
  bulky boolean default false
);

create index if not exists order_items_order_id_idx on order_items (order_id);

alter table orders enable row level security;
alter table order_items enable row level security;
