// Jádro Scott catalog builderu: parser spec tabulky (scott-sports EN → CZ) +
// formatter Product literalu v našem schématu. Deterministické, bez side-efektů.

// EN label (scott-sports) → CZ label. null/SKIP = zahodit.
export const SPEC_CZ = {
  FRAME: "Rám", TRAVEL: "Zdvih", FORK: "Vidlice", "REAR SHOCK": "Zadní tlumič",
  "REMOTE SYSTEM": "Ovládání tlumení", "DRIVE UNIT": "Motor", BATTERY: "Baterie",
  DISPLAY: "Displej", CHARGER: "Nabíječka", "REAR DERAILLEUR": "Přehazovačka",
  "FRONT DERAILLEUR": "Přesmykač", SHIFTERS: "Řazení", CRANKSET: "Kliky",
  CHAINGUIDE: "Vodítko řetězu", CHAINRING: "Převodník", "BB-SET": "Středové složení",
  CHAIN: "Řetěz", CASSETTE: "Kazeta", BRAKES: "Brzdy", ROTOR: "Kotouče",
  "FRONT DISC ROTOR": "Přední kotouč", "REAR DISC ROTOR": "Zadní kotouč",
  GRIPS: "Omotávka / gripy", HANDLEBAR: "Řídítka", "H'STEM": "Představec", STEM: "Představec",
  SEATPOST: "Sedlovka", SEAT: "Sedlo", HEADSET: "Hlavové složení", WHEELSET: "Kola",
  "FRONT HUB": "Přední náboj", "REAR HUB": "Zadní náboj", SPOKES: "Dráty",
  "FRONT RIM": "Přední ráfek", "REAR RIM": "Zadní ráfek", "FRONT WHEEL": "Přední kolo",
  "REAR WHEEL": "Zadní kolo", "FRONT TIRE": "Přední plášť", "REAR TIRE": "Zadní plášť",
  TIRES: "Pláště", "APPROX WEIGHT IN KG": "Hmotnost (kg)",
};
const SKIP = new Set(["EXTRAS", "ACCESSORIES", "APPROX WEIGHT IN LBS"]);
const KNOWN = new Set([...Object.keys(SPEC_CZ), ...SKIP]);

/**
 * Parse raw spec blok ze scott-sports (label na řádku, hodnota na následujících
 * řádcích do dalšího známého labelu). Vrací [{label, value}] v CZ.
 */
export function parseSpecBlock(block) {
  const lines = String(block).split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = [];
  let cur = null;
  let val = [];
  const flush = () => {
    if (cur && val.length && SPEC_CZ[cur]) rows.push({ label: SPEC_CZ[cur], value: val.join(" · ") });
  };
  for (const l of lines) {
    if (KNOWN.has(l.toUpperCase())) {
      flush();
      cur = l.toUpperCase();
      val = [];
    } else if (cur) {
      val.push(l);
    }
  }
  flush();
  // dedupe podle labelu (zachovej první)
  const seen = new Set();
  return rows.filter((r) => (seen.has(r.label) ? false : seen.add(r.label)));
}

/** Escapuj do double-quoted TS stringu. */
export function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Postav Product literal (string) z modelu. `id` přiděluje volající (1000+).
 * Model schema viz README.
 */
export function emitProduct(m, id) {
  const specTable = m.specTable ?? (m.specBlock ? parseSpecBlock(m.specBlock) : []);
  const hasDiscount = m.moc && m.price && m.moc > m.price;
  const badges = [];
  if (m.badge) badges.push(m.badge); // např. "Novinka", "Aero", "Gravel"
  if (hasDiscount) badges.push("Sleva");

  const q = (v) => `"${esc(v)}"`;
  const lines = [];
  lines.push("  {");
  lines.push(`    id: ${id},`);
  lines.push(`    name: ${q(m.name)},`);
  lines.push(`    slug: ${q(m.slug)},`);
  lines.push(`    year: ${m.year ? q(m.year) : "null"},`);
  lines.push(`    brand: "scott",`);
  lines.push(`    categoryId: ${q(m.categoryId)},`);
  if (m.secondaryCategoryIds?.length) {
    lines.push(`    secondaryCategoryIds: [${m.secondaryCategoryIds.map(q).join(", ")}],`);
  }
  lines.push(`    priceWithVat: ${m.price},`);
  if (hasDiscount) lines.push(`    originalPriceWithVat: ${m.moc},`);
  lines.push(`    vatRate: 21,`);
  lines.push(`    bulky: true,`);
  lines.push(`    badges: [${badges.map(q).join(", ")}],`);
  lines.push(`    note: ${q(m.note ?? "")},`);
  lines.push(`    photo: ${q(m.photo)},`);
  if (m.gallery?.length) {
    lines.push(`    gallery: [${m.gallery.map(q).join(", ")}],`);
  }
  const specs = m.specs ?? deriveSpecs(specTable);
  lines.push(`    specs: [${specs.map(q).join(", ")}],`);
  if (specTable.length) {
    lines.push(`    specTable: [`);
    for (const r of specTable) lines.push(`      { label: ${q(r.label)}, value: ${q(r.value)} },`);
    lines.push(`    ],`);
  }
  if (m.colorOptions?.length) {
    lines.push(`    colorOptions: [`);
    for (const c of m.colorOptions) lines.push(`      { name: ${q(c.name)}, photo: ${q(c.photo)} },`);
    lines.push(`    ],`);
  }
  if (m.variants?.length) {
    lines.push(`    variants: [`);
    for (const v of m.variants) {
      const parts = [`size: ${q(v.size)}`, `isInStock: ${v.isInStock ? "true" : "false"}`];
      if (v.color) parts.push(`color: ${q(v.color)}`);
      parts.push(`availability: ${q(v.isInStock ? "Skladem" : "Na objednávku")}`);
      lines.push(`      { ${parts.join(", ")} },`);
    }
    lines.push(`    ],`);
  }
  if (m.ebikeBatteryWh) lines.push(`    ebikeBatteryWh: ${m.ebikeBatteryWh},`);
  if (m.gender) lines.push(`    gender: ${q(m.gender)},`);
  if (m.useCase) lines.push(`    useCase: ${q(m.useCase)},`);
  if (m.color) lines.push(`    color: ${q(m.color)},`);
  if (m.colorFamily) lines.push(`    colorFamily: ${q(m.colorFamily)},`);
  lines.push(`    stockStatus: "on_request",`);
  lines.push(
    `    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě je jedna z možností. Termín i cenu potvrdíme po objednávce.",`,
  );
  lines.push(`    fulfillment: "own",`);
  lines.push("  },");
  return lines.join("\n");
}

/** Odvoď 3 highlight specy z tabulky (pro kartu), když je model nedodá. */
function deriveSpecs(specTable) {
  const get = (label) => specTable.find((r) => r.label === label)?.value?.split(" · ")[0];
  const out = [];
  const drive = get("Motor");
  const groupset = get("Přehazovačka") || get("Řazení");
  const wheels = get("Kola");
  const tire = get("Přední plášť") || get("Pláště");
  const frame = get("Rám");
  const weight = specTable.find((r) => r.label === "Hmotnost (kg)")?.value;
  if (drive) out.push(drive);
  if (groupset) out.push(groupset);
  if (wheels) out.push(tire ? `${wheels} · ${tire}` : wheels);
  if (out.length < 3 && frame) out.push(weight ? `${frame} · ${weight} kg` : frame);
  return out.slice(0, 3);
}
