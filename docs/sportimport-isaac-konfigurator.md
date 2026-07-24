# Zpráva pro Sportimport — chybné ceny v ISAAC konfigurátoru (feed)

**Odesílatel:** FUTUNATU s.r.o. / 100dola sport (Jan Piecha, piecha.jan@gmail.com, +420 739 045 057)
**Věc:** Nekonzistentní příplatky komponent (`config_option_diff`) v ISAAC konfigurátoru ve vašem feedu

---

Dobrý den,

napojujeme váš ISAAC feed (včetně konfigurátoru „Custom") do našeho e-shopu. **Pevně nacenění modely (SKU) sedí přesně** — např. Isaac Meson Ruby Red 105 Di2 = 132 490 Kč, Ultegra Di2 = 152 490 Kč, Dura Ace Di2 = 187 490 Kč, vše odpovídá i vašemu webu isaac-cycle.cz. Díky.

**Problém je v konfigurátoru** — příplatky za komponenty (`config_option_diff`) nedávají dohromady správnou cenu sestaveného kola.

## Konkrétní příklad — Isaac Meson Ruby Red Custom

- **Základní cena (base) konfigurátoru = 132 490 Kč** — což je **cena kompletního kola s 105 Di2**. To je správně jako výchozí bod.
- Volba „Rámová sada" = −31 395 Kč → funguje správně.
- **ALE příplatky za groupset se přičítají k base, i když base už kompletní kolo (se 105 Di2) obsahuje:**

| Groupset (volba v konfigurátoru) | Příplatek ve feedu | Výsledná cena u nás | Správná cena (vaše SKU / web) | Rozdíl |
|---|---|---|---|---|
| Shimano 105 Di2 | +15 000 | 165 490 | 132 490 | **+33 000** |
| Shimano Ultegra Di2 | +35 000 | 185 490 | 152 490 | **+33 000** |
| Shimano Dura Ace Di2 | +85 000 | 235 490 | 187 490 | **+48 000** |

Tedy sestavené kolo vychází **o 17–48 tisíc dráž**, než ho reálně prodáváte.

## V čem je jádro problému

1. **Dvojité počítání entry komponent.** Base = kompletní kolo se 105 Di2, ale volba „105 Di2" má příplatek +15 000 (a nejlevnější náboj +2 000) → přičítá se něco, co už v base je. **Nejlevnější / výchozí volba v každé skupině by měla mít příplatek 0.**
2. **Nesprávná rozteč mezi groupsety.** Rozdíl 105 → Ultegra u vás dělá **+20 000** (152 490 − 132 490) a to i v našem feedu sedí. Ale 105 → Dura Ace u vás dělá **+55 000** (187 490 − 132 490), zatímco feed počítá **+70 000** (rozdíl příplatků 85 000 − 15 000) → **o 15 000 víc**.

## O co prosíme

Prosíme o revizi `config_option_diff` v ISAAC konfigurátoru tak, aby:
- **výchozí (nejlevnější) volba v každé skupině** (groupset, kola, náboje…) měla příplatek **0**,
- **příplatky ostatních voleb** odpovídaly reálnému rozdílu proti výchozí sestavě (aby sestavené kolo = cena odpovídajícího hotového SKU),
- to samé pro **kola, náboje a další komponenty** — potřebujeme jistotu, že příplatky za upgrade kol/nábojů odpovídají skutečnosti (u těch nemáme jak si to ověřit, na rozdíl od groupsetů).

Ideálně: **base = cena entry kompletního kola** (jak je teď) a příplatky = rozdíl konkrétní volby proti entry sestavě. Nebo alternativně base = rámová sada + reálné ceny všech komponent.

Rád doplním jakékoli detaily nebo pošlu další příklady (Boson, Torus, Element, Vitron, Kaon — stejný vzorec). Do vyřešení máme online konfigurátor dočasně vypnutý (necháváme jen pevná SKU), ať zákazníkům neúčtujeme špatnou cenu.

Díky moc,
Jan Piecha
FUTUNATU s.r.o. / 100dola sport
