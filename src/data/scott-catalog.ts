import type { Product } from "./products";

/**
 * SCOTT CATALOG — poloautomaticky generovaný katalog Scott 2025/2026.
 *
 * Zdroj: scott-sports.cz (název, specy, fotky, kategorie, rok, MOC) + Endorphin
 * Republic (cena, sleva, původní cena, dostupnost). Generuje builder ve
 * `scripts/scott-catalog/` — viz jeho README. Human-in-the-loop: builder vytvoří
 * draft, Claude zkontroluje a commitne (žádné blbé ceny/fotky).
 *
 * Tyto produkty se mergují do katalogu v get-products.ts vedle ručních PRODUCTS.
 * Dostupnost: dokud není Sport Port produktový feed (2027), jede vše
 * „na objednávku — termín potvrdíme po objednávce" (stockStatus: on_request).
 *
 * ID prostor: 1000+ (ruční PRODUCTS drží 1–999). NEUPRAVUJ ručně mezi markery —
 * builder to přepíše. Ruční doladění dělej mimo blok GENERATED, nebo přes override.
 */

// prettier-ignore
// <<<GENERATED:START>>> (builder přepisuje jen tento blok)
export const SCOTT_CATALOG: Product[] = [];
// <<<GENERATED:END>>>
