import Link from "next/link";
import Image from "next/image";

const SPARK_PHOTO = "/media/scott-2027/spark-rc-sl.webp";

interface SpecRow {
  label: string;
  gen4: string;
  gen5: string;
  delta?: string;
}

const SPECS: SpecRow[] = [
  {
    label: "Označení generace",
    gen4: "Spark RC Gen4 (2022–2026)",
    gen5: "Spark RC Gen5 (2027)",
  },
  {
    label: "Rám — váha (top model)",
    gen4: "~1 545 g (HMX)",
    gen5: "1 427 g (HMX-SL)",
    delta: "−118 g (top rám)",
  },
  {
    label: "Zdvih (fork/rear)",
    gen4: "120 / 120 mm",
    gen5: "120 / 120 mm",
    delta: "Beze změny",
  },
  {
    label: "Tlumič",
    gen4: "Integrovaný Twin-Loc, Fox Float DPS Nude T",
    gen5: "Integrovaný Twin-Loc, Fox Float DPS Nude T (rev.)",
    delta: "Drobné revize, stejná logika",
  },
  {
    label: "Kinematika",
    gen4: "Spark Virtual 4-bar",
    gen5: "Spark Virtual 4-bar — přepracovaná progrese",
    delta: "Mírně progresivnější křivka (anti-squat)",
  },
  {
    label: "Vnitřní úložiště (rám)",
    gen4: "Žádné — bidon nebo bag",
    gen5: "Save-the-Day kompartment v hlavě rámu",
    delta: "Nová věc",
  },
  {
    label: "Kokpit / vedení kabelů",
    gen4: "Externí kabely u hlavy, řídítka + představec separátně",
    gen5: "Syncros iC-M100-SL integrovaný kokpit, plná průchozí trasa",
    delta: "Cleaner, lehčí, dražší kompabilita",
  },
  {
    label: "Sedlovka",
    gen4: "Většinou 100–125 mm dropper, omezená délka",
    gen5: "Až 200 mm dropper, podpora delších zdvihů",
    delta: "Lepší pro modernější XC styl",
  },
  {
    label: "Pneumatiky default",
    gen4: "29×2.25–2.35",
    gen5: "29×2.25–2.4 (širší rozsah)",
    delta: "Drobně širší rozsah",
  },
  {
    label: "Geometrie (head angle)",
    gen4: "67.2°",
    gen5: "66.8° (top variants)",
    delta: "−0.4° (stabilnější ve sjezdech)",
  },
  {
    label: "Reach (M)",
    gen4: "440 mm",
    gen5: "445 mm",
    delta: "+5 mm (modernější)",
  },
  {
    label: "Top elektronický groupset",
    gen4: "SRAM XX1 Eagle AXS (12s)",
    gen5: "SRAM XX SL Eagle Transmission (T-Type)",
    delta: "Transmission = přímý mount, vyšší tuhost",
  },
  {
    label: "Kola top model",
    gen4: "Syncros Silverton SL 1.0",
    gen5: "Syncros Silverton SL 2.0",
    delta: "Nový lay-up, mírně lehčí",
  },
  {
    label: "Pre-order okno",
    gen4: "Standardní in-stock cyklus",
    gen5: "Předobjednávky otevřené, alokace omezená",
  },
];

export default function ScottSparkRC2026vs2027() {
  return (
    <article className="max-w-[820px] mx-auto px-4 md:px-6 pb-24">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-[#EAF1FE] via-[#F7F9FF] to-white rounded-2xl overflow-hidden mb-8">
        <Image
          src={SPARK_PHOTO}
          alt="Scott Spark RC Gen5 vs Gen4"
          fill
          sizes="(min-width: 1024px) 820px, 100vw"
          className="object-contain p-8 md:p-12"
          priority
        />
      </div>

      <section className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">TL;DR</h2>
        <p className="text-base md:text-lg text-[#1a1a2e] leading-relaxed mb-3">
          Gen5 (modelový rok 2027) je první reálný redesign Sparku po čtyřech letech.
          Rám je lehčí (top HMX-SL 1 427 g), dostal vnitřní úložiště, integrovaný Syncros
          kokpit a delší dropper. Kinematika je z 95 % stejná, takže ti, co milují Spark RC
          jak je, neuvidí překvapení v jízdě. Co se mění je <strong>cleanost packagingu</strong>
          {" "}(jeden vodič, jedno úložiště) a <strong>geometrická maturita</strong>{" "}
          (delší reach, mírně líny head angle).
        </p>
        <p className="text-sm text-[#5A6480]">
          Vyplatí se upgrade? Pokud máš Gen3 nebo starší — ano, posunul ses o dvě generace.
          Pokud máš Gen4 z roku 2024–2025 a kolo ti sedí, klid. Skok není revoluce, je to
          zralá iterace.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          Side-by-side: Gen4 (2026) vs Gen5 (2027)
        </h2>
        <div className="bg-white border border-[#E2E6F3] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FF] border-b border-[#E2E6F3]">
                <th className="text-left p-3 md:p-4 font-bold text-[#5A6480] w-1/4">Parametr</th>
                <th className="text-left p-3 md:p-4 font-bold text-[#1a1a2e]">Gen4 (2026)</th>
                <th className="text-left p-3 md:p-4 font-bold text-[#1a1a2e]">Gen5 (2027)</th>
              </tr>
            </thead>
            <tbody>
              {SPECS.map((s) => (
                <tr key={s.label} className="border-b border-[#E2E6F3] last:border-0 align-top">
                  <td className="p-3 md:p-4 text-[#5A6480] font-semibold">{s.label}</td>
                  <td className="p-3 md:p-4 text-[#1a1a2e]">{s.gen4}</td>
                  <td className="p-3 md:p-4 text-[#1a1a2e]">
                    {s.gen5}
                    {s.delta && (
                      <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#3B7CF4]">
                        {s.delta}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          Klíčové změny v praxi
        </h2>

        <h3 className="text-lg font-black text-[#1a1a2e] mt-6 mb-2">1. Save-the-Day úložiště</h3>
        <p className="text-sm md:text-base text-[#1a1a2e] leading-relaxed mb-2">
          Na maratonu nebo dlouhém XC tréninku máš v rámu prostor pro duši, CO2, multitool a
          tubeless plug. Žádný bag pod sedlem, žádný stresor, že ti něco vypadne. Stejný princip
          jako Specialized SWAT, ale poprvé u Scotta.
        </p>

        <h3 className="text-lg font-black text-[#1a1a2e] mt-6 mb-2">
          2. Syncros iC-M100-SL integrovaný kokpit
        </h3>
        <p className="text-sm md:text-base text-[#1a1a2e] leading-relaxed mb-2">
          Řídítka + představec v jednom kuse, plně průchozí kabely. Cleaner vzhled, mírně
          lehčí, ale upgrade na jinou šířku/délku představce znamená kompletní výměnu (~12 000
          Kč) místo $50 představce.
        </p>

        <h3 className="text-lg font-black text-[#1a1a2e] mt-6 mb-2">
          3. SRAM Transmission (T-Type) ve výbavě
        </h3>
        <p className="text-sm md:text-base text-[#1a1a2e] leading-relaxed mb-2">
          Top varianty (SL, World Cup, EVO) jezdí na SRAM XX SL Eagle Transmission s přímým
          mountem (bez patky). Praktická výhoda: tužší aktuace, méně problémů s rozjetím
          patky. Servisní nevýhoda: výměna rámu při zlomené patce už ne — namísto toho měníš
          přímo díly hlavičky T-Type.
        </p>

        <h3 className="text-lg font-black text-[#1a1a2e] mt-6 mb-2">
          4. Delší dropper (až 200 mm)
        </h3>
        <p className="text-sm md:text-base text-[#1a1a2e] leading-relaxed mb-2">
          Scott uznal, že moderní XC se jezdí s 150+ mm dropperem. Nová geometrie kolem
          sedlovky podporuje až 200 mm zdvih i ve velikosti M. Pokud rád zlevě posedu, tohle
          je největší ergonomický posun.
        </p>

        <h3 className="text-lg font-black text-[#1a1a2e] mt-6 mb-2">
          5. Geometrie — −0.4° head angle, +5 mm reach
        </h3>
        <p className="text-sm md:text-base text-[#1a1a2e] leading-relaxed mb-2">
          Drobné, ale konzistentní s trendem: stabilnější ve sjezdech, prostornější v stoupání
          z pozice „sedím dopředu". Nepřevrátíš tím XC v trail, ale 100 km maraton (Mont-Sainte-
          Anne, Lenzerheide profil) ti dá víc komfortu.
        </p>
      </section>

      <section className="mb-12 bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          Mám Gen4. Vyplatí se upgrade?
        </h2>
        <p className="text-base text-[#1a1a2e] leading-relaxed mb-4">
          Krátká odpověď: <strong>většinou ne</strong>, pokud jezdíš na něm pravidelně a fittuje
          ti.
        </p>
        <ul className="space-y-2 text-sm md:text-base text-[#1a1a2e]">
          <li className="flex gap-2">
            <span className="text-[#3B7CF4] font-black">✓</span>
            <span>
              <strong>Upgrade dává smysl</strong>, pokud chceš úložiště v rámu, plánuješ
              dlouhé maratony nebo etapové závody (kde každý gram a každý menší stresor
              hraje roli).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#3B7CF4] font-black">✓</span>
            <span>
              <strong>Upgrade dává smysl</strong>, pokud ti Gen4 nesedí v reachu — Gen5 přidává
              5 mm a moderní progresivní geometrii.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#E8431A] font-black">✗</span>
            <span>
              <strong>Upgrade nedává smysl</strong>, pokud jen chceš lehčí kolo — rozdíl 118 g
              v top rámu se ti nevrátí pocitově ani časově (ostatní díly mají vliv větší).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#E8431A] font-black">✗</span>
            <span>
              <strong>Upgrade nedává smysl</strong>, pokud máš Gen4 s SRAM XX1 AXS — Gen5 na
              Transmission je sice tužší, ale rozdíl v jízdě je marginální (servis je dražší).
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          Jaký Spark RC mám? (rychlá identifikace)
        </h2>
        <div className="text-sm md:text-base text-[#1a1a2e] leading-relaxed space-y-3">
          <p>
            <strong>Gen5 (2027)</strong> — integrovaný kokpit Syncros iC-M100-SL, kompartment v
            horní hlavě rámu, geometrie s vlepenou destičkou „Spark Gen5".
          </p>
          <p>
            <strong>Gen4 (2022–2026)</strong> — separátní řídítka + představec, žádný interní
            sklad, geometrie head angle 67.2°.
          </p>
          <p>
            <strong>Gen3 (2017–2021)</strong> — bez Twin-Loc remote v současné podobě, jiná
            kinematika, hlava rámu rovná.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#EAF1FE] via-white to-[#F7F9FF] border border-[#C9DCFC] rounded-2xl p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-3">
          Chceš Spark RC 2027 ve své garáži?
        </h2>
        <p className="text-sm md:text-base text-[#1a1a2e] leading-relaxed mb-5">
          Předobjednávky jsou otevřené pro varianty SL, World Cup, EVO, Comp. Detailní specs,
          fotky a poptávku najdeš na hlavní stránce Spark RC platformy. Alokace je omezená — Scott
          zatím nepotvrdil přesné počty pro střední Evropu.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/clanky/scott-2027/scott-spark-rc-2027"
            className="bg-[#3B7CF4] hover:bg-[#5C92F6] text-white font-bold text-sm px-5 py-3 rounded-xl transition text-center"
          >
            Detail Spark RC 2027 →
          </Link>
          <Link
            href="/clanky/scott-2027/srovnani?a=scott-spark-rc-2027__spark-rc-sl&b=scott-spark-rc-2027__spark-rc-world-cup"
            className="bg-white border border-[#C9DCFC] hover:border-[#3B7CF4] text-[#1a1a2e] font-bold text-sm px-5 py-3 rounded-xl transition text-center"
          >
            Srovnání variant SL vs World Cup
          </Link>
        </div>
      </section>
    </article>
  );
}
