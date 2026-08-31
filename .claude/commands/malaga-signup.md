# Master prompt — Prodejní přihláška na Malaga akci

**Cíl:** Postavit prodejní přihlašovací flow pro **každou Malaga akci** (event se
`sport === "Malaga"`, např. `malaga-fall-ride-1`, `malaga-fall-ride-2`, budoucí
camps/tours). Není to jen „zapiš se" — je to **kvalifikovaný sales lead**: z
odpovědí musí Jan poskládat nabídku (doprava + uskladnění + ubytování + výživa)
a zákazník musí během vyplňování **pochopit a chtít** celý model „vlastní kolo v
Malaze, letíš jen s příručákem".

Navazuje na už hotový group-signup systém (Rychleby): reuse `event_signups` +
`event_signup_members` + `/api/event-signup` + emailový vzor. Malaga přidává
vlastní sekce.

---

## 1) Kde se to zobrazí
- Detail každého Malaga eventu (`/community/event/[slug]`, `event.sport === "Malaga"`).
- Nahradí současný generický `RegistrationSystem` (foto/přezdívka/klub/VIP → pryč
  pro Malagu; ten je pro OMC komunitní jízdy, ne pro placenou službu).
- Zapíná se přes flag na eventu, stejně jako `groupSignup` (např.
  `malagaSignup?: boolean` nebo znovupoužít `groupSignup` + rozlišit podle sportu).

---

## 2) Tón a rámování (PRODEJNÍ, ne úřední)
- Nahoře krátký value blok: **„Vlastní kolo v Malaze. Letíš jen s příručákem."**
- U každé volby mikrocopy, co to pro zákazníka znamená (benefit, ne feature).
- Reassurance u submitu: „Nezávazné — ozveme se ti s konkrétní nabídkou a cenou."
- Nikdy neslibovat termín dodání (viz pravidlo honest-shipping): „Termín potvrdíme
  po objednávce."
- Ceny uvádět jako „od" (one-way od 150 €, round-trip od 250 €, e-bike příplatek),
  ať zákazník má kotvu, ale finál dá nabídka.

---

## 3) Sekce formuláře

### A. Kdo jsi (povinné)
- Jméno a příjmení, e-mail, telefon.
- Typ: jednotlivec / skupina / klub (řídí tón follow-upu).
- (Volitelně) **+ přidat člena** až 10× — reuse z group-signup (jméno povinné,
  mail/telefon volitelné). Pro skupiny/kluby.

### B. Doprava kola (jádro — jedna hlavní volba)
Radio karty s benefit-copy:

1. **Basic — dovezu kolo sám**
   - „Kolo přivezeš zabalené v boxu/krabici na sběrné místo. Nejlevnější varianta."
   - od 150 € (one-way) / od 250 € (round-trip).

2. **Exclusive — vyzvedneme u tebe** (dvě podvarianty, sub-radio):
   - **a) Full service:** „Vyzvedneme kolo u tebe, zabalíme a připravíme na cestu.
     V Malaze ti ho složíme a nachystáme — přijedeš a jedeš."
   - **b) Jen svoz:** „Kolo máš zabalené v boxu/krabici, vyzvedneme ho u tebe."
   - Prémiová varianta, cena dle domluvy / balíček Exclusive.

3. **Nemám zájem o dopravu** — „Kolo už mám v Malaze / řeším jinak."
   (skryje pod-pole dopravy, ale nechá ubytování + výživu.)

Pod-pole dopravy (když Basic/Exclusive):
- **Směr:** jednosměrná / zpáteční.
- **Počet kol.**
- **Typ kola:** silniční / gravel / MTB / **e-bike** (e-bike = příplatek, zmínit).
- **Nechat kolo v Malaze po akci?** (upsell na uskladnění): ne / přes zimu /
  celoročně. → napojení na storage nabídku (69 €/měs, 449 €/sezóna „od").

**Info banner u dopravy (must-have, prodejní pointa):**
> Do boxu/krabice si dej **veškeré vybavení na kolo i věci, které budeš v Malaze
> potřebovat** (oblečení, tretry, helma, nářadí…). Na palubu letadla ti pak stačí
> **jen příručák.** Žádné opakované balení, žádné placení kola v letadle.

### C. Ubytování (stejná lokace)
- „Zájem o ubytování ve stejné lokaci (zařídíme my)" / „Mám vlastní".
- Když zájem: termín (od–do) nebo počet nocí; počet osob se odvodí z členů.
- Mikrocopy: „Ubytování řešíme my — vybereme a zajistíme, nemusíš nic hledat sám."

### D. Výživa na místě — SPONSER (švýcarská značka)
- „Gely, iontové nápoje, proteiny a doplňky **SPONSER** (švýcarská prémiová značka)
  máme na místě k dispozici."
- Volba: **Mám zájem — předobjednat balíček** (rozklikne hrubý výběr:
  gely / ionták / protein / recovery / nevím, poradíte) / **Nemám zájem**.
- (Volitelně později: konkrétní produkty + orientační cena; MVP = jen zájem ano/ne
  + poznámka, co preferuje.)

### E. Termín / zaměření
- Který termín / měsíc (nabídnout **říjen a listopad** + „jiný"), nebo navázat na
  konkrétní datum eventu.
- (Guided) zaměření: km bloky / social ride / gravel / discovery — pro dramaturgii.

### F. Uzávěr
- Poznámka (volné pole).
- **GDPR souhlas** (povinný, link `/ochrana-osobnich-udaju`).
- Honeypot + rate limit + Turnstile (env-gated) — jako ostatní formuláře.

---

## 4) Co se stane po odeslání
- Ulož do DB (viz data model níže).
- **Mail Janovi (sales lead):** vše přehledně jako podklad na nabídku — kontakt,
  skupina, doprava (tier + směr + počet/typ kol + e-bike + uskladnění po akci),
  ubytování (termín/nocí), SPONSER zájem, termín, poznámka. Subject ať nese jméno
  + hlavní intent (např. „Malaga přihláška — Novák · Exclusive round-trip · 2 kola").
- **Mail zákazníkovi (potvrzení + prodej):** rekap jeho voleb + „ozveme se ti s
  konkrétní nabídkou a cenou". Cross-sell odkazy na `/malaga` (jak to funguje),
  `/malaga/trasy`, `/malaga/uskladneni`, počasí. Subject „Máme tvou poptávku na
  Malagu — ozveme se s nabídkou".
- **Připomínka před odjezdem** (reuse `event-reminders` cron): praktická (co dát do
  boxu, kdy dovézt kolo na sběrné místo, kontakt na místě).

---

## 5) Data model (doporučení)
Reuse `event_signups` + `event_signup_members`. Malaga potřebuje víc polí — dvě
cesty:

- **Doporučeno:** přidat do `event_signups` **`signup_kind text`** (`'group'` |
  `'malaga'`) + **`options jsonb`** pro typ-specifické odpovědi (transport tier,
  směr, počet/typ kol, e-bike, storage-after, ubytování termín, sponser zájem,
  termín, zaměření). Žádná další migrace při rozšiřování. Strukturované sdílené
  sloupce (lead, party_size, stay_type, note, gdpr) zůstávají.
- Alternativa: samostatné nullable sloupce pro Malagu — čitelnější v SQL, ale
  bobtná tabulka a chce migraci na každé nové pole.

**Pozn.:** Rychleby migrace (`002_event_signups.sql`) ještě NEBĚŽELA — dá se do ní
`signup_kind` + `options jsonb` **přidat rovnou**, ať běží jedna migrace pro obě
varianty (Rychleby i Malaga). Rozhodni při buildu.

Zod: nové `MalagaSignupPayloadSchema` (nebo rozšířit event-signup schema o
`options`). Server autoritativně validuje, cenu/nabídku nikdy nebere z klienta.

---

## 6) Reuse checklist (neduplikovat)
- Modal/Portal, honeypot, GDPR blok, member repeater → z `EventGroupSignup.tsx`
  (vyčlenit sdílené kusy, Malaga = varianta se sekcemi B–E navíc).
- `/api/event-signup` route → větev podle `signup_kind`, nebo `/api/malaga-signup`
  se sdílenými helpery.
- Email helpers v `src/lib/email.ts` (vzor `sendEventSignup*`).
- Ceny z `src/data/malaga.ts` (TRANSPORT_PRICES, STORAGE_PRICES) — jeden zdroj pravdy.
- SPONSER: přidat malý datový soubor (produkty/kategorie) pro budoucí rozšíření.

---

## 7) Definition of done
- Na Malaga eventu je prodejní přihláška se sekcemi A–F.
- Odeslání uloží lead + pošle 2 maily (Jan sales podklad + zákazník potvrzení).
- Zákazník během vyplňování pochopí: vlastní kolo, do boxu i výbava, letí s
  příručákem, ubytování i výživa (SPONSER) vyřešené na místě.
- Ceny „od" konzistentní s `malaga.ts`, žádný slib termínu dodání.
- Build + lint čisté, RLS zapnuté, egress-safe (žádný nový nekešovaný list dotaz).
```
