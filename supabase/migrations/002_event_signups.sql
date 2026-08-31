-- 100dola — event signups (skupinové přihlášky na akce)
-- Vytvořeno 2026-08-31
--
-- Spuštění: nahraj tento SQL do Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotentní — můžeš pustit znovu, nepřepíše existující data.
--
-- Účel: přihlášení na akci (např. Rychlebské stezky), kde se hlásí jednotlivec
-- i celá skupina/rodina. Hlavní přihlašující + 0–10 doprovodných členů.
-- Pobyt (ubytování / parkování) je JEDEN pro celou skupinu.

create extension if not exists "pgcrypto";

-- ── Tabulka: event_signups ──────────────────────────────────────────────────
-- Jedna přihláška = jedna skupina. party_size = 1 (lead) + počet členů.

create table if not exists public.event_signups (
  id               uuid primary key default gen_random_uuid(),
  event_slug       text not null,
  lead_name        text not null,
  lead_email       text not null,
  lead_phone       text not null,
  party_size       int  not null default 1,
  -- Pobyt pro celou skupinu — právě jedna volba:
  --   pension   = ubytování v Pension Radost (viz nights_from/nights_to)
  --   car       = místo na auto
  --   van       = místo na dodávku
  --   car_tent  = místo na auto + stan
  stay_type        text not null check (stay_type in ('pension','car','van','car_tent')),
  nights_from      date,
  nights_to        date,
  -- Výběr konkrétního pokoje — zatím nevyužito v UI (kapacita/pokoje doplní Jan).
  -- Nullable, aby šel picker pokojů přidat bez další migrace.
  room_choice      text,
  note             text,
  gdpr_consent     boolean not null default false,
  status           text not null default 'new' check (status in ('new','contacted','confirmed','cancelled')),
  -- Přátelská připomínka ~2 dny předem (cron ji nastaví po odeslání).
  reminder_sent_at timestamptz,
  registered_at    timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_event_signups_event_slug on public.event_signups(event_slug);
create index if not exists idx_event_signups_lead_email on public.event_signups(lead_email);
create index if not exists idx_event_signups_status on public.event_signups(status);
-- Rychlé dohledání koho ještě neupomenout pro daný event.
create index if not exists idx_event_signups_reminder on public.event_signups(event_slug, reminder_sent_at);

-- ── Tabulka: event_signup_members ───────────────────────────────────────────
-- Doprovodní členové skupiny (0–10). Jméno povinné, e-mail/telefon volitelné
-- (rodina s dětmi nemá 10 mailů). Mažou se s přihláškou (cascade).

create table if not exists public.event_signup_members (
  id         uuid primary key default gen_random_uuid(),
  signup_id  uuid not null references public.event_signups(id) on delete cascade,
  name       text not null,
  email      text,
  phone      text,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_signup_members_signup on public.event_signup_members(signup_id);

-- ── updated_at trigger ──────────────────────────────────────────────────────
-- Funkce public.set_updated_at() existuje z 001_initial.sql; pro jistotu re-create.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_event_signups_updated_at on public.event_signups;
create trigger trg_event_signups_updated_at
  before update on public.event_signups
  for each row execute function public.set_updated_at();

-- ── RLS (Row Level Security) ────────────────────────────────────────────────
-- Zapnuto, žádné policies → přístup jen přes Next.js API se service_role key
-- (bypass RLS). Z anon klíče (prohlížeč) nulový přístup. Stejný vzor jako 001.

alter table public.event_signups        enable row level security;
alter table public.event_signup_members enable row level security;
