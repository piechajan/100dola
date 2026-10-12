# Seznam SEM (konverzní měření Sklik + Seznam Nákupy) — návrh implementace

Větev `feat/seznam-sem` (nic nepushnuto). Stav 12. 10. 2026. Související: provozovna 100dola sport (ID 293640), feed 36484, podmínky měření konverzí odsouhlaseny 12. 10. (viz memory `project_sklik_zbozi`).

## 1. Co Seznam dnes vyžaduje (ze Sklik nápovědy)
- Pro nové nasazení **jen SEM (Seznam Event Measurement)** — jeden skript `https://l.seznam.cz/sul.js?id=<SEM_ID>`; starý `rc.js` konverzní kód se pro nové nasazení nepoužívá.
- Události: `SEM('track', 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' …)`. Měna **jen CZK**, `value` **bez DPH**, `unit_price`/`delivery_price` s DPH.
- **Purchase:** povinné `order_id`, `currency`, `value`; doporučené `value_tax`, `content_type`, `contents[]`, `review_email`, `delivery_type`, `delivery_price`.
- **Consent:** automaticky z IAB TCF; my TCF nemáme → ručně `SEM('updateConsent', {consent_mode:{ad_storage, ad_user_data, ad_personalization, analytics_storage, functionality_storage}})` **před** `PageView`. Cookie `sid`/`udid` vznikají až po `ad_storage: granted`.
- `SEM('updateUserData', {em, ph, fn, ln})` — hashuje se automaticky v prohlížeči; **výjimka `review_email` (nehashovat)**.
- **S2S (server-to-server)** podporován: `POST https://sem.seznam.cz/rtgconv`; frontend `sul.js` je povinný i tak (cookies `sid`,`udid`), vlastní S2S **SEM ID** (u Zboží provozovny samostatné), PII hashovat SHA-256 sami.
- CSP: `script-src l.seznam.cz; connect-src https://*.seznam.cz`.
- Smluvní podmínky (odsouhlaseny): osobní údaje (e-mail, objednávka) se předávají **jen s informovaným souhlasem**, jinak anonymizovaně; `review_email` smíme předat jen zákazníkovi, který **nevyjádřil nesouhlas (opt-out)** s dotazníkem spokojenosti; nesmíme zkreslovat data ani ovlivňovat hodnocení.

## 2. Co na webu už je a navážeme
- Souhlas: `src/lib/cookies-consent.ts` (`readConsent`, `subscribeConsent`; kategorie `analytics`, `marketing`) — vzor `components/analytics/MetaPixel.tsx` (načte se jen po marketing souhlasu).
- Události objednávky: `components/shop/CheckoutForm.tsx` (Meta Purchase + GA purchase před `router.push`), server `app/api/orders/route.ts` (Meta CAPI, e-maily, `conversion_attribution`).
- Layout: `app/layout.tsx` (MetaPixel, GoogleAnalytics, Clarity).

## 3. Architektura
### 3.1 `components/analytics/SeznamSem.tsx` (client, v layoutu vedle MetaPixelu)
- Bez `NEXT_PUBLIC_SEZNAM_SEM_ID` = no-op.
- **Souhlas (doporučení fáze 1): sul.js se načte JEN po marketing souhlasu**, stejně jako Meta Pixel (konzistentní právní postoj webu). Po načtení `updateConsent` (marketing → `ad_storage/ad_user_data/ad_personalization = granted`; analytics → `analytics_storage`), pak `PageView`. Změna souhlasu za běhu přes `subscribeConsent`.
- Alternativa (fáze 2, rozhodnutí Jana + právník): načíst vždy s `denied` → Seznam zpracuje anonymizovaně a doměří část konverzí; výhoda přesnější měření, riziko výklad ePrivacy/GDPR.
- SPA: `PageView` při každé změně route (`usePathname`).
- Helper `trackSemEvent(name, data)` (jako `trackMetaEvent`), no-op bez načteného SEM.

### 3.2 Události (mapování na náš katalog)
| Místo | Událost | Zdroj dat |
|---|---|---|
| PDP `shop/[...slug]` | `ViewContent` product | cena s DPH, `value` = bez DPH (÷1,21 dle `vatRate`), `contents[{id: slug, content_name, content_category (z CATEGORY_INDEX), unit_price}]` |
| kategorie | `ViewContent` product_group | kategorie |
| přidání do košíku | `AddToCart` | cart-store |
| /objednavka (pokladna) | `InitiateCheckout` | cart-store |
| **/objednavka/[id]** (děkovná) | **`Purchase`** | objednávka: `order_id`, `value` bez DPH, `value_tax`, `contents`, `delivery_type`, `delivery_price`, `review_email` |
| kontakt / poptávky | `Lead` (volitelně) | formuláře |

**Purchase na děkovné stránce, ne v CheckoutForm** (Seznam to doporučuje; po `router.push` by skript nemusel stihnout odeslat). Ochrana proti dvojímu započtení: příznak `sessionStorage` + odpálit jen po čerstvé objednávce (parametr z CheckoutFormu), Sklik má navíc 3min ochranu. `event_id` = číslo objednávky (dedup s případným S2S).

### 3.3 `review_email` (hodnocení zákazníků — Seznam Nákupy)
Odesílat jen s **opt-outem**: do pokladny přidat nepovinné zaškrtávátko „Nesouhlasím se zasláním dotazníku spokojenosti (Seznam Nákupy)“ (výchozí odškrtnuto = zasílat), uložit do objednávky (`orders` sloupec = **DB migrace → Gate**), `review_email` předat jen když nesouhlas nebyl vyjádřen. Texty v ochraně osobních údajů a podmínkách + česky i anglicky (pravidlo CS+EN).

### 3.4 S2S (fáze 2, volitelné)
Odolnost proti blokování skriptů a opuštění stránky: z `api/orders/route.ts` po vytvoření objednávky `POST sem.seznam.cz/rtgconv` (`Purchase`, `event_id`=id objednávky, `sem_id` S2S provozovny, `sznaiid`, SHA-256 hash PII, `consent_mode` z klienta). Vyžaduje předat `sid`/`udid`/`sznaiid` z prohlížeče v payloadu objednávky (jen se souhlasem; `sznaiid` lze ukládat vždy). Rate-limit a timeout, selhání nesmí shodit objednávku (vzor Meta CAPI / `logConversionAttribution`).

### 3.5 Prostředí (Vercel env — **Gate**, nic nezměněno)
- `NEXT_PUBLIC_SEZNAM_SEM_ID` (veřejné; SEM ID ze Skliku: Nastavení účtu → SEM ID → Zobrazit SEM kód).
- `SEZNAM_SEM_S2S_ID` (jen server, fáze 2).
- Tajný klíč provozovny (Centrum prodejce → Měření konverzí) **do repa ani chatu nedávat**; v SEM není pro FE potřeba, uložit jen kdyby byl nutný pro Zboží API (ověřit při sandbox testu) → `ZBOZI_SECRET_KEY` server-only.
- CSP v `next.config` / hlavičkách: povolit `l.seznam.cz` a `*.seznam.cz` (ověřit, zda CSP vůbec používáme).

## 4. Nastavení na straně Seznamu (Jan / Claude přes Chrome)
1. Sklik → Správa měření: vytvořit **konverzi „Nákup“** napojenou na SEM událost `Purchase` (+ volitelně `Lead`, `AddToCart` jako mikrokonverze) a z ní získat/ověřit SEM ID.
2. Centrum prodejce → Měření konverzí: **„Zapnout měření konverzí“ až po nasazení** a sandbox ověření.
3. Po ověření provozovny (do 5 prac. dnů): doprava GLS (viz memory).

## 5. Testování (před zapnutím)
- Sandbox: `testovani-sandbox` ve Sklik nápovědě (testovací ID a odesílání bez ukládání); v kódu sandbox příznak **po testu odstranit**, jinak konverze nebudou zpracovány.
- Consent v DevTools (Sklik návod `consent-a-jak-kontrolovat-souhlas-v-devtools`): bez souhlasu žádné cookies `sid`/`udid`; po souhlasu ano.
- E2E (Playwright): bez souhlasu se `sul.js` nenačte; po souhlasu načte; na děkovné stránce přesně 1× `Purchase` (reload ≠ druhý hit).
- Lighthouse/CWV: skript `afterInteractive/lazyOnload`, žádný dopad na LCP.

## 6. Právo / GDPR / SEO
- Aktualizovat `zasady-cookies` (Seznam.cz, a.s. jako zpracovatel pro marketing) a `ochrana-osobnich-udaju` (předání e-mailu a údajů o objednávce; review e-mail; doba 365 dní u Seznamu); cs i en. Sjednotit s ostatními weby FUTUNATU (rip-shop jej nepoužívá — nic nesdíleného nemění).
- Nové stránky nevznikají → sitemapa/indexace beze změny; texty cookies/GDPR zůstávají indexovatelné.

## 7. Fáze a odhad
1. **Fáze 1 (≈0,5–1 den):** `SeznamSem` + consent + PageView + ViewContent/AddToCart/InitiateCheckout/Purchase (FE), sandbox test, GDPR texty. Bez `review_email`.
2. **Fáze 2:** `review_email` s opt-outem (DB migrace — Gate), pokladna + e-mail/podmínky.
3. **Fáze 3 (volitelně):** S2S, `Lead` z formulářů, DRTG retargeting seznamy ve Správě měření.

## 8. Potřebuju od Jana
- **SEM ID** (a později S2S SEM ID) ze Skliku — nebo mi řekni, ať je přečtu přes Chrome po přihlášení.
- Souhlas se **vstupem env proměnné** `NEXT_PUBLIC_SEZNAM_SEM_ID` na Vercelu (Gate).
- Rozhodnutí o souhlasu: **A) jen po marketing souhlasu (doporučuji)** vs B) vždy s consent mode.
- Rozhodnutí o `review_email` (zapnout hodnocení zákazníků na Zboží.cz? vyžaduje opt-out a DB migraci).
