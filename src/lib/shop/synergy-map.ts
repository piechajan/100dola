// Client-safe (žádný server-only) — sdílí ho server doporučení i modal v košíku.

/**
 * Cross-category synergy mapping — když user kupuje X, doporučíme Y.
 * Source category → target category preferences (ordered by priority).
 *
 * Tohle je rule-based fallback. Behavioral data z product_pair_counts
 * (jakmile budou) přepíše tyto pravidla podle skutečných objednávek.
 */
export const SYNERGY_MAP: Record<string, string[]> = {
  // Kola → pláště, kazety, sedla, helmy, tretry, řídítka
  "silnicni-aero": ["plastre-silnicni", "helmy-kolo", "tretry-silnicni", "sedla-silnicni", "vyplety-silnicni", "servis-retez"],
  "silnicni-endurance": ["plastre-silnicni", "helmy-kolo", "tretry-silnicni", "sedla-silnicni", "servis-retez"],
  "silnicni-race": ["plastre-silnicni", "vyplety-silnicni", "wattmetry", "helmy-kolo", "servis-retez"],
  "gravel": ["plastre-gravel", "helmy-kolo", "tretry-gravel", "sedla-gravel", "vyplety-gravel", "servis-retez"],
  "gravel-1x": ["plastre-gravel", "helmy-kolo", "tretry-gravel", "sedla-gravel", "servis-retez"],
  "gravel-2x": ["plastre-gravel", "helmy-kolo", "tretry-gravel", "servis-retez"],
  "triatlon": ["plastre-silnicni", "vyplety-triatlon", "wattmetry"],
  "mtb-pevna": ["plastre-mtb", "helmy-kolo", "tretry-mtb"],
  "mtb-hardtail": ["plastre-mtb", "helmy-kolo", "tretry-mtb", "servis-retez"],
  "mtb-celoodpruzena": ["plastre-mtb", "helmy-kolo", "tretry-mtb", "servis-retez"],

  // Oblečení → komplementární kusy
  "obleceni-dresy": ["obleceni-kalhoty", "obleceni-rukavice-ponozky", "vyziva-iontaky"],
  "obleceni-kalhoty": ["obleceni-dresy", "obleceni-spodni", "obleceni-rukavice-ponozky"],
  "obleceni-bundy": ["obleceni-dresy", "obleceni-zima", "obleceni-rukavice-ponozky"],
  "obleceni-zima": ["obleceni-bundy", "obleceni-rukavice-ponozky", "obleceni-spodni"],

  // Komponenty
  "vyplety-silnicni": ["plastre-silnicni", "pedaly-silnicni"],
  "vyplety-gravel": ["plastre-gravel"],
  "wattmetry": ["vyziva-iontaky", "obleceni-dresy"],

  // Výživa - cross-cycling
  "vyziva-iontaky": ["vyziva-gely", "vyziva-tycinky"],
  "vyziva-gely": ["vyziva-iontaky", "vyziva-tycinky"],

  // Péče - po koupi kola = údržba
  "pece-myti": ["pece-retez", "pece-ram"],
  "pece-retez": ["pece-myti", "vyziva-iontaky"],

  // Trenažéry — co k nim člověk reálně potřebuje dokoupit.
  // Pořadí = priorita: nejdřív to, bez čeho trenažér nerozjede (osy, kazeta,
  // voskovaný řetěz), pak komfort (ventilátor), pak to, co stejně kupuje
  // k zimnímu tréninku (ionťák, kompresor, blikačky na ven).
  "trenazery-chytre": [
    "trenazery-prislusenstvi",
    "kazety-silnicni",
    "servis-retez",
    "vyziva-iontaky",
    "vyziva-proteiny",
    "pumpy-elektricke",
    "osvetleni",
  ],
  // T7 je kompletní kolo: nemá kazetu, osu ani řetěz, které by šly dokoupit/navoskovat.
  "trenazery-smart-bike": [
    "trenazery-prislusenstvi",
    "vyziva-iontaky",
    "vyziva-proteiny",
    "osvetleni",
  ],
  "trenazery-prislusenstvi": ["trenazery-chytre", "servis-retez", "vyziva-iontaky"],

  // Servis řetězu — vosk, voskovačka, nový řetěz
  "servis-retez": ["trenazery-chytre", "pece-retez"],

  // Pumpy a pláště se doplňují
  "pumpy-elektricke": ["plastre-silnicni", "plastre-gravel"],
  "plastre-silnicni": ["pumpy-elektricke", "servis-retez"],
  "plastre-gravel": ["pumpy-elektricke", "servis-retez"],
};
