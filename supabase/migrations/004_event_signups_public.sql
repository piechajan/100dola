-- 100dola — event_signups: veřejná účast + fotka (social proof)
-- Vytvořeno 2026-09-01. Idempotentní.
--
-- `public_consent` = přihlašující souhlasil se zveřejněním své účasti (jméno + foto).
-- Bez souhlasu se v seznamu účastníků zobrazí jen jako „Účastník N".
-- `photo_url` = odkaz na Vercel Blob (webp avatar), jen když je souhlas.

alter table public.event_signups add column if not exists public_consent boolean not null default false;
alter table public.event_signups add column if not exists photo_url text;
