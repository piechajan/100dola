import Link from "next/link";

/**
 * SEO článek — high-conversion comparison.
 * Target keywords: "vlastní kolo malaga", "půjčovna kola malaga",
 * "porovnání vlastní kolo vs půjčovna", "cyklistika malaga cena".
 */
export default function VlastniKoloVsPujcovna() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Otázka <strong>„vyplatí se mi tahat vlastní kolo do Malagy, nebo si tam radši
          půjčit?"</strong> má jasnou matematickou odpověď. Záleží na <em>jak často jezdíš a jak moc ti
          záleží na tom, co máš pod sedlem</em>. Tady je rozklad, který jsme
          udělali pro dvě desítky zákazníků za posledních 18 měsíců.
        </p>

        <div className="bg-[#F0F4FF] border border-[#D6E1FB] rounded-2xl p-6 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-2">
            TL;DR
          </div>
          <ul className="space-y-1.5 text-sm text-[#1a1a2e]">
            <li>• <strong>1 cesta v životě</strong> → půjčovna 90 % případů</li>
            <li>• <strong>1–2 cesty / sezónu</strong> → záleží na úrovni (race / hobby), spočítej dopravu <em>včetně cesty na letiště a zpět</em></li>
            <li>• <strong>3+ cesty / sezónu</strong> → vlastní kolo + sklad jednoznačně levnější</li>
            <li>• <strong>Race carbon kolo (150 000 Kč+)</strong> → vždy vlastní, fit a komfort jsou nepřenositelné</li>
            <li>• <strong>Logistika na místě</strong> → kdo tě vyzvedne na letišti a hodí na ubytování i zpátky (s kufrem i bike boxem) — bez toho to v Malaze zaplatíš třikrát</li>
          </ul>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Co je v půjčovně realisticky
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Půjčovny v Malaze (top 5 zařízení, které doporučujeme) mají velmi solidní flotilu —
          Trek Domane, Specialized Roubaix, Cervélo Caledonia. Mid-tier modely, většinou nové
          generace, dobře udržované. Cena 200–400 € týdně podle modelu.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          <strong>Co tam ale není:</strong> tvoje sedlo (které ti sedí), tvoje řídítka v
          tvojí šířce, tvoje pedály, tvůj cyklocomputer. A hlavně tvoje <em>geometrie</em>.
          Půjčovna ti dá kolo M nebo L podle výšky — ale stack, reach, vidlice úhel, to vše
          je „blízko". Na hodinovou jízdu OK. Na 6 h v kopcích za den, 5 dní v týdnu? Záda
          a kolena to dají najevo.
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Konkrétní rozpočet pro 3 typické profily
        </h2>

        <h3 className="text-xl font-bold text-[#1a1a2e] mt-8 mb-3">Profil 1: „Jedu jednou za 2 roky"</h3>
        <p className="text-sm text-[#5A6480] mb-5">
          Týdenní výlet do Andalusie s partnerem, jezdíš jen v sezóně dovolených.
          <strong> Půjčovna jasně.</strong> Náklad ~300 € za týden, žádná logistika.
        </p>

        <h3 className="text-xl font-bold text-[#1a1a2e] mt-8 mb-3">Profil 2: „Jedu 2× zimou + 1× jaro"</h3>
        <p className="text-sm text-[#5A6480] mb-5">
          Cca 3 týdny ročně v Malaze, hobby cyklista 150–200 km/týden doma. Půjčovna stojí
          ~900 € za 3 týdny. 100dola: round-trip doprava 250 € + 4 měsíce skladu ~276 € = ~525 €. <strong>Levnější — a jezdíš na svém.</strong>
          Mínus komfort, plus radost.
        </p>

        <h3 className="text-xl font-bold text-[#1a1a2e] mt-8 mb-3">Profil 3: „4+ cesty + race víkendy"</h3>
        <p className="text-sm text-[#5A6480] mb-5">
          Závodník nebo serious hobbyista — 5–7 týdnů v Malaze. Půjčovna ~2 000 €. 100dola: round-trip 250 € + sklad na celou sezónu ~449 € = ~700 €. <strong>Úspora ~1 300 € + vlastní race kolo.</strong>
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Skrytá hodnota: fit a kontinuita
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Peníze jsou jen jedna část. Druhá je <strong>tréninková kontinuita</strong>.
          Pokud trénuješ FTP, threshold, intervaly — výsledky jsou srovnatelné jen na
          srovnatelném vybavení. Půjčovna ti dá kolo s jinou tuhostí rámu, jinou kapotáží
          pedálu, jiným sedlem. Watty se měří odlišně, fit je jiný, motivace pak klesá.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-8">
          Stoupání Pico Veleta v lednu a ve březnu na stejném kole je jediný způsob, jak
          objektivně srovnat výkon. Plus pamatuješ na svoje kolo — bikefit, nastavení
          výšky, brzdy, řazení. Žádný „a teď to musím překontrolovat".
        </p>

        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#3B7CF4] text-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-black mb-2">Spočítáš si to a chceš převézt kolo?</h2>
          <p className="text-sm text-white/90 mb-5">
            Konkrétní nabídka do 24 h. Vezeme aktuálně silnice, gravel, MTB, triatlon — kolo
            i tvoje vybavení (helma, tretry, šaty).
          </p>
          <Link
            href="/malaga#poptat"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Poptat dopravu →
          </Link>
        </div>

        <Link
          href="/clanky/doprava-kola-do-malagy"
          className="block bg-white border border-[#E2E6F3] rounded-2xl p-5 hover:border-[#E8431A]/40 transition-colors"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-2">
            Souvisí
          </div>
          <h3 className="text-base font-black text-[#1a1a2e] mb-1">
            Doprava kola do Malagy: krok po kroku
          </h3>
          <p className="text-xs text-[#5A6480]">
            Jak proces vypadá, kolik stojí, co je v jednotlivých balíčcích.
          </p>
        </Link>
      </div>
    </article>
  );
}
