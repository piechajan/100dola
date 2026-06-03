import Link from "next/link";

/**
 * SEO článek — engagement traffic + community magnet.
 * Target keywords: "strava segment šternberk", "strava klub olomoucký kraj",
 * "kde jezdit kolo šternberk", "strava cyklistický klub česko".
 */
export default function StravaSegmentSternberk() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Pokud jezdíš na kole v <strong>Olomouckém kraji</strong> a chceš měřit svoji pokroku
          (nebo se prát s lokálními výkonostními matadory), <strong>Strava segmenty</strong> jsou
          jediný oficiální způsob jak to dělat. V tomto článku najdeš výběr nejhezčích segmentů
          mezi Šternberkem, Olomoucí a Jeseníky, plus jak najít náš klub <strong>Open Miles
          Clinic</strong> a jezdit s námi pravidelně.
        </p>

        <div className="bg-[#E0F2F7] border border-[#2EAA6E]/30 rounded-2xl p-6 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2EAA6E] mb-2">
            Open Miles Clinic — náš Strava klub
          </div>
          <p className="text-sm text-[#1a1a2e] mb-3">
            Šternberk + Olomoucký kraj cyklistická komunita. Pravidelné rides úterý + sobota,
            sezonní výjezdy do Jeseníků, group rides na ISAAC víkendu.
          </p>
          <a
            href="https://www.strava.com/clubs/open-miles-clinic"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2EAA6E] text-white text-xs font-bold hover:opacity-90"
          >
            Připojit se na Stravě →
          </a>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          5 segmentů co máš musí jet
        </h2>

        <h3 className="text-xl font-bold text-[#1a1a2e] mt-8 mb-3">1. Šternberk → Pradědsko (66 km / 1 200 m)</h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Klasický okruh přes Šumvald, Rejvíz, Karlovu Studánku. <strong>QOM hot zone</strong> — držitelé
          rekordů sub 2:30, prvních deset Olomouckého kraje.
        </p>

        <h3 className="text-xl font-bold text-[#1a1a2e] mt-8 mb-3">2. Sovinec stoupání (3,8 km / 280 m, 7,4 % průměr)</h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Krátký, ale ostrý kopec. Top 10 lokálních jezdců se vejde do 12 minut. Trénink na FTP,
          pro intervalové sady ideální (dvě / tři opakování s návratem).
        </p>

        <h3 className="text-xl font-bold text-[#1a1a2e] mt-8 mb-3">3. Olomouc → Velký Kosíř</h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Nejvyšší bod severovýchodně od Olomouce. Široký asfalt, krásná vyhlídka. Po sezóně
          (květen–září) bývá hodně provozu — radíme jet ráno.
        </p>

        <h3 className="text-xl font-bold text-[#1a1a2e] mt-8 mb-3">4. Velká Kotlina gravel okruh (52 km, 1 100 m)</h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Gravel klasika — Bruntál, Vrbno pod Pradědem, Karlova Studánka, návrat. Mix asfalt
          + štěrk + lesní cesty. Pro Torus Xplore nebo Kaon ideální.
        </p>

        <h3 className="text-xl font-bold text-[#1a1a2e] mt-8 mb-3">5. Hostýnské vrchy → Vsetín</h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Pro silniční jezdce z Valašska — od Hostýna přes Bystřice, Valašské Meziříčí, Vsetín.
          Bonus trasa pro ty co jezdí gravel + silnici v jednom týdnu.
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Jak najít aktivní cyklisty v okolí
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Strava má dvě funkce, které využíváme:
        </p>
        <ul className="space-y-3 text-base text-[#5A6480] mb-8 ml-5 list-disc">
          <li>
            <strong>Heatmap</strong> — vidíš na mapě, kde jezdí nejvíc lidí. V Olomouckém
            kraji jsou hot zones: Šternberk → Sovinec, Velký Kosíř, Hostýnské vrchy. Mimo
            tyto úseky je ticho — což je tvoje volba podle preference.
          </li>
          <li>
            <strong>Local Legends</strong> — kdo zvládl konkrétní segment nejvíc často za 90 dní. Občas
            to potkáme — pokud chceš jet s někým, kdo úsek <em>opravdu zná</em>, sleduj jeho
            profil.
          </li>
          <li>
            <strong>Clubs</strong> — Open Miles Clinic je oficiální klub. Při rides dostávají
            členové výzvy, exkluzivní events, ISAAC víkend pozvánky.
          </li>
        </ul>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Co Strava nepokrývá (a kde my pomáháme)
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Strava ukazuje data — ne kontakt. Pokud chceš jezdit s lidmi naživo:
        </p>
        <ul className="space-y-2 text-base text-[#5A6480] mb-8 ml-5 list-disc">
          <li><strong>Naše group rides</strong> — úterý (rychlejší) + sobota (rodinný formát). Sraz v Šternberku.</li>
          <li><strong>ISAAC víkend</strong> — 1× ročně květen, otevřený pro nečleny.</li>
          <li><strong>Zimní výjezdy do Malagy</strong> — 1× měsíčně listopad–březen, pro Open Miles Clinic členy zvýhodněně.</li>
        </ul>

        <div className="bg-gradient-to-br from-[#2EAA6E] to-[#1A8A50] text-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-black mb-2">Připoj se k Open Miles Clinic</h2>
          <p className="text-sm text-white/90 mb-5">
            Strava klub + pravidelné rides + sezonní výjezdy. Otevřené pro všechny od hobby
            cyklisty po závodníky.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-bold hover:opacity-90"
          >
            Co je Open Miles Clinic →
          </Link>
        </div>
      </div>
    </article>
  );
}
