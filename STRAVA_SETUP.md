# Strava integration — setup návod

Tento web umí automaticky načítat **upcoming group events** ze Strava klubu
[Open Miles Clinic (ID 2070600)](https://www.strava.com/clubs/2070600).

Když není nastaveno, sekce „Co se jede" zobrazí pouze ručně definované eventy.
Když je nastaveno, doplní k nim Strava eventy s 30-min cache.

---

## Jednorázový setup

### 1) Vytvoř Strava API aplikaci

1. Přihlas se na [strava.com](https://www.strava.com) jako majitel klubu
   (= účet, který má v klubu Open Miles Clinic admin práva).
2. Otevři https://www.strava.com/settings/api.
3. Vytvoř API aplikaci:
   - **Application Name:** `100dola web`
   - **Category:** Other
   - **Club:** Open Miles Clinic (volitelně)
   - **Website:** https://100dolamalaga.cz
   - **Authorization Callback Domain:** `localhost` *(pro setup; po nasazení můžeš přidat produkci)*
4. Po uložení uvidíš **Client ID** a **Client Secret**. Nezavírej tab.

### 2) Spusť OAuth helper

```bash
cd web
node scripts/strava-oauth.mjs
```

- Skript se zeptá na Client ID a Client Secret.
- Vypíše URL — otevři ji v browseru, povol scopes.
- Strava tě po povolení redirectne na `http://localhost:9876/strava-callback`.
- Skript callback zachytí, vymění `code` za **refresh token** a vypíše env vars.

### 3) Vlož env vars

**Lokálně** — vytvoř `.env.local` v `web/`:

```env
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REFRESH_TOKEN=...
STRAVA_CLUB_ID=2070600
```

**Produkce (Vercel)** — Project Settings → Environment Variables → přidej stejné 4 klíče.
Po uložení musíš redeploy (Settings → Deployments → ⋯ → Redeploy).

### 4) Restart dev serveru

```bash
npm run dev
```

Otevři `/community` → Strava eventy by se měly objevit do pár vteřin.

---

## Architektura

```
src/lib/strava.ts            ← API client (server-only): refresh tokenu + fetch
src/lib/strava-mapping.ts     ← Strava GroupEvent → náš UIEvent
src/app/api/strava/events/    ← /api/strava/events (revalidate 1800 = 30 min)
src/components/community/EventListing.tsx  ← fetch + merge s ručními eventy
scripts/strava-oauth.mjs      ← jednorázový helper
```

**Cache logika:** 
- Access token žije 6 hodin, drží se v paměti runtime (per-instance).
- API route používá `revalidate: 1800` — 30 min ISR cache.
- Refresh token se občas mění; když se to stane, log ve Vercel Functions vypíše:
  > `[strava] Refresh token rotated. Update STRAVA_REFRESH_TOKEN env var to: ...`
  
  Když to vidíš, ručně updatni env var ve Vercelu a redeploy.

**Filtrování:**
- Vrací jen eventy s **upcoming_occurrences v budoucnosti**.
- Skryje `private: true` eventy.
- Setříděno podle nejbližšího data.

**Mapping activity_type → sport:**
- `Ride` → Silnice
- `GravelRide` → Gravel
- `MountainBikeRide` → MTB
- `Run`, `TrailRun` → Běh
- `Hike` → Turistika
- `BackcountrySki`, `AlpineSki` → Skialpy
- `NordicSki` → Běžky

**Co Strava neumí:**
- Distance / elevation eventu (route_id je v API deprecated). Zobrazí se prázdné.
- Capacity / registrations. Strava events se zobrazí bez progress baru.
- Photo per-event. Použije se default obrázek podle activity_type.

---

## Troubleshooting

**„Strava env vars missing"** → chybí Client ID / Secret / Refresh token. Spusť `strava-oauth.mjs`.

**`401 Unauthorized` při fetchi** → Refresh token vypršel nebo byl revoked.
Spusť OAuth znovu, ulož nový refresh token.

**Eventy se nenačítají, ale API funguje**
- Zkontroluj, že máš v Strava klubu **role admin/owner** (membership scope).
- Zkontroluj že eventy nejsou private.
- 30 min cache: čekej max 30 min nebo spusť `next dev` čerstvě.

**Rate limit** — Strava API: 100 requests / 15 min, 1 000 / den.
Tahle integrace volá max 2× za 30 min cache window, jsme bezpečně pod limitem.

---

## Disclaimer

Strava TOS zakazuje zobrazovat osobní activity data uživatele třetím osobám.
**Group events jsou jiná kategorie** — jsou to pozvánky určené ke sdílení, takže
jejich zobrazení mimo Stravu je v souladu s podmínkami. Pokud Strava politiku
změní, integraci snadno vypneš odebráním env vars.
