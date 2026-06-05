# Janův TODO — co Claude nemůže udělat sám

> Live seznam — aktualizováno po každé session. Claude průběžně doplňuje sem.
> Stav k **2026-06-03**.

---

## 🔴 P0 — Akutní (do 7 dní)

### 1. DMARC Phase 3 (`pct=100`)
- **Kdy:** 2026-06-17 (14 dní po Phase 2)
- **Kde:** https://dash.cloudflare.com/?to=/:account/100dola.com/dns
- **Co:** Edit TXT `_dmarc` → změň `pct=50` na `pct=100` → Save
- **Self-reminder:** Claude ti připomene 2026-06-17, ověří pass rate ≥ 99 %

### 2. AEM 8 priorit v Meta
- **Kdy:** po 5.-7. 6. 2026 (čeká až Meta UI rozsvítí AEM panel)
- **Kde:** https://business.facebook.com/events_manager2/list/pixel/1867612187213152
- **Co:** Aggregated Event Measurement → drag priority:
  1. Purchase  2. InitiateCheckout  3. AddToCart  4. CompleteRegistration
  5. Lead  6. ViewContent  7. Subscribe  8. Contact
- **Až bude AEM dostupné:** napiš „AEM done"

### 3. ComGate KYC + API key
- **Status:** mail odeslán 2026-06-03 (FUTUNATU s.r.o., follow-up)
- **Co dál:** počkat na odpověď ComGate sales (1-3 pracovní dny)
- **Až dorazí:** pošli Claude ceník + KYC checklist → poradí
- **Po API key:** Claude implementuje checkout flow do 1-2 dnů

### 4. Vyzkoušet `/admin/login`
- **Link:** https://www.100dola.com/admin/login
- **Postup:** zadej `piecha.jan@gmail.com` → klikni odkaz v mailu (15 min)
- **Pak otevři:** https://www.100dola.com/admin/audit (vidíš log akcí)
- **Status:** **HOTOVO 2026-06-03** ✅

---

## 🟡 P1 — Důležité (do 14 dní)

### 5. Google Search Console — Request Indexing
- **Kde:** https://search.google.com/search-console
- **Co:** URL Inspection (lupa nahoře) → vlož URL → Request Indexing
- **5 URL k submit:**
  - `https://www.100dola.com/shop/kola/silnicni`
  - `https://www.100dola.com/shop/kola/gravel`
  - `https://www.100dola.com/shop/obleceni/obleceni-dresy`
  - `https://www.100dola.com/shop/doplnky/vyplety`
  - `https://www.100dola.com/shop/doplnky/wattmetry`
- **Bonus**: nové 5 článků
  - `/clanky/doprava-kola-do-malagy`
  - `/clanky/vlastni-kolo-malaga-vs-pujcovna`
  - `/clanky/bikefit-sternberk`
  - `/clanky/isaac-boson-vitron-meson`
  - `/clanky/strava-segmenty-sternberk-olomoucky-kraj`

### 6. Bing Webmaster Tools — verify sitemap status
- **Kde:** https://www.bing.com/webmasters
- **Login:** Google+passkey `futunatu@gmail.com`
- **Co:** Property `100dola.com` → Sitemaps → ověř `/sitemap.xml` status „Success"
- **Pokud starší než 14 dní:** Resubmit

### 7. Přečíst 5 článků a říct co je faktická chyba
- **Linky výše** (#5 bonus)
- **Co ověřit konkrétně v článku #1 Doprava Malaga:**
  - Ceny `8 900 Kč` / `14 900 Kč` / `1 500 Kč/měsíc skladu`
  - „10 min od letiště MAGA"
  - „5-8 dní podle bloku odjezdu"
  - 4 sběrná místa (Šternberk / Olomouc / Valašské Meziříčí / Praha přes partnera)
- **Jak:** ozvi se s úpravami → Claude updatuje

### 8. Cloudflare API token (volitelné)
- **Pro co:** automatický DMARC Phase 3/4 flip bez tvého klikání
- **Kde:** https://dash.cloudflare.com/profile/api-tokens → Create Token
- **Šablona:** „Edit zone DNS", scope `100dola.com`
- **Co dál:** ulož do Vercel env `CLOUDFLARE_API_TOKEN`, řekni Claude

---

## 🟢 P2 — Backlog (až bude čas)

### 9. ISAAC fotky 10 kol
- **Co:** 1-3 fotky per model (Meson Jade Green / Mineral White / Ruby Red, Vitron Onyx Black / Navy Blue, Element Granite Grey, Boson Mineral White / Sonic Silver, Torus Xplore Moss Green / Slade Blue / Blast Bronze, Kaon Saphire Blue)
- **Kvalita:** 2400×1600+ JPEG, ostré pozadí (bílá zeď / studio / Šternberk)
- **Drop:** `~/Documents/100dola sport/isaac-fotky/`
- **Claude udělá:** optimalizace + upload do `/public/media/isaac/<slug>/` + napojení na PDP gallery

### 10. Per-article fotky pro 5 nových článků
- **Co potřebuje fotky** (každý ~3-5 obrázků):
  - `doprava-kola-do-malagy` (auto, sklad Malaga, balení, dovoz zákazníkovi)
  - `vlastni-kolo-malaga-vs-pujcovna` (vlastní kolo v Andalusii)
  - `bikefit-sternberk` (proces, měření, prodejna)
  - `isaac-boson-vitron-meson` (kola z testovacího víkendu)
  - `strava-segmenty-sternberk-olomoucky-kraj` (skupina, výhledy z trasy)
- **Drop:** `~/Documents/100dola sport/clanky/<slug>/`
- **Claude:** lokalizuje + optimalizuje + dosadí do článku

### 11. Strava OAuth re-authorize
- **Status:** lokální refresh token v `.env.local` expired
- **Důvod:** Claude nemůže fetchnout past activities (jen prod endpoint vrací upcoming events)
- **Kde:** https://www.strava.com/settings/apps
- **Postup memory:** `project_strava_integration.md` má návod
- **Až bude OK:** Claude může auto-doplňovat OMC group events do `/data/events.ts`

### 12. 5 stub článků (content seed)
- **Memory ref:** `project_pending_actions.md`
- **Témata:** voskování řetězů, keramická ložiska, PPF folie, cestování s kolem do Malagy (mám draft už hotový!), social rides
- **Co dodat:** 3-7 bullet points + tvoje fotky → Claude napíše SEO článek

### 13. Newsletter — definovat cadence
- **Co:** rozhodnout zda 1× měsíčně / 1× kvartál / event-driven
- **Komu:** seznam DOI confirmed subscribers (DB tabulka existuje)
- **Claude udělá:** admin UI pro plánování + Resend send + tracking open/click

### 14. ComGate spuštění (až bude API key)
- Po dodání KYC + získání merchant credentials
- Vercel env vars: `COMGATE_MERCHANT`, `COMGATE_API_KEY`, `COMGATE_SECRET`
- Claude pak napojí card/Apple Pay/Google Pay checkout

### 15. DMARC auto-ingest — Cloudflare Email Worker
- **Stav 2026-06-05:** Alerts muted přes `DMARC_ALERTS_MUTED=true` v Vercel env. Ingest pipeline je manuální (admin upload), 0 reports v DB lifetime → cron alerty byly false-positive výpadek.
- **Co setup vyžaduje:**
  - Cloudflare Workers tarif (free tier OK pro tento use case)
  - Email Worker bind na `info@100dola.com` (kam chodí DMARC reports z `rua=`)
  - Worker code: parse `.zip` / `.gz` / `.xml` attachment z mailu → POST na `/api/admin/dmarc/upload` s service auth tokenem
  - Service auth token vygenerovat: nový env var `DMARC_INGEST_TOKEN` v Vercelu, validovat v `/api/admin/dmarc/upload` jako alternativu k cookie auth
- **Claude udělá až řekneš „pojď na DMARC auto-ingest":** workflow + Worker template + test setup. Alternativa: Resend Inbound API (beta, jednodušší ale méně kontrola).
- **Pak:** odstranit `DMARC_ALERTS_MUTED` env → alerts znova aktivní s reálnými daty.

### 16. Manuální DMARC reports upload (rychlejší interim)
- Pokud chceš mít DMARC monitoring **dřív než auto-ingest**, posbírej posledních 3-5 mailů od:
  - `noreply-dmarc-support@google.com`
  - `dmarcreporting@microsoft.com`
  - `dmarc-noreply@*` (mailchimp/sendgrid forwardery)
- Stáhni `.zip`/`.gz`/`.xml` přílohu
- Uploadni přes `https://www.100dola.com/admin/dmarc/upload` (cookie `preview_auth=100dola2025`)
- Pak `/admin/dmarc` ukáže reálná data, můžeš `DMARC_ALERTS_MUTED` zase odebrat

---

## ⏰ Self-reminders Claude (automaticky)

| Datum | Co Claude udělá |
|---|---|
| 2026-06-17 | Připomene DMARC Phase 3, ověří pass rate (jakmile bude ingest setup) |
| 2026-07-01 | Připomene DMARC Phase 4 (`p=reject`) |
| Daily 04:00 | DMARC health check (alert mail pokud anomalie) |
| Daily 09:00 | Stock notify cron (mail customers o naskladnění) |
| Daily 03:00 | Supplier feed import (Sportimport) |
| Daily 06:00 | Price watchlist (NESPUŠTĚNO — feature flag off) |
| Daily 06:00 UTC | E2E smoke test prod (Playwright CI) |

---

## 📋 Hotovo dnes 2026-06-03

- ✅ DMARC Phase 2 flipped
- ✅ Admin magic-link auth + audit log + `/admin/audit`
- ✅ 5 SEO článků + per-article hero diversification
- ✅ E2E Playwright CI (denně 06:00 UTC + push)
- ✅ Supabase Storage migration (758 supplier fotek, full gallery)
- ✅ Next/Image AVIF/WebP optimizer pro Storage URLs
- ✅ PDP variant selector + color filter + sort dropdown
- ✅ Mobile sticky CTA + free shipping bar + top promo bar
- ✅ FFWD logo fix (oficiální z ffwdwheels.cz)
- ✅ Restock notify pipeline (signup + cron 09:00 + email + `/admin/stock-notifications`)
- ✅ Quick view modal na PLP karty (hover 👁 ikona)
- ✅ PDP color visualization (swatch + label)
- ✅ Search relevance (color + properties match)
- ✅ Per-page SEO (BreadcrumbList, ItemList, extended Product schema)
- ✅ Reviews full pipeline (submit + moderation + display)
- ✅ Wishlist + Recently viewed
- ✅ Recommendations hybrid (rule + behavioral pair_counts)
- ✅ DMARC parser + dashboard + daily auto-check
- ✅ Doplněn event Dušná — Soláň

**Commits dnes:** 35+ (od `9b2f314` brand chips po `0f79567` article hero)

## 🔵 Připraveno scaffolding (NESPUŠTĚNO — čekají rozhodnutí)

- **Admin Events editor** — events jsou v data/events.ts (static). Až řekneš „chci CRUD" → migrace + admin UI
- **B2B kluby Phase 1** (migrace 017 ready)
- **Variants Phase 5 admin UI** (migrace 018 ready, override mapping)
- **Pricing watchlist live** (env flag ENABLE_PRICE_WATCHLIST=false → off)
