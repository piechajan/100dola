// Údaje o provozovateli a kamenné prodejně. Používá se ve footeru, legal
// stránkách, kontaktu, JSON-LD strukturovaných datech a emailech.

export const COMPANY = {
  name: "FUTUNATU s.r.o.",
  ico: "07376766",
  dic: "CZ07376766",
  vatPayer: true,
  registeredOffice: {
    streetAddress: "Rybná 716/24",
    addressLocality: "Praha 1",
    postalCode: "11000",
    addressCountry: "CZ",
    addressRegion: "Praha",
  },
  /** Zápis v obchodním rejstříku. */
  registration: "vedená u Městského soudu v Praze, oddíl C, vložka 299814",
  contact: {
    person: "Jan Piecha",
    role: "Zakladatel",
    email: "info@100dola.com",
    phone: "+420 739 045 057",
    phoneIntl: "+420739045057",
  },
} as const;

export const STERNBERK_STORE = {
  name: "100dola sport · Šternberk",
  streetAddress: "Partyzánská 2",
  addressLocality: "Šternberk",
  postalCode: "78501",
  addressCountry: "CZ",
  addressRegion: "Olomoucký kraj",
  landmark: "vedle kavárny Namístě",
  // Otevírací hodiny — Jan upřesní v dashboardu/datech. Pro teď jen víkend
  // ISAAC testu (29.–31. 5. 2026), jinak otevřeno na požádání.
  hoursNote: "Otevřeno během akcí a po předchozí domluvě.",
  hoursStructured: [],
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Partyz%C3%A1nsk%C3%A1+2%2C+%C5%A0ternberk+78501&output=embed",
  mapsLinkUrl:
    "https://www.google.com/maps/place/Partyz%C3%A1nsk%C3%A1+2,+785+01+%C5%A0ternberk/",
} as const;
