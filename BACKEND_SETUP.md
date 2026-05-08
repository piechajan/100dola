# Backend setup — Supabase + Resend

Tento návod nastaví **persistentní database** (Supabase) a **transakční e-maily**
(Resend) pro 100dola.com. Bez tohoto setupu funguje fallback do `/tmp/registrations.json`,
ale data nepřežijí redeploy.

**Setup čas:** ~10–15 minut. Žádný technický skill nepotřeba.

---

## 1) Supabase (database)

### 1.1 Vytvoř projekt
1. Otevři https://supabase.com/dashboard a založ účet (přes GitHub nebo e-mail).
2. **New project** → název `100dola`, region `Frankfurt (eu-central-1)` (blízko nás).
3. Vygeneruj a **ulož** si database password (i když ho zatím přímo nepoužíváme).
4. Počkej cca 1 min, než se projekt provisione.

### 1.2 Vytvoř tabulky
1. V Supabase dashboardu jdi na **SQL Editor → New query**.
2. Otevři `web/supabase/migrations/001_initial.sql` v editoru, zkopíruj **celý obsah**.
3. Vlož do Supabase SQL Editoru a klikni **Run**.
4. Měl by vypsat „Success. No rows returned." → tabulky vytvořené.

### 1.3 Získej API credentials
1. **Project Settings → API**.
2. Zkopíruj:
   - **Project URL** (např. `https://xxxxx.supabase.co`) → env `SUPABASE_URL`
   - **service_role** secret key (pozor, NE anon!) → env `SUPABASE_SERVICE_ROLE_KEY`

⚠️ `service_role` key má **plný přístup k DB a obchází RLS**. Patří POUZE na server,
nikdy do client-side kódu nebo do `NEXT_PUBLIC_*` proměnných. Náš kód ho používá jen
v `lib/supabase.ts` (server-only).

---

## 2) Resend (e-maily)

### 2.1 Vytvoř účet
1. Otevři https://resend.com/signup.
2. Free tier: 3 000 mailů/měsíc, 100/den. Pro nás víc než dost.

### 2.2 Ověř doménu (volitelné, ale doporučené)
- **Bez ověření domény**: posíláš `from: "onboarding@resend.dev"`. Mail dorazí, ale vypadá generic + dostane se do SPAM častěji.
- **S ověřením**: posíláš `from: "Jan <jan@100dolamalaga.cz>"`. DKIM/SPF/DMARC nastaví Resend, ty jen kopíruješ DNS záznamy.

Pro start klidně bez ověření. Doménu ověříš později.

### 2.3 API key
1. **API Keys → Create API Key**.
2. Permission: **Sending access**.
3. Zkopíruj klíč (zobrazí se jen jednou) → env `RESEND_API_KEY`.

### 2.4 (Volitelné) Vlastní `from` adresa
Až ověříš doménu:
- env `RESEND_FROM_EMAIL=Jan Piecha <jan@100dolamalaga.cz>`

Bez ověření nech default — Resend automaticky použije `onboarding@resend.dev`.

---

## 3) Vlož env vars

### Lokálně — vytvoř `web/.env.local`

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=100dola Malaga <onboarding@resend.dev>
RESEND_NOTIFY_EMAIL=piecha.jan@gmail.com

# Strava (volitelné — viz STRAVA_SETUP.md)
# STRAVA_CLIENT_ID=...
# STRAVA_CLIENT_SECRET=...
# STRAVA_REFRESH_TOKEN=...
# STRAVA_CLUB_ID=2070600
```

### Vercel produkce
1. Vercel dashboard → projekt 100dola → **Settings → Environment Variables**.
2. Přidej všechny 4–5 klíčů (Production + Preview + Development).
3. Redeploy: **Deployments → ⋯ → Redeploy**.

---

## 4) Restart dev serveru

```bash
cd web
# zabij běžící server pokud běží
lsof -ti:3000 | xargs kill -9 2>/dev/null
# spusť čerstvý
npm run dev
```

## 5) Test že to funguje

### Test Malaga lead
1. Otevři `http://localhost:3000/malaga#poptavka` (po loginu).
2. Vyplň formulář — pošli.
3. Zkontroluj Supabase dashboard → **Table Editor → malaga_leads** → měl by tam být nový řádek.
4. Zkontroluj inbox `piecha.jan@gmail.com` — měl bys mít notifikační mail.
5. Zkontroluj inbox e-mailu, který jsi vyplnil ve formuláři — měl bys mít confirmation mail.

### Test event registration
1. Otevři libovolný event na `/community`.
2. Zaregistruj se přes formulář.
3. Supabase → **registrations** → nový řádek.
4. Inbox Jana → notifikace.

### Test, jestli stále fallback funguje (env vars vypnuté)
- Smaž / komentuj `SUPABASE_URL` v `.env.local`.
- Restart dev.
- Submituj poptávku — uloží se do `web/data/registrations.json` (lokálně) místo do DB.
- API endpoint vrací `fallback: true`.

---

## Architektura — co jde kam

```
Form (browser)
    │
    │ POST { source: 'malaga', name, email, intent, ... }
    ▼
/api/registrations  (Next.js Route)
    │
    ├── isSupabaseConfigured() ?
    │     ├─ yes → Supabase INSERT do malaga_leads
    │     │         ├─ Resend: notify Jan (async)
    │     │         └─ Resend: confirmation klientovi (async)
    │     └─ no  → file fallback (/tmp/registrations.json)
    │
    └── response 200 { ok: true }
```

**Klíčové:** odpověď uživateli **nečeká** na e-maily. Insert proběhne, response 200,
e-maily se pošlou v pozadí. Pokud Resend selže, lead je pořád v DB — nic není ztraceno.

---

## Troubleshooting

### „Supabase env vars missing"
Chybí `SUPABASE_URL` nebo `SUPABASE_SERVICE_ROLE_KEY` v `.env.local`. Restart dev.

### Mail nepřijde
- Zkontroluj `RESEND_API_KEY` (musí začínat `re_`).
- Zkontroluj Resend dashboard → **Emails** — pokud tam mail je se statusem `delivered` a tobě nepřišel, je to SPAM filter. Hledej v junk složce.
- `from: onboarding@resend.dev` má vyšší pravděpodobnost SPAM filteringu — ověř doménu pro produkci.

### „permission denied for table malaga_leads"
RLS je zapnuté a nepoužíváš `service_role` key. Zkontroluj že máš opravdu service_role
key, ne anon key (oba jsou v Settings → API, ale my chceme service_role).

### Insert vrací duplicate key violation pro registrations
Tabulka `registrations` má unique constraint na `(email, event_slug)`. Náš endpoint
používá `upsert` s `ignoreDuplicates: true`, takže by to nemělo padat — pokud ano,
zkontroluj, že migrace proběhla v pořádku (v Supabase Table Editoru kouknout na
constraints).

---

## Bezpečnost

- ✅ `service_role` key je **NIKDY** v `NEXT_PUBLIC_*` env varech, ne v client kódu.
- ✅ RLS zapnuté — anon key (public) nemá přímý přístup.
- ✅ `.env.local` je v `.gitignore`.
- ✅ Endpoint `/api/registrations` je validovaný — kontroluje typ payloadu.
- ⚠️ Endpoint `/api/registrations` GET je chráněný preview-auth cookie (`100dola2025`).
  Po ostrém spuštění zvážit silnější auth (NextAuth + admin role).

---

## Co dál (fáze 2)

- **Admin panel** na `/admin/leads` — read-only přehled poptávek pro Jana
- **Email šablony** přepracovat na hezčí HTML (zatím Inline-styled, ale funguje)
- **Newsletter / VIP segment** — Resend Audiences nebo Mailchimp napojený na `contacts` view
- **Webhook od Stravy** — když přijde lead, push to Slack / Discord
