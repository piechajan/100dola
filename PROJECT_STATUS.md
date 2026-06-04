# 100dola — Project Status (autoritativní seznam)

> Aktualizováno průběžně. Tvůj rychlý referenční přehled — co je hotové, co
> Claude dělá, co je nachystáno čekající a co potřebuje tvou akci.
> Pro denní TODO viz `JAN_TODO.md`.

**Stav k:** 2026-06-04 (8 + 6 tasků dokončeno paralelně ve 2 session)

---

## 🟢 Dokončeno & deployed v této session (2026-06-03 → 2026-06-04)

| Commit | Co |
|---|---|
| `1c49969` | Hero copy update + sitemap supplier products + Lighthouse CI |
| `4135451` | Hero Malaga pillar copy |
| `8084686` | Admin hub + image preconnect |
| `8915526` | Admin cron monitoring dashboard + DB log |
| `6de9174` | Instrument remaining 6 cron jobs (logCronRun) |
| `e876afa` | Honest shipping copy (žádné „do 2 dnů") |
| `f6ed953` | Admin Events editor + DB |
| `9323fe7` | Shop filtry pod toggle |
| `8824854` | Pinarello Dogma GR — add produkt |
| `375608d` | Pinarello WebP + price match + Newsletter MVP |
| `6796815` | Newsletter karta na admin hub |
| `87eb31f` | Pinarello color fix → Interstellar Grey matt |
| `4e2f26c` | Free shipping >2 500 Kč pro bulky |
| `3b3f2a0` | Pinarello stockStatus on_request + dovoz po Moravě |
| `1cee84f` | Events frontend swap (DB primary) |
| `76b1c6c` | E2E test fix (Filtry toggle) |
| `2e4fc8b` | Chat widget MVP — bublina + AI draft |
| `e41c7b8` | Featured carousel → PDP + Pinarello pozice 2 |
| `fe15eb9` | Featured card — quick-add pryč, „Detail →" hint |
| `e2505ef` | Featured ← PRODUCTS s isFeatured flag + cleanup events helpers |
| `4bf934c` | Admin order tracking — carrier dropdown + customer email |
| `f896800` | PDP related products — 4 columns + Mohlo by se ti líbit + gravel synergy |
| `e030996` | Perf: events fetch cached + analytics lazyOnload |
| `032c0d3` | Search: pg_trgm fuzzy + Empty state s recent/popular |
| `b7fceba` | Servis/bikefit booking + admin přehled |
| `930f529` | RMA / vrácení zboží flow |
| `4e05754` | Pinarello gallery (4 fotky) + 404 redesign + /oblibene alias |
| `ae1135c` | TopPromoBar — drop „Termín dodání potvrdíme" |
| `81a7a7a` | Newsletter subscribers + opt-in + send-to-all |
| `59ef55a` | „Proč nám věřit" trust section + Returns CSV export |

Plus `fakturace` repo: `17e662a` ESLint fix.

---

## 🟡 Nachystáno (scaffolding) — NESPUŠTĚNO, čeká na rozhodnutí

### B2B kluby Phase 1
- **Stav:** migrace 017 ready, schema připraveno
- **Co spustit potřebuje:** Janovy vstupy — které kluby (3-5 names), default sleva v %, pricing tier
- **Co Claude spustí po vstupech:** migrace + admin UI „Kluby" + B2B login + per-club ceník
- **Memory ref:** `project_b2b_phase0.md`

### Variants Phase 5 — admin UI pro override
- **Stav:** migrace 018 ready, hybrid override schema připraven
- **Use case:** Sportimport variants nemají size/color — admin manuálně doplní
- **Co spustit potřebuje:** „chci variants admin" (žádný další input)
- **Memory ref:** `project_variants_phase5.md`

### Pricing watchlist live
- **Stav:** kompletní pipeline + cron exists, gated `ENABLE_PRICE_WATCHLIST=false`
- **Use case:** denní monitoring Heureka konkurence + admin schválení návrhů
- **Co spustit potřebuje:** Vercel env flag flip → true

### Chat widget AI návrhy
- **Stav:** widget deployed (`2e4fc8b`), funguje bez AI degraded
- **Čeká na:** `ANTHROPIC_API_KEY` v Vercel env (Jan odložil na 2027 — placená služba)
- **Memory ref:** `project_chat_widget.md`

### Newsletter „send to all"
- **Stav:** admin UI hotové, test-send funguje, draft/preview funguje
- **Čeká na:** `newsletter_subscribers` DB tabulka + GDPR opt-in form (signup widget + checkout checkbox)
- **Cíl:** 1× měsíčně cadence (default)

### DMARC Phase 4 (`p=reject`)
- **Stav:** Phase 2 live (`pct=50`)
- **Plán:** Phase 3 (`pct=100`) → **2026-06-18**, Phase 4 → **2026-07-02**
- **Claude připomene** automaticky

---

## 🛠 Co Claude dělá teď / v plánu

> Všech 14 tasků z 2 session DONE. Další vstup od Jana.

**Session 1 (8 tasků):**
✅ #5 Cleanup dead code
✅ #2 Featured carousel admin-driven (`isFeatured` flag)
✅ #3 Order tracking number + customer mail
✅ #4 PDP related products row (4 columns + gravel synergy)
✅ #10 Lighthouse audit + fixes (events cache + analytics lazy)
✅ #7 Search UX (pg_trgm fuzzy + recent/popular suggestions)
✅ #8 Bikefit/Servis booking form + admin přehled (`/sport/servis` + `/admin/bookings`)
✅ #6 RMA / vrácení zboží flow (`/objednavka/[id]/vraceni` + `/admin/returns`)

**Session 2 (6 tasků):**
✅ #6 Pinarello PDP galerie (4 WebP fotky)
✅ #11 404 page redesign (quick links + popular categories)
✅ #12 Wishlist /oblibene alias redirect
✅ #4 Newsletter subscribers + opt-in + send-to-all batch
✅ #13 „Proč nám věřit" trust section na /o-nas
✅ #7 Returns CSV export pro Fakturoid (Excel CZ format)

---

## 🔴 Čeká na tvou akci (Claude nemůže udělat)

### P0 — akutní (do 7 dní)
- **2026-06-18** DMARC Phase 3 (Cloudflare → `_dmarc` TXT → `pct=100`) — Claude připomene
- **AEM 8 priorit** v Meta Events Manager (až rozsvítí UI panel, mělo by být teď)
- **ComGate KYC** — sales callback od 3.6., status check (odpověděli ti?)

### P1 — důležité (do 14 dní)
- **GSC URL Inspection 5 URLs** (silnicni / gravel / dresy / vyplety / wattmetry) — 30 min
- **Bing Webmaster** ověř sitemap status „Success"
- **Faktická revize 5 článků** (ceny, vzdálenosti, sběrná místa Malaga)
- **Cloudflare API token** (volitelné, pro auto-DMARC flip)

### P2 — backlog
- **ISAAC fotky 10 kol** (2400×1600+ JPEG, drop do `~/Documents/100dola sport/isaac-fotky/`)
- **Per-article fotky** pro 5 článků (~3-5 obrázků každý)
- **Strava OAuth re-auth** (lokální refresh token expired) — Claude pak může auto-pullnout OMC events
- **5 stub článků** — dodat 3-7 bullet pointů + fotky → Claude napíše SEO článek
- **Newsletter cadence** — rozhodnout 1×/měs vs 1×/Q (default doporučuji měsíc)
- **B2B kluby** — vstupy pro Phase 1 (viz Nachystáno výše)
- **Anthropic API key** (chat widget AI) — odloženo na 2027

---

## 🤖 Self-reminders (Claude udělá automaticky)

| Datum / čas | Co |
|---|---|
| 2026-06-18 | Připomene DMARC Phase 3 + ověří pass rate ≥ 99 % |
| 2026-07-02 | Připomene DMARC Phase 4 (`p=reject`) |
| Daily 04:00 UTC | DMARC health check (alert pokud anomalie) |
| Daily 09:00 UTC | Stock notify cron |
| Daily 03:00 UTC | Supplier feed import |
| Daily 06:00 UTC | Price watchlist (gated) + E2E smoke test |
| Po 04:00 UTC | Lighthouse weekly |
| 2026-06-XX | Připomenu zálohu na LaCie SSD (≥5 commitů / >7 dní) |

---

## 📁 Memory pointers (kontext pro Claude)

- `project_chat_widget.md` — chat bubble + AI draft state
- `project_b2b_phase0.md` — B2B kluby scaffolding
- `project_variants_phase5.md` — variants override
- `project_dmarc.md` — DMARC roadmap
- `project_meta_setup.md` — Pixel + CAPI state
- `project_strava_integration.md` — Strava OAuth state
- `project_comgate.md` — ComGate signup status
- `feedback_shipping_copy.md` — honest shipping copy rule
- `feedback_traffic_retention.md` — žádné iframe na cizí weby
