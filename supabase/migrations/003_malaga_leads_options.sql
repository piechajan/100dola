-- 100dola — malaga_leads.options (prodejní pole sdílená s Malaga přihláškou)
-- Vytvořeno 2026-08-31
--
-- Spuštění: Supabase Dashboard → SQL Editor → New query → Run. Idempotentní.
--
-- Účel: „pošli kolo do Malagy" poptávka i Malaga přihláška nesou stejnou
-- prodejní+potřebnou informaci (transport tier, uskladnění po akci, SPONSER
-- výživa…). Ukládáme je strukturovaně do jsonb, ať se nemíchají do `message`.

alter table public.malaga_leads add column if not exists options jsonb;
