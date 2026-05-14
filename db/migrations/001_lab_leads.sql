-- Lab leads — poptávky z 100dola.com/lab
-- Apply v Supabase SQL Editor.

create table if not exists lab_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  bike_brand text,
  bike_value text check (bike_value in ('under100k', '100to200k', '200kPlus', 'undecided')),
  services text[],
  preferred_window text,
  pickup_in_prague boolean default false,
  message text,
  registered_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost'))
);

create index if not exists lab_leads_email_idx on lab_leads (email);
create index if not exists lab_leads_registered_at_idx on lab_leads (registered_at desc);

-- RLS: jen service role čte/píše (žádný anonymous přístup)
alter table lab_leads enable row level security;

-- Žádné policy = jen service_role key umí číst/psát (RLS default deny)
