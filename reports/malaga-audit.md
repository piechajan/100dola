# Malaga trasy — audit repa + návrh (Fáze A, krok 1)

Datum: 2026-08-27 · Zadání: `.claude/commands/malaga-trasy.md`

## 1. Stack (ověřeno v repu)

- **Framework:** Next.js 16 (App Router), TypeScript strict, React 19. Pozn.: `AGENTS.md` upozorňuje, že tahle verze Next má breaking changes — před psaním kódu číst `node_modules/next/dist/docs/`.
- **Styling:** Tailwind, brandové barvy inline (Malaga accent `MALAGA_BRAND.color`).
- **Obsahová vrstva:** statická data v `src/data/*.ts` (žádné CMS, žádné MDX). Trasy = `src/data/malagaRoutes.ts`.
- **Routing:** `/malaga/trasy` = `src/app/malaga/trasy/page.tsx` (server komponenta, renderuje z `MALAGA_ROUTES`).
- **i18n:** žádné — web je čistě český.
- **Mapy:** **leaflet + react-leaflet už nainstalované.** Dlaždice OpenStreetMap.
- **Hosting:** Vercel Pro. Blob dostupný. Žádné placené mapové API (jen OSM zdarma).

## 2. Jak se dnes renderuje /malaga/trasy

- Data: `MALAGA_ROUTES: MalagaRoute[]` (6 tras) — **není to próza, je to datový model.** Pole: `slug, name, surface, level, distanceKm (string „50–65 km"), climbM (string), tagline, description, highlights[], stop, bestFor`.
- Stránka: hero + karty tras (`.map`), `ItemList` JSON-LD, breadcrumbs. Silná místa `bestFor` + `stop` už jsou v datech.
- **Chybí (dle §1 zadání):** GPX, jedna kanonická vzdálenost (teď rozpětí jako string), mapa, výškový profil, traffic/voda/bail-out/vítr/sezóna, filtr, detailní stránky tras (teď jen karty na jedné stránce, žádné `/malaga/trasy/<slug>`).

## 3. Co lze RECYKLOVAT (klíčové — půl práce hotová)

- **`GpxRouteMap.tsx`** (`src/components/community/`) — právě postaveno pro eventy: `fetch(gpxPath)` → Leaflet mapa + trasa + **výškový profil** + GPX download. **Přesně komponenta, kterou §3/§7 chce.** Stačí použít na trasy.
- **`ElevationProfile.tsx`** — SVG profil z GPX (parsuje trkpt lat/lon/ele).
- **`RouteMap.tsx`** — multi-varianta (cappuccino/espresso) z JSON coords → vzor pro trasy se 2 variantami.
- **Event GPX pipeline** — `/public/routes/*.gpx` už funguje (6 GPX), stejný pattern použít pro `/public/gpx/malaga/`.
- **Malaga lead form** (`MalagaLeadForm`) — konverzní napojení už existuje.

→ **Nemusíme stavět mapu/profil od nuly.** Hlavní práce = datový model + GPX stopy + filtr + praktická vrstva (voda/provoz/bail-out) + obsah.

## 4. Návrh datového modelu (adaptace §3 na náš stack)

Doporučení: **rozšířit `MalagaRoute` v `src/data/malagaRoutes.ts`** (ne zavádět `content/*.json` — repo nemá MDX/JSON content pipeline, TS data jsou zdroj pravdy a jsou type-safe + free egress). Přidat všechna pole z §3 jako typované interface. Nevyplněné → `null` + `todo[]`.

```
src/data/malaga/routes/            # jeden soubor per trasa (nebo jedno pole)
  index.ts                         # MALAGA_ROUTES: MalagaRoute[]
  types.ts                         # MalagaRoute, Traffic, Water, Climb, Bailout…
public/gpx/malaga/<slug>.gpx       # GPX stopy (validované skriptem)
public/img/malaga/profiles/…       # volitelně statické SVG (jinak GpxRouteMap live)
scripts/malaga/gpx-stats.mjs       # výpočet distance/ascent/max_grad ZE STOPY
scripts/malaga/verify-routes.mjs   # §8 verifikační protokol → reports/
src/app/malaga/trasy/[slug]/page.tsx  # detail trasy (mapa/profil/voda/provoz…)
src/app/malaga/ubytovani/page.tsx     # §5 rozhodovací nástroj
```
`/malaga/trasy` (listing + filtr) zůstává, přidá se detail `/malaga/trasy/<slug>` — **stará URL se nerozbije.**

## 5. Návrh pořadí prací + odhad rozsahu

| Fáze | Co | Odhad | Blokery |
|---|---|---|---|
| A1 | Rozšířit typ `MalagaRoute` na §3 model + migrovat 6 tras (null+todo kde chybí) | S | — |
| A2 | GPX pipeline: `gpx-stats.mjs` (metriky ze stopy) + validace | S–M | **potřebuju GPX stopy** |
| A3 | Detail `/malaga/trasy/[slug]` s GpxRouteMap + traffic/voda/bail-out vrstvou | M | závisí na A1/A2 |
| B | Katalog 12–16 tras (data + story_cs + praktická vrstva) | **L** (obsah!) | **GPX + rozhodnutí o zdrojích čísel** |
| C | Filtr katalogu · mapa vody/vent · bail-out vrstva · kalendář CZ · cue-sheet PDF | L | — |
| D | „Jak se tam dostat" · `/malaga/ubytovani` · konverze | M | ceny/ověření ubytování |
| E | Verifikační skript + `reports/malaga-verifikace.md` | S | — |

**Realisticky:** A + přepis 6 tras = rychlé. Katalog 12–16 tras s poctivou praktickou vrstvou = velká obsahová práce, kterou nelze odbýt (a §10 zakazuje vymýšlet). Největší blok = **GPX stopy** (bez nich to je pořád blogpost, §1).

## 6. OTÁZKY NA JANA (než začnu stavět — §11.4)

1. **GPX:** Odkud vezmeme stopy? (a) já postavím vlastní z bike2malaga/Strava referencí a ty je projedeš/potvrdíš, (b) máš vlastní odjeté GPX z Malagy, (c) začneme jen s trasami, co reálně jezdíme z naší základny? — **tohle je hlavní blocker.**
2. **Fotky:** Máme vlastní fotky z tras? (Jinak `photos: []` + `todo`.)
3. **Rozsah teď:** Chceš plný katalog 12–16 tras, nebo **MVP = přepsat 6 stávajících na nový model + mapa/profil/GPX + filtr** a katalog dostavovat postupně? (Doporučuju MVP první.)
4. **Positioning:** Je to **SEO magnet** (přitáhnout české silničáře → lead na naši základnu), nebo primárně **destination-readiness pro naše klienty**? Ovlivní to hloubku praktické vrstvy vs. konverzní tah.
5. **Ubytování:** `/malaga/ubytovani` teď, nebo až po trasách?
6. **Naše základna:** Kde přesně je (El Palo/El Limonar/…)? Trasy „od dveří" se počítají od ní — potřebuju start point.
