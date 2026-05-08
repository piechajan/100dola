-- 100dola Supabase initial schema
-- Vytvořeno 2026-05-06
--
-- Spuštění: nahraj tento SQL do Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotentní — můžeš pustit znovu, nepřepíše existující data.

-- Extension pro UUID generování
create extension if not exists "pgcrypto";

-- ── Tabulka: registrations ──────────────────────────────────────────────────
-- Eventové přihlášky (Open Miles Clinic akce a podobné).

create table if not exists public.registrations (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null,
  last_name     text not null,
  nickname      text,
  club          text,
  city          text,
  phone         text,
  email         text not null,
  is_vip        boolean not null default false,
  event_slug    text not null,
  registered_at timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- jeden e-mail max jednou na stejný event
  unique (email, event_slug)
);

create index if not exists idx_registrations_event_slug on public.registrations(event_slug);
create index if not exists idx_registrations_email on public.registrations(email);
create index if not exists idx_registrations_is_vip on public.registrations(is_vip) where is_vip = true;

-- ── Tabulka: malaga_leads ───────────────────────────────────────────────────
-- Poptávky na Malaga sekci (transport / storage / package / tour / group).

create table if not exists public.malaga_leads (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  phone             text,
  intent            text not null check (intent in ('transport','storage','package','tour','group','other')),
  package_interest  text check (package_interest in ('basic','exclusive','undecided')),
  bike_count        int,
  bike_type         text,
  is_ebike          boolean default false,
  preferred_month   text,
  group_kind        text check (group_kind in ('individual','group','club')),
  pickup_at_home    boolean default false,
  message           text,
  status            text not null default 'new' check (status in ('new','contacted','quoted','won','lost')),
  registered_at     timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_malaga_leads_email on public.malaga_leads(email);
create index if not exists idx_malaga_leads_status on public.malaga_leads(status);
create index if not exists idx_malaga_leads_intent on public.malaga_leads(intent);

-- ── View: contacts ──────────────────────────────────────────────────────────
-- Sjednocený contact list (dedup by email napříč registrations + malaga_leads).
-- Pro budoucí mailing — VIP segment, opt-in atd.

create or replace view public.contacts as
select
  email,
  max(coalesce(name, first_name || ' ' || last_name)) as name,
  bool_or(is_vip) as is_vip,
  array_agg(distinct source order by source) as sources,
  min(registered_at) as first_seen,
  max(registered_at) as last_seen
from (
  select email, first_name, last_name, null::text as name, is_vip, ('event:' || event_slug) as source, registered_at
  from public.registrations
  union all
  select email, null as first_name, null as last_name, name, false as is_vip, ('malaga:' || intent) as source, registered_at
  from public.malaga_leads
) all_sources
group by email;

-- ── updated_at trigger ──────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_registrations_updated_at on public.registrations;
create trigger trg_registrations_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

drop trigger if exists trg_malaga_leads_updated_at on public.malaga_leads;
create trigger trg_malaga_leads_updated_at
  before update on public.malaga_leads
  for each row execute function public.set_updated_at();

-- ── RLS (Row Level Security) ────────────────────────────────────────────────
-- Povoleno → server-side se připojuje přes service_role key (bypass RLS),
-- z prohlížeče (anon key) nemá přímý přístup. Žádné policies = nikdo z anon.

alter table public.registrations enable row level security;
alter table public.malaga_leads  enable row level security;

-- Záměrně NEVYTVÁŘÍME policy "select for anon" — všechny operace jdou přes
-- naši Next.js API route s service_role key, který RLS bypassuje.
