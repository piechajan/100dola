// Ubytování kolem Malagy — rozhodovací nástroj (§5 zadání malaga-trasy).
// Skórujeme lokality podle toho, co cyklistu pálí: čas na dobrou silnici,
// rozmanitost tras od dveří, transfer z AGP. ŽÁDNÉ ceny za pokoj (§10.2) —
// jen cenová hladina €–€€€€. ŽÁDNÁ tvrzení o WorldTour kempech (§10.3).

export type Verdict = "top" | "good" | "avoid";

export interface Locality {
  name: string;
  verdict: Verdict;
  /** čas z postele na dobrou silnici */
  toRoad: string;
  /** stoupání dostupná od dveří bez auta */
  climbs: string;
  /** transfer z letiště AGP */
  agp: string;
  note_cs: string;
}

export const VERDICT_META: Record<Verdict, { label: string; color: string; icon: string }> = {
  top: { label: "Nejlepší volba", color: "#2EAA6E", icon: "⭐" },
  good: { label: "Dobrá volba", color: "#3B7CF4", icon: "✅" },
  avoid: { label: "Nedoporučujeme", color: "#E8431A", icon: "❌" },
};

export const LOCALITIES: Locality[] = [
  {
    name: "Málaga východ — El Palo / Pedregalejo / El Limonar",
    verdict: "top",
    toRoad: "5–10 min",
    climbs: "Olías (zeď 13,8 %), Puerto del León, Santopitar",
    agp: "20–25 min",
    note_cs: "Nejlepší celkově — na kole hned v horách nad městem, k moři i do Axarquíe. Naše zázemí je v téhle části Málagy.",
  },
  {
    name: "Málaga centrum / Soho",
    verdict: "top",
    toRoad: "15–25 min",
    climbs: "Puerto del León přes Cristo de la Epidemia",
    agp: "12 min vlakem C-1",
    note_cs: "Nejlepší, když chceš k jízdě i město — restaurace, kavárny, atmosféra. Výjezd městem je delší, ale pak jsi v horách.",
  },
  {
    name: "Alhaurín de la Torre / el Grande",
    verdict: "top",
    toRoad: "0–5 min",
    climbs: "MA-3300 'Carretera de la Vía', Sierra de Mijas",
    agp: "10–30 min",
    note_cs: "Nejlepší čistě cyklistická báze u pobřeží — hned do kopce, klid, blízko letiště.",
  },
  {
    name: "Antequera",
    verdict: "top",
    toRoad: "0 min",
    climbs: "El Torcal (1 224 m, nejvýš v provincii), La Joya, El Chorro",
    agp: "60 min autem / 30 min vlakem",
    note_cs: "Nejlepší silnice na euro, ale bez moře. Historické město, čistý asfalt, hory hned za dveřmi.",
  },
  {
    name: "Torremolinos / Benalmádena",
    verdict: "good",
    toRoad: "10–15 min",
    climbs: "Sierra de Mijas přes A-368",
    agp: "10–15 min vlakem",
    note_cs: "Dobrý poměr cena/výkon, výborná dopravní dostupnost vlakem.",
  },
  {
    name: "Fuengirola / Mijas",
    verdict: "good",
    toRoad: "10 min do vnitrozemí",
    climbs: "Mijas repetidor, Coín, Alhaurín",
    agp: "34 min vlakem",
    note_cs: "Hned do kopce, ale pobřežní koridor je tu nejhorší — jeď do vnitrozemí.",
  },
  {
    name: "Nerja / Torrox",
    verdict: "good",
    toRoad: "5 min",
    climbs: "Frigiliana, Cómpeta, útesy Maro",
    agp: "55–70 min",
    note_cs: "Podceněné — N-340 východně od Maru je díky dálnici skoro prázdná. Nejhezčí bílé vesnice za rohem.",
  },
  {
    name: "Marbella",
    verdict: "good",
    toRoad: "10 min",
    climbs: "Istán, Ojén, Juanar",
    agp: "45 min, bez vlaku",
    note_cs: "Nejlepší rozmanitost na týden, ale nejdražší a bez vlakového bail-outu.",
  },
  {
    name: "Vélez-Málaga / Torre del Mar",
    verdict: "good",
    toRoad: "5 min",
    climbs: "Zafarraya, Puerto del Sol, Comares",
    agp: "45 min",
    note_cs: "Silná lezecká báze do Axarquíe, ale plná síla terralu (horký severák).",
  },
  {
    name: "Ronda",
    verdict: "good",
    toRoad: "0 min",
    climbs: "Puerto del Viento, Grazalema, Genal",
    agp: "90+ min",
    note_cs: "Nejlepší scenérie, nejhorší transfer z letiště. Spíš na delší pobyt zaměřený na hory.",
  },
  {
    name: "Málaga západ — Teatinos / Ctra. de Cádiz",
    verdict: "avoid",
    toRoad: "25–35 min + MA-21",
    climbs: "nic přímo",
    agp: "10 min",
    note_cs: "Nedoporučujeme — letiště přeřízne pobřeží, musíš oklikou přes Campanillas a kus po autovíi. Blízko AGP, ale k jízdě špatné.",
  },
];

export interface CycloStay {
  name: string;
  town: string;
  /** cenová hladina, NE cena za pokoj */
  level: "€€" | "€€€" | "€€€€";
  services_cs: string;
  caveat_cs?: string;
}

export const CYCLO_STAYS: CycloStay[] = [
  {
    name: "Hotel Cortijo Chico",
    town: "Alhaurín de la Torre",
    level: "€€€",
    services_cs: "10 min z letiště, privátní bike garáž, dílna s nářadím a pumpou, jídlo pro sportovce, packed lunch. Cycling Friendly.",
  },
  {
    name: "Finca Eslava",
    town: "Antequera",
    level: "€€€",
    services_cs: "4★ cyklo-centrum — mytí kol, nářadí, info o trasách.",
  },
  {
    name: "Hotel Santa Rosa",
    town: "Torrox Costa",
    level: "€€",
    services_cs: "Používá Axarquía Cycling pro 7denní kempy, cyklo-zázemí.",
  },
  {
    name: "BYPILLOW Villa Lorena",
    town: "El Limonar, Málaga",
    level: "€€€",
    services_cs: "7 pokojů, Cycling Friendly certifikace.",
    caveat_cs: "Služby popsané třetí stranou — ověř u provozovatele.",
  },
  {
    name: "Switchbacks villa",
    town: "Alhaurín el Grande",
    level: "€€€",
    services_cs: "18 lůžek, dílna s tlakovými myčkami a stojany, transfery.",
    caveat_cs: "Marketuje se hlavně na MTB — ověř vhodnost pro silnici.",
  },
  {
    name: "NH Málaga / Atarazanas Boutique",
    town: "Málaga centrum",
    level: "€€€",
    services_cs: "Zabezpečená úschova kol. Fallback pro město: půjč kolo a nech ho přes noc v krámě (Eat Sleep Cycle).",
  },
];
