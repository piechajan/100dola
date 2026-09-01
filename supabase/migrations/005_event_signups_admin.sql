-- 100dola — event_signups admin workflow (stavy + poznámka)
-- Vytvořeno 2026-09-01. Idempotentní.
--
-- Rozšíří stav o admin workflow: nová → zpracovává se → posláno → zaplaceno,
-- + „nedořešeno" (blokované, čeká na akci) s poznámkou `admin_note`.

alter table public.event_signups drop constraint if exists event_signups_status_check;
alter table public.event_signups add constraint event_signups_status_check
  check (status in ('new','processing','offer_sent','paid','pending','cancelled'));

alter table public.event_signups add column if not exists admin_note text;
