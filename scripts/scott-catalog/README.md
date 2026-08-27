# Scott catalog builder

Poloautomatický katalog Scott 2025/2026 do vlastní tabulky (`src/data/scott-catalog.ts`),
rendrovaný přes naše standardní PDP. Ne živý feed — opakovatelný nástroj s
human-in-the-loop review (Claude scrapuje + kontroluje, pak commit).

## Zdroje dat
- **scott-sports.cz** (JS-rendered → Playwright): název, specy, fotky, kategorie, rok, MOC.
  Klikni tab „SPECIFIKACE" → „Více specifikací", z `body.innerText` vezmi blok
  `FRAME … APPROX WEIGHT IN KG`.
- **Endorphin Republic** (curl): cena, sleva, původní cena (MOC), dostupnost.

## Postup (jeden batch)
1. Naplň `models.mjs` (viz schema níže) daty z obou zdrojů.
2. `node scripts/scott-catalog/fetch-photos.mjs [slug]` — stáhne + zoptimalizuje fotky.
3. `node scripts/scott-catalog/generate.mjs` — přepíše GENERATED blok v scott-catalog.ts.
4. `npx tsc --noEmit` + vizuální kontrola → commit.

## MODEL schema (models.mjs)
```js
{
  slug: "scott-addict-rc-20-2026",        // bez roku u ebiků; jinak -YYYY
  name: "Scott Addict RC 20",
  year: "2026",                            // nebo null
  categoryId: "silnicni-race",             // leaf kategorie
  secondaryCategoryIds: ["silnicni-aero"], // volitelně
  gender: "M",                              // M | F | U (volitelně)
  useCase: "race",                          // volitelně
  badge: "Aero",                            // volitelně (+ "Sleva" doplní auto při slevě)
  price: 110000,                            // naše/ER cena (vč. DPH)
  moc: 130000,                              // MOC / původní (vč. DPH) → sleva auto
  note: "…",                                // 1–2 věty
  photo: "/media/scott/scott-addict-rc-20-1.webp",
  gallery: ["/media/scott/scott-addict-rc-20-1.webp", "…"],
  photoSources: {                           // pro fetch-photos: local → remote
    "/media/scott/scott-addict-rc-20-1.webp": "https://static.scott-sports.com/…",
  },
  colorOptions: [{ name: "Carbon Grey", photo: "/media/scott/…-1.webp" }],
  variants: [{ size: "M", isInStock: false, color: "Carbon Grey" }],
  specBlock: `FRAME\nAddict RC HMX\n…\nAPPROX WEIGHT IN KG\n7.9`,  // raw → specTable
  specs: ["Shimano 105 Di2", "Syncros Capital 1.0", "HMX karbon · 7,9 kg"], // 3 highlighty (volitelně; jinak odvodí)
}
```

Dostupnost je vždy `on_request` (na objednávku) dokud nebude Sport Port
produktový feed (2027). ID přiděluje generator od 1000 (ruční PRODUCTS = 1–999).
Kolize slug s ručním PRODUCTS → generovaný se zahodí (ruční má přednost).
