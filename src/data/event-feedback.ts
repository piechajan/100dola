// Post-event dotazník — sdílená definice otázek (form + email + validace).

export type FeedbackQKind = "rating5" | "nps" | "choice" | "text";

export interface FeedbackQuestion {
  key: string;
  label: string;
  kind: FeedbackQKind;
  choices?: { value: string; label: string }[];
  optional?: boolean;
}

export const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  { key: "overall", label: "Celkový dojem z akce", kind: "rating5" },
  { key: "best", label: "Co bylo nejlepší?", kind: "text", optional: true },
  { key: "improve", label: "Co zlepšit nebo co nesedělo?", kind: "text", optional: true },
  {
    key: "difficulty",
    label: "Náročnost tras k tvé úrovni",
    kind: "choice",
    choices: [
      { value: "easy", label: "Moc lehké" },
      { value: "ok", label: "Akorát" },
      { value: "hard", label: "Moc těžké" },
    ],
  },
  { key: "venue", label: "Zázemí (doprava kola, ubytování, základna)", kind: "rating5" },
  { key: "guiding", label: "Guiding / vedení jízd", kind: "rating5" },
  { key: "guiding_note", label: "Ke guidingu — pár slov (nepovinné)", kind: "text", optional: true },
  {
    key: "sponser",
    label: "Výživa SPONSER na místě — využil/a jsi? Chutnalo / pomohlo? (nepovinné)",
    kind: "text",
    optional: true,
  },
  { key: "nps", label: "Doporučil/a bys to kamarádovi?", kind: "nps" },
  {
    key: "would_return",
    label: "Přijel/a bys znovu? Na jaký formát?",
    kind: "choice",
    optional: true,
    choices: [
      { value: "km", label: "Km bloky" },
      { value: "social", label: "Social" },
      { value: "gravel", label: "Gravel" },
      { value: "combo", label: "Kombinace" },
    ],
  },
  {
    key: "value",
    label: "Cena vs. hodnota — férová?",
    kind: "choice",
    optional: true,
    choices: [
      { value: "yes", label: "Ano" },
      { value: "rather", label: "Spíš ano" },
      { value: "no", label: "Spíš ne" },
    ],
  },
];

// Osobní PS od Jana (v e-mailu i nad formulářem).
export const FEEDBACK_PS =
  "Díky, žes byl/a u úplně prvního ročníku. Testuju, fotím a chci to vypilovat — napiš mi na rovinu, co bylo super a co ne. Přečtu si každou odpověď osobně. — Jan";
