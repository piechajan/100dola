-- 100dola — post-event dotazník (zpětná vazba účastníků). Idempotentní.
-- Vytvořeno 2026-09-02.

create extension if not exists "pgcrypto";

create table if not exists public.event_feedback (
  id         uuid primary key default gen_random_uuid(),
  event_slug text not null,
  signup_id  uuid,                 -- volitelná vazba na event_signups (kdo odpověděl)
  overall    int,                  -- 1–5 (pro rychlé statistiky)
  nps        int,                  -- 0–10
  answers    jsonb,                -- kompletní odpovědi (viz FEEDBACK_QUESTIONS)
  created_at timestamptz not null default now()
);

create index if not exists idx_event_feedback_event on public.event_feedback(event_slug);

alter table public.event_feedback enable row level security;

-- Kdy byla přihlášce odeslána žádost o zpětnou vazbu (cron ~7 dní po akci).
alter table public.event_signups add column if not exists feedback_sent_at timestamptz;
