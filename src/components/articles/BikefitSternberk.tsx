import Link from "next/link";

/**
 * SEO článek — local + service magnet.
 * Target keywords: "bikefit šternberk", "bikefit olomouc",
 * "bikefit cena", "měření kola šternberk", "fit kola olomoucký kraj".
 */
export default function BikefitSternberk() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          <strong>Bikefit</strong> je systematické nastavení kola tak, aby <em>kolo sedělo
          tobě</em>, ne abys ty sedal kolu. Ve <strong>Šternberku</strong> ho děláme
          v 100dola sport (Partyzánská 2), v dosahu Olomouc, Valašské Meziříčí, Vsetín,
          Přerov, Prostějov. Tento článek vysvětluje, kdy se to vyplatí, co konkrétně
          měříme, kolik to stojí a co můžeš čekat.
        </p>

        <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-2">
            Rychlá orientace
          </div>
          <ul className="space-y-1.5 text-sm text-[#1a1a2e]">
            <li>• <strong>Délka:</strong> 90–120 minut</li>
            <li>• <strong>Cena:</strong> od 2 500 Kč (basic) / 4 500 Kč (full s motion capture)</li>
            <li>• <strong>Kdy přijít:</strong> nové kolo, dlouhodobé bolesti, výkonový stagnant, příprava na delší výlet</li>
            <li>• <strong>Místo:</strong> Šternberk, Partyzánská 2 (vedle Námistě)</li>
            <li>• <strong>Termíny:</strong> rezervace 2–3 týdny dopředu</li>
          </ul>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Kdy bikefit potřebuješ
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Nečekej až tě začnou bolet záda. Tři typické signály:
        </p>
        <ul className="space-y-2 text-base text-[#5A6480] mb-8 ml-5 list-disc">
          <li><strong>Bolesti</strong> — kolena (špatná výška sedla nebo cleat), spodní záda (vidlice úhel), zápěstí (řídítka), krk (stack)</li>
          <li><strong>Stagnace výkonu</strong> — watts/km nerostou navzdory tréninku. Často ergonomie blokuje aerobní práci.</li>
          <li><strong>Necitlivost</strong> — prstů, perinea, sedacích kostí. Sedlo nebo poloha pánve.</li>
        </ul>
        <p className="text-base text-[#5A6480] leading-relaxed mb-8">
          Plus: <strong>nové kolo</strong>. Cena bikefit (~2 500–4 500 Kč) je malá ve srovnání
          s cenou kola (50 000+) a riziko že 18 měsíců jezdíš špatně nastavený se vyplatí
          jednou.
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Co konkrétně měříme
        </h2>
        <div className="space-y-5 mb-8">
          {[
            {
              t: "Statické rozměry",
              d: "Inseam, výška, šířka ramen, paže, trup, flexibilita zad a hamstringů. Statický základ pro výchozí setup.",
            },
            {
              t: "Saddle height + setback",
              d: "Výška sedla podle Lemond formule, korigovaná podle ohýbání kolena při dolní úvrati pedálu (cíl 25–35°). Setback v poměru k tibiální tuberositě.",
            },
            {
              t: "Reach + drop",
              d: "Vzdálenost sedlo–řídítka a výškový rozdíl. Pohodlí + aero potřebují kompromis. Měříme dynamicky, ne jen měřáčkem.",
            },
            {
              t: "Cleat alignment",
              d: "Pozice cleatu pod botou — předozadní (Q faktor), úhel (Q angle). Špatně nastavený cleat = bolesti kolen do 200 km.",
            },
            {
              t: "Motion capture (full balíček)",
              d: "Boční video v 60 fps, analýza úhlu kolene, kyčle, kolena, kotníku. Vidíš na vlastním záběru, kde tělo pracuje neefektivně.",
            },
          ].map((item) => (
            <div key={item.t}>
              <h3 className="text-base font-bold text-[#1a1a2e] mb-1">{item.t}</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Jak proces probíhá
        </h2>
        <ol className="space-y-3 text-base text-[#5A6480] mb-8 ml-6 list-decimal">
          <li>Dorazíš s kolem a vybavením (tretry, kraťasy). Dáme ti čas se převléknout.</li>
          <li>Pohovor — bolesti, cíle, kde plánuješ jezdit, jaký styl.</li>
          <li>Statické měření na měřáku — 20 min.</li>
          <li>Posazení na kolo, nastavení podle dat. Test jízda 10 min na trenažeru.</li>
          <li>Korekce + video analýza (full balíček).</li>
          <li>Závěrečná zpráva s konkrétními rozměry — kdyby sis kolo vyměnil, máš čísla připravená.</li>
        </ol>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Ceník a balíčky
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <div className="bg-white border-2 border-[#E2E6F3] rounded-2xl p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">
              Basic
            </div>
            <div className="text-3xl font-black text-[#1a1a2e] mb-1">2 500 Kč</div>
            <div className="text-xs text-[#9AA3C2] mb-4">90 minut</div>
            <ul className="space-y-2 text-sm text-[#1a1a2e]">
              <li>✓ Statické měření + bikefit do číslic</li>
              <li>✓ Nastavení sedla, řídítek, cleatů</li>
              <li>✓ Test jízda + korekce</li>
              <li>✓ Závěrečná zpráva s rozměry</li>
            </ul>
          </div>
          <div className="bg-[#1a1a2e] text-white rounded-2xl p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Full + Motion Capture
            </div>
            <div className="text-3xl font-black mb-1">4 500 Kč</div>
            <div className="text-xs text-white/60 mb-4">120 minut</div>
            <ul className="space-y-2 text-sm">
              <li>✓ Vše z Basic</li>
              <li>✓ Boční video 60 fps analýza pedálování</li>
              <li>✓ Měření úhlu kolene + kyčle dynamicky</li>
              <li>✓ Print záběrů s anotacemi (pro lepší pochopení)</li>
              <li>✓ 30 dní follow-up — pokud něco štípe, vrátíš se na donastavení zdarma</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#3B7CF4] to-[#2563CC] text-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-black mb-2">Rezervuj si bikefit ve Šternberku</h2>
          <p className="text-sm text-white/90 mb-5">
            Termín si domluvíme přes WhatsApp nebo telefon. Standardně 2–3 týdny dopředu —
            v sezóně dřív.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-bold hover:opacity-90"
          >
            Kontakt →
          </Link>
        </div>

        <Link
          href="/clanky/velikost-kola"
          className="block bg-white border border-[#E2E6F3] rounded-2xl p-5 hover:border-[#3B7CF4]/40 transition-colors"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-2">
            Souvisí
          </div>
          <h3 className="text-base font-black text-[#1a1a2e] mb-1">
            Jak vybrat správnou velikost kola
          </h3>
          <p className="text-xs text-[#5A6480]">
            Před bikefitem si přečti jak změřit doma. Inseam, výška, paže.
          </p>
        </Link>
      </div>
    </article>
  );
}
