# Janův TODO — co Claude nemůže udělat sám

> Live seznam — aktualizováno po každé session. Claude průběžně doplňuje sem.
> Stav k **2026-08-14**.

---

## ⚖️ Právní / cross-web (2026-08-26)

- **Záloha 50 % — právní review + sync do rip-shopu (rozhodnutí: b).** Klauzule o
  50% záloze u kol / zboží nad 50 000 Kč je v obchodních podmínkách 100dola
  (sekce 3, commit 4ec2fc4), napsaná právně obezřetně (respektuje §1829 odstoupení
  + §1837 zboží na míru), ale NEPROŠLA právníkem. **Postup:** 1) nechat advokáta
  potvrdit znění u 100dola (citlivé: kdy zálohu vrátit vs. nechat u spotřebitele),
  2) TEPRVE PAK přenést finální znění i do obchodních podmínek rip-shopu (sdílená
  FUTUNATU legal vrstva). Není urgentní, text je zatím použitelný.

---

## 🆕 Session 2026-08-13/14 — deployed + co čeká na Jana

**✅ Deployed (živé):**
- **4 nové produkty:** vesta Scott W's Pro WB (−20 %, poslední kus M), tretry
  Scott MTB Team BOA (−30 %, poslední kus 46) — režim „1 kus / ostatní na dotaz",
  po prodeji server odmítne další objednávku; kola Scott Scale RC Team + Scale
  RC World Cup (MSRP — sleva k potvrzení).
- **PDP trust:** tabulka velikostí (modal), Kompletní výbava + Geometrie (Scale
  RC ze scott-sports.com), reassurance strip u košíku, kompaktní Google recenze.
- **Recenze:** naseedováno všech **13 reálných Google recenzí** (5,0/5) — homepage
  carousel + PDP blok.
- **Kalkulačka dojezdu elektrokola:** `/kalkulacka-dojezdu-elektrokola` + auto na
  PDP každého e-kola (kategorie `elektro`) + footer odkaz.
- **Valašsko local SEO:** `/prodejna/valasske-mezirici`, `/vsetin`,
  `/roznov-pod-radhostem` (model výdej + doručení jako Olomouc).
- **Článek:** Karbon SCOTT HMF vs HMX vs HMX-SL (prokliky na modely).
- **Fixy:** nové produkty už nejsou 6 h ve 404 (cache refaktor get-products);
  Heureka OCM CSP odblokován (`heureka.group`); 404 kontaktní e-mail →
  info@100dola.com; otevírací doba sjednocena; test konfigurátor +velikost S
  (Addict Gravel 20); Scott test — proběhlé termíny zašedlé/neklikatelné.
- **Opravená tvrzení (honesty):** osobní dovoz/předání NENÍ zdarma (jen odběr na
  prodejně ve Šternberku) — opraveno napříč webem; odstraněn nepravdivý
  „showroom Valašské Meziříčí" (ve Valmezu fyzický showroom NENÍ — Jan potvrdil).
- **CEP (Medi-Expert) supplier — LIVE:** nový adaptér `cep` (veřejný Zbozi.cz
  feed), naimportováno 166 produktů, zveřejněno 145 (21 bez ceny skryto).
  Nová top-kategorie **Běh** (obuv, kompresní ponožky/podkolenky/návleky,
  oblečení, doplňky). Cena = cepsports.cz (MOC), skladem u nás. Fotky opraveny
  (medi-expert.cz do image remotePatterns). Viz memory [[project-cep-feed]].
- **`ENABLE_SUPPLIER_IMPORTS=true`** nastaveno ve Vercelu (bylo vypnuté!) →
  denní import cron 03:00 tahá Sportimport + CEP automaticky.
- **Scott Addict RC 10 2026:** obě barvy (Prism Black + Gelato Blue/Pink) +
  všechny velikosti XXS–XXL + výbava tabulka.
- **Bonus fix:** `/api/admin/revalidate?tags=` (bust shop-products cache hned).

**⏳ Čeká na Jana (needs you):**
- **Sport port B2B feed** → poslat mail `~/Desktop/mail-sport-port-feed.md`
  (žádost o plný produktový feed s cenou/atributy + headless/tokenovou URL).
  Stávající `FeedSportmallAvailability.xml` je JEN skladový (bez ceny/značky/
  kategorie) → nejde z něj postavit katalog, a headless dává 401. Bez produktového
  feedu nejde auto-launch ani stock-sync. Soupis: `~/Desktop/sportmall-feed-soupis-2026-08-12.md`.
- **ComGate KYC** → spustit kartu/Apple/Google Pay (pořád jen QR/převod/hotovost).
- **Heureka Ověřeno** → registrace + API klíč (CSP odblokován, SDK teď načítá).
- **Malaga pricing konflikt** (Basic 559 € vs 849 €) — pořád nerozhodnuto (viz níže).
- **Sufan tyčinka (Flapjack Třešeň s čokoládou)** → BLOKOVÁNO: sufan velkoobchod
  je za loginem. Pošli **login do sufan velkoobchodu** (URL + jméno/heslo) NEBO
  rovnou **cenu 1 ks + cenu balení 16 ks** (a jestli −30 % z nich nebo z MOC) +
  krátký popis/složení. Pak udělám 1 stránku s přepínačem balení (1 ks / 16 ks,
  16-pack doprava zdarma). Připravím `packOptions` + free-shipping flag.
- **CEP cron duration watch** → zkontroluj první ostrý běh import cronu (zítra
  03:00): jestli import celého katalogu (Sportimport + CEP ~966 produktů) doběhne
  do 300 s (Vercel function limit). Můj manuální curl spadl na Cloudflare 100 s
  (jen curl, ne Vercel cron). Když by daily cron timeoutoval → rozseknu import
  po brandech (odolnější).
- Volitelně: doplnit `ebikeBatteryWh` ke konkrétním e-kolům (předvyplní kalkulačku);
  slevy u Scale RC Team/World Cup (teď MSRP).

---

## 🛒 Google Nákupy / Merchant Center — karta „Nákupy" (GSC opportunity)

- GSC e-mail (15.–16. 6. 2026): **38 aktivních produktů se nezobrazuje na kartě
  Nákupy** (Google Shopping free listings). Náš custom Next.js → nejde přes
  Shopify auto-flow, **musíme přes Google Merchant Center ručně**.
- **Předpoklad (Claude řeší teď):** GSC „Záznamy obchodníka" musí mít **0 chyb**
  ve strukturovaných datech (chybí `price`/`offers`/`validFrom`) — bez toho
  Shopping listing nenaskočí. Oprava Product JSON-LD probíhá.
- **Až doladíme e-shop**, Claude vytvoří feed API `/api/google-shopping/feed.xml`
  a připraví setup; **Jan ručně**: založit Merchant Center (futunatu@gmail.com),
  Business = FUTUNATU s.r.o., verify přes GSC (instant), přidat feed + shipping
  + DPH + returns, submit k review. Plný plán = memory `project_google_merchant_center.md`.
- Post-MVP — spustit až bude e-shop „ready", ne teď.

## 🔴 Připomínky z bezpečnostního auditu (2026-07-23)

- **⛔ ODBLOKOVAT karetní platby až bude ComGate live.** `card`/`apple-pay`/
  `google-pay` jsou zakomentované v `src/lib/schemas.ts` (`PAYMENT_METHODS`) a
  `src/lib/orders.ts` (`PAYMENT_LABELS`) — do spuštění ComGate by objednávka
  prošla jako „zaplaceno kartou" bez reálné platby. Při go-live odkomentovat
  obojí. (viz [[project_comgate]])
- **✅ HOTOVO (2026-07-23): Legacy statické heslo `100dola2025` smazáno.**
  `/api/auth` + `/login` odstraněny, legacy fallback v `admin-auth.ts` pryč,
  všech 28 admin routů/stránek přepnuto na `getAdminContext()` (session).
  Magic-link opraven na prefetch-safe dvoukrok. Admin jen přes `/admin/login`.
  Accountant gate (`/login-ucetni`) je nezávislý (HMAC + `ACCOUNTANT_SECRET`),
  nedotčen.

## 🟡 Rozhodnutí čekající na Jana

- **Malaga pricing konflikt (Basic 849€ vs 559€)** — `data/malaga.ts` má potvrzený
  (30.4. tebou) **Basic od 559 €**, ale `MalagaServices.tsx` karta + meta na
  `/malaga/balicky` ukazují **849 €** (stará hardcoded hodnota). Zákazník vidí
  dvě různé ceny Basicu. **Rozhodni:** srovnat displej na 559 € (doporučeno,
  jen oprava zobrazení dle tvého potvrzeného ceníku), nebo je 849 € správně a
  opravit data? Řekni a Claude srovná. Místa: `src/components/malaga/MalagaServices.tsx:36`,
  `src/app/malaga/balicky/page.tsx:11-13`.

---

## 🟢 In flight (Claude pracuje teď)

- **Supabase Storage → Vercel Blob migrace** (důvod: Supabase free 1 GB
  překročeno na 2.5 GB, grace do 7. 7. 2026):
  - Vercel Blob store `futunatu-shared-assets` vytvořen + napojen na 100dola
  - Server-side `/api/admin/migrate-blob` endpoint deployed
  - Curl loop běží v lokálním pozadí (`/tmp/migrate-loop.sh`), ETA ~75 min
  - Po dokončení: 1× POST `/api/admin/migrate-blob/apply-mapping` (Claude
    udělá), pak smoke test, pak smazat Supabase Storage bucket
  - Token `ADMIN_MIGRATE_SECRET` v `/tmp/admin-migrate-secret.txt`
    (jen lokál, nesdílet)

## 🆕 Vercel Pro audit (2026-06-17)

Co aktivně využíváme: hosting, Image Optim, **Blob (dnes)**, Speed Insights,
9/40 crons, Functions 300s.

Nevyužité s potenciálem:
- **Edge Config** (free 1M reads/měs) — flags bez DB hit → −1 query per
  request pro některé features (newsletter A/B, popup show/hide). Quick win.
- Sandboxes, Queues, AI Gateway — zatím ne, ale dostupné.

Cron cleanup (P3 drobnost):
- `isaac-test-daily` běží 2× denně, ale ISAAC event 31.5. dávno za námi —
  cron je no-op. Free invocations, nech to do refactoru.

## 🆕 Dnes deployed (2026-06-17)

- **Reviews carousel na homepage** — 3 reálné Google reviews (5.0/5 z 12)
  + Schema.org AggregateRating (Google rich snippet ★ 5.0 v search results)
- **Scott comparison tool** — `/clanky/scott-2027/srovnani?a=&b=`
- **Spark RC 2026 vs 2027 článek** — `/clanky/scott-spark-rc-2026-vs-2027`
- **Centrální CLAUDE.md** updaty:
  - Resource allocation rules (preferuj placený Vercel před free Supabase)
  - Cross-website consistency (změny firemních údajů napříč rip-shop, 100dola, …)

---

## 🔴 P0 — Akutní (do 7 dní)

### 1. DMARC Phase 3 (`pct=100`) — ✅ HOTOVO 2026-06-27
- Flipnuto přes Cloudflare API (Jan vytvořil token → `web/.env.local`).
- Ověřeno `dig` na hattie NS i 1.1.1.1: `p=quarantine; pct=100` live.
- Skript: `node scripts/cloudflare/dmarc-set.mjs --pct 100`.
- **Phase 4 (`p=reject`) — ✅ HOTOVO 2026-07-07:** cloud routine z 1.7. doběhla,
  ale flip neprovedla (chyba běhu v cloudu) → Claude dokončil ručně stejným
  skriptem. `p=reject; pct=100; sp=reject; np=reject` live (ověřeno hattie NS + 8.8.8.8).
  DMARC roadmapa KOMPLETNÍ. Gate ověřen: SPF + DKIM (cf2024-1 + resend) OK.
- **CF token retired:** odstraněn z `web/.env.local`; **Jan smaže v Cloudflare
  dashboardu** (API self-delete nejde). Token id `ae0c8b064fc6a5717e738bd43aec0f97`.

### 1.5. rip-shop production deploy fail (jiný projekt)
- **Co:** rip-shop má 4 failed deploys za poslední 2 dny
- **Příčina:** `DATABASE_URL` env var chybí ve Vercel produkce → `src/db/index.ts`
  hází module-level throw při `next build` → fail v "Collecting page data"
- **Fix (2 min):** Vercel → rip-shop → Settings → Environment Variables →
  Add `DATABASE_URL` = (hodnota z lokálu `~/rip-shop/.env.local`)
- **Lepší fix:** otevři novou Claude session v `~/rip-shop`, popros o
  „lazy DB init in src/db/index.ts" (throw až při použití, ne při importu)
- **Status:** poslední úspěšný deploy stále jede, není urgent

### 2. AEM 8 priorit v Meta — ⏸ ČEKÁ NA META (gated, recheck ~2026-07-10)
- **Stav 2026-06-28:** Claude ověřil naživo v Events Manageru → AEM panel **STÁLE
  Metou server-side zamčený** (Nastavení tab nemá „Měření agregovaných událostí",
  setup checklist 50 %, AEM URL = HTTP error). Nelze udělat automatizovaně ani ručně.
- **Rozhodnutí (Jan 2026-06-28):** počkat na organic unlock, NEpoužívat ESL (rozbil
  by tracking duplicitními eventy). Dopad nízký (jen iOS ATT-opt-out ~30-40 %).
- **Recheck 2026-07-07: STÁLE GATED** (4. potvrzení, beze změny — setup pořád 50 %,
  žádná AEM sekce). Organic unlock nepřišel za 5+ týdnů. Doporučení: nechat být
  (dopad marginální, jen iOS ATT-opt-out) nebo Meta Support ticket. NEspouštět ESL.
  Detail: memory `project_meta_setup.md`.
- Plánované priority (až se odemkne): 1.Purchase 2.InitiateCheckout 3.AddToCart
  4.CompleteRegistration 5.Lead 6.ViewContent 7.Subscribe 8.Contact

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

### 5. Google Search Console — Request Indexing  ✅ HOTOVO 2026-06-27
- **Status:** Claude submitnul všech 10 URL přes GSC URL Inspection (Playwright,
  účet futunatu@gmail.com už přihlášený). Všechny v prioritní frontě procházení.
- **Pozn.:** GSC u některých URL hlásil „Objeveno – momentálně neindexováno" a
  u části „nezjištěny odkazující sitemapy" → ověř v GSC → Soubory Sitemap, že je
  `sitemap.xml` ve stavu „Success" (viz #6); IndexNow ping pro stejných 10 URL
  taky odeslán (Bing/Yandex).
- **Submitnuté URL (hotovo):**
  - `/shop/kola/silnicni` · `/shop/kola/gravel` · `/shop/obleceni/obleceni-dresy`
  - `/shop/doplnky/vyplety` · `/shop/doplnky/wattmetry`
  - `/clanky/doprava-kola-do-malagy` · `/clanky/vlastni-kolo-malaga-vs-pujcovna`
  - `/clanky/bikefit-sternberk` · `/clanky/isaac-boson-vitron-meson`
  - `/clanky/strava-segmenty-sternberk-olomoucky-kraj`

### 6. Bing Webmaster Tools — verify sitemap status  ✅ HOTOVO 2026-06-28
- Ověřeno Claudem (Playwright, Google login futunatu@gmail.com prošel bez passkey).
- `https://www.100dola.com/sitemap.xml` → **Status: Success**, 0 errors / 0 warnings,
  **175 URLs discovered**, last crawl **2026-06-26** (čerstvé). Resubmit netřeba.

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

## ⭐ Recenze po nákupu (2026-07-30)

- ✅ **Review-request mail** hotový + live: spouští se +7 dní po označení „Odesláno", produkty z objednávky → naše recenze (`/reviews/submit`, verified buyer) + Google CTA. Naposílá se u KAŽDÉ expedované objednávky.
- ✅ **Google CTA aktivní** — `GOOGLE_REVIEW_URL` = deep-link na profil (CID 17820906318049005873).
- ⏳ **Heureka „Ověřeno zákazníky"** — čeká na TEBE: registrace e-shopu na sluzby.heureka.cz (FUTUNATU, IČO 07376766) → zapnout Ověřeno → poslat mi **API klíč** + **metodu ověření domény**. Pak dodělám napojení (env `HEUREKA_API_KEY`). Zboží.cz odloženo (email fatigue).

## 🚴 Czech Tour 2026 / komunitní eventy (2026-07-28)

- **Dodej trasy na Strava klub OMC** pro **Dlouhé stráně** (so 15.8., social ride ze Šternberku) a **Pustevny** (ne 16.8., OMC) — obojí zároveň SCOTT test. Až je nahraješ, týdenní cron je zaznamená; JÁ pak doplním GPX + výškový profil (potřebuje prohlížeč — Mapy.cz Export→GPX).
  - ⚠️ Dlouhé stráně na Stravě pojmenuj **„Dlouhé stráně, Czech Cycling Tour"** (kvůli automatickému dedupu, ať nevznikne duplicitní karta).
- **Dlouhé stráně** má zatím placeholder foto (`/media/road-event.jpg`) a km/převýšení „—" → doplním po dodání trasy; pošli i vlastní foto, jinak najdu vhodnou.
- **Týdenní OMC sync cron** rozšířen: nově zakládá on-site karty pro budoucí Strava eventy (ne jen archivuje). Otevře PR `omc-weekly-sync-<datum>` k review — NEMERGUJE sám. GPX/foto = ruční checklist v PR.

## 🔵 Připraveno scaffolding (NESPUŠTĚNO — čekají rozhodnutí)

- **Admin Events editor** — events jsou v data/events.ts (static). Až řekneš „chci CRUD" → migrace + admin UI
- **B2B kluby Phase 1** (migrace 017 ready)
- **Variants Phase 5 admin UI** (migrace 018 ready, override mapping)
- **Pricing watchlist live** (env flag ENABLE_PRICE_WATCHLIST=false → off)
