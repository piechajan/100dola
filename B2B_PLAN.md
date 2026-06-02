# B2B Mode pro cyklistické kluby — Phase 0 prep

**Stav:** Připraveno, NESPUSTILI JSME. Jan spustí, až bude poptávka.

## Co je hotové (Phase 0 — 2026-06-02)

- DB migrace `db/migrations/017_b2b_clubs_skeleton.sql` (NESPUŠTĚNA na Supabase)
- Schema: `b2b_clubs` + `b2b_club_pricing` + `b2b_club_members` + FK na `orders`
- RLS enabled, žádné public policies (default-deny)

## Postup spuštění (až bude Jan ready)

### Krok 1: DB migrace
1. Otevřít Supabase SQL Editor (přes Playwright nebo manuálně)
2. Vložit obsah `017_b2b_clubs_skeleton.sql`
3. Run → ověřit "Success. No rows returned"

### Krok 2: Admin UI (Phase 1 dev)
- `/admin/b2b` — seznam klubů, editor (slug, název, IČO, sleva, kontakt)
- `/admin/b2b/[club_id]/pricing` — per-kategorie/per-brand discount editor
- `/admin/b2b/[club_id]/members` — seznam emailů, role admin/member
- Cookie auth jako ostatní admin sekce

### Krok 3: Public UX (Phase 2 dev)
- `/kluby` landing — výhody, jak se přihlásit, kontakt na Jana
- Login: magic link mailem (žádný heslo, OTP přes Resend)
- Když je user signed-in jako member klubu → cena se na `/shop` automaticky přepočítá s discount
- Cart drawer: "Cena klubu: −X %" badge

### Krok 4: Order flow
- `orders.b2b_club_id` + `b2b_member_email` automaticky set při checkout
- Faktura: souhrnný měsíční report Janovi → Fakturoid (vlastní invoice per klub)
- Email confirm zákazníkovi má "Sleva klubu uplatněna" sekci

### Krok 5: Marketing
- Cílit na Open Miles Clinic (Janův kontakt), SK Sazka Žlutý, lokální OK kluby
- Pitch: "Klubové slevy + vlastní onboarding flow + souhrnná fakturace"

## Co Jan musí dodat až bude ready

1. **Seznam pilotních klubů** (5-10 jmen, kontakty)
2. **Slevová politika** — kolik %, pro koho, na co (kategorie/brand)
3. **Fakturační proces** — měsíčně? per-order? Kdo schvaluje?
4. **Marketing copy** pro `/kluby` landing page

## Připomenutí

V `~/.claude/projects/.../memory/project_pending_actions.md` přidat:
- 🟡 B2B mode čeká na Jana
- Memory key: project_b2b_phase0
