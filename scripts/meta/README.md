# Meta helper scripts

Bash skripty pro správu Meta (Facebook + Instagram) marketing infrastruktury z příkazové řádky. Eliminují potřebu klikat v Meta UI, které se chová nepředvídatelně.

## Použití

Vyžaduje:
- `vercel` CLI přihlášený do projektu (skripty si tahají env z Vercel production)
- `python3` + `curl`

```bash
# Status check — co je nastaveno, kdo má přístup, kolik kampaní
bash scripts/meta/status.sh

# Daily audit — token, pixel events, spend, audience size
bash scripts/meta/audit.sh

# Spustit Cold ad set (PAUSED → ACTIVE)
bash scripts/meta/launch-isaac-cold.sh
```

## Klíčové IDs (v _config.sh)

| Co | ID |
|---|---|
| Meta App | `973141468640171` (status: Live ✅) |
| Pixel | `1867612187213152` |
| Ad Account | `act_647471898078601` (Futunatu) |
| Business Portfolio | `1362363054962597` |
| FB Page 100dola | `1030724350135010` |
| System User | `61580033733753` (Conversions API) |
| Campaign ISAAC | `120245268070110446` |
| Ad Set Cold | `120245268297360446` |
| Ad Set Retarget | `120245268306880446` |

## Co token umí (Standard Access)

- ✅ `ads_management` — vytvořit/spravovat kampaně, ad sety, ads, custom audiences
- ✅ `business_management` — Business Portfolio assets
- ❌ `pages_read_engagement` — vyžaduje App Review (TODO)
- ❌ `instagram_basic` — vyžaduje App Review (TODO)

## Co token zatím NEUMÍ a vyžaduje App Review

Pro **plnou automatizaci** boost campaign z command-line (bez UI klikání) potřebujeme:

1. **App Review submit** pro:
   - `pages_read_engagement` (číst FB page posts)
   - `pages_manage_posts` (publish posts)
   - `instagram_basic` (fetch IG media)
   - `instagram_content_publish` (publish IG posts)
   - `ads_management_standard` Advanced Access

Review trvá 5-15 dní. Po schválení skript `boost-existing-post.sh` bude fungovat plně.

## Roadmap skriptů

- [x] `_config.sh` — shared env + helper functions
- [x] `status.sh` — current state overview
- [x] `audit.sh` — daily health check
- [x] `launch-isaac-cold.sh` — activate Cold ad set
- [ ] `boost-existing-post.sh` — boost IG/FB post (čeká App Review)
- [ ] `create-campaign.sh` — bootstrap new campaign from template
- [ ] `clone-for-malaga.sh` — duplicate ISAAC campaign → Malaga creative
- [ ] `report-weekly.sh` — týdenní report do mailu

## Lessons learned (z ISAAC eventu 28. 5. 2026)

1. **App musí být v Live mode** (ne Development) — jinak ad creatives API selhává
2. **System User potřebuje explicitní access** ke každému asset:
   - FB Page (Reklamy permission) ✅ máme
   - IG Business Account ❌ chybí (Jan musí přidat manuálně v BM)
3. **Instagram Promote/Boost button** v IG vyžaduje:
   - Professional Account (Business) ✅ máme
   - 2FA aktivní ✅ máme
   - **Carousel posts** nebo **post s royalty-free hudbou** — Reels s licencovanou hudbou nelze boostnout
4. **Marketing API create ad creative** vyžaduje:
   - `page_id` v `object_story_spec` → System User musí mít Page access
   - Pro IG post: `instagram_actor_id` → System User musí mít IG access
