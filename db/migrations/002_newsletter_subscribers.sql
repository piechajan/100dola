-- Newsletter subscribers — "Hlídat akce" formulář na /community
-- Apply v Supabase SQL Editor.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  registered_at timestamptz not null default now(),
  consent boolean not null,
  unsubscribe_token text not null unique,
  unsubscribed_at timestamptz,
  source text default 'community' check (source in ('community', 'shop', 'malaga', 'lab'))
);

create index if not exists newsletter_subscribers_email_idx on newsletter_subscribers (email);
create index if not exists newsletter_subscribers_unsubscribe_token_idx on newsletter_subscribers (unsubscribe_token);
create index if not exists newsletter_subscribers_active_idx on newsletter_subscribers (registered_at desc) where unsubscribed_at is null;

alter table newsletter_subscribers enable row level security;
