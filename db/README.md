# Supabase migrations — 100dola

Bez Supabase DB hesla v env nelze migrace aplikovat z CI/scriptu. Apply ručně přes SQL editor v Supabase dashboardu.

## Postup

1. https://supabase.com/dashboard → projekt `100dola` → **SQL Editor** (left sidebar)
2. Pro každý soubor:
   - Otevři `db/migrations/001_lab_leads.sql`
   - Copy obsah → paste do SQL Editoru → **Run**
   - Ověř v Table Editor že tabulka existuje
   - Opakuj pro `002_newsletter_subscribers.sql` a `003_orders.sql`

## Po aplikaci

API endpointy (`/api/registrations`, `/api/orders`) automaticky detekují, že Supabase je nakonfigurovaný (přes `isSupabaseConfigured()`) a začnou ukládat data do DB místo file storage.

File storage záznamy (`/tmp/registrations.json`, `/tmp/orders.json`) v Vercelu zůstanou jako historie — nepřepisují se. Po prvním DB-backed deploy nová data poletí jen do DB.

## Pořadí

1. `001_lab_leads.sql` — Lab poptávky
2. `002_newsletter_subscribers.sql` — „Hlídat akce" newsletter
3. `003_orders.sql` — e-shop objednávky (vč. order_items child tabulka)

## Bezpečnost

Všechny tabulky mají RLS enabled. Žádné `policy` definované = jen `service_role` key (v Vercel env vars) umí číst/psát. Anon key nemá přístup.
