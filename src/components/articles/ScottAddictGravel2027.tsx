import Link from "next/link";
import Image from "next/image";
import { getPlatformBySlug, formatVariantPrice } from "@/data/scott-2027";
import ArticleGallery from "./ArticleGallery";

/**
 * Přehled modelů Addict Gravel 2027 s prokliky na detailní stránku každé varianty
 * (specifikace, fotky, cena). Data-driven z SCOTT_2027 — jeden zdroj pravdy.
 */
function GravelModelGrid() {
  const platform = getPlatformBySlug("scott-addict-gravel");
  if (!platform) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-8">
      {platform.variants.map((v) => (
        <Link
          key={v.slug}
          href={`/clanky/scott-2027/${platform.slug}/${v.slug}`}
          className="group flex gap-4 items-center bg-white border border-[#E2E6F3] rounded-2xl p-3 hover:border-[#E8431A] hover:shadow-md transition"
        >
          <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-[#F0F2FA]">
            <Image src={v.photo} alt={`Scott ${v.name} 2027`} fill sizes="96px" className="object-contain p-1.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black text-[#1a1a2e] group-hover:text-[#E8431A] leading-tight">{v.name}</div>
            <div className="text-xs text-[#5A6480] mt-0.5 line-clamp-2">{v.groupset}</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-sm font-bold text-[#1a1a2e]">{formatVariantPrice(v)}</span>
              <span className="text-xs font-bold text-[#E8431A]">Detail →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/**
 * Scott Addict Gravel 2027 — magazínový článek + předobjednávkový hub.
 * Target keywords (CZ): "scott addict gravel 2027", "nový scott gravel", "scott addict gravel 57mm",
 * "scott addict gravel cena", "gravel kolo scott 2027", "scott addict gravel předobjednávka".
 */
export default function ScottAddictGravel2027() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-8">
          Scott právě představil <strong className="text-[#1a1a2e]">kompletně nový Addict Gravel 2027</strong> —
          a není to kosmetika. Prostup pneu vyskočil na <strong>57 mm</strong> (pojme i 2,2&quot; MTB plášť),
          rám HMX klesl <strong>pod 800 g</strong>, zadní část je o <strong>60 % poddajnější</strong> a
          nářadí i duše zmizely do rámu a řídítek. V tomhle textu projdeme techniku i zajímavosti — a u
          každého modelu najdeš proklik na <strong className="text-[#1a1a2e]">kompletní specifikaci a cenu</strong>.
        </p>

        {/* Cross-link na Scott 2027 hub */}
        <div className="bg-[#FFF3EE] border border-[#F5D2C4] rounded-xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#E8431A] mb-0.5">Celý Scott 2027 lineup</div>
            <div className="text-sm text-[#1a1a2e]">Gravel je jen část. Mrkni, co Scott chystá v MTB a na silnici.</div>
          </div>
          <Link href="/clanky/scott-2027" className="text-sm font-bold text-[#E8431A] hover:opacity-80 transition whitespace-nowrap">
            Otevřít přehled →
          </Link>
        </div>

        {/* Rychlá orientace */}
        <div className="bg-[#FFF3EE] border border-[#F5D2C4] rounded-2xl p-6 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-2">Rychlá orientace</div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li><strong>Co to je:</strong> kompletní redesign gravel platformy Scott Addict Gravel, modelový rok 2027.</li>
            <li><strong>Prostup pneu:</strong> 57 mm — pojme i 2,2&quot; MTB plášť (32&quot; verze zatím není).</li>
            <li><strong>Hmotnost rámu (M):</strong> HMX 794 g (−75 g), HMF 990 g. Kompletní kolo od 7,8 kg.</li>
            <li><strong>Řada:</strong> Premium → Addict 10 / 20 / 30 / 40 (SRAM RED/Force/Rival XPLR AXS nebo Shimano GRX).</li>
            <li><strong>Kde objednat:</strong>{" "}
              <a href="#predobjednavka" className="font-bold text-[#E8431A] underline hover:no-underline">přes formulář níže</a>{" "}
              nebo na prodejně 100dola sport ve Šternberku.
            </li>
          </ul>
        </div>

        {/* Hero — reálná fotka z našeho testu */}
        <figure className="my-10 -mx-6 md:-mx-12">
          <div className="relative aspect-[3/2] bg-[#F0F2FA] rounded-none md:rounded-2xl overflow-hidden">
            <Image src="/media/articles/scott-addict-gravel-2027/test/test-01.webp" alt="Scott Addict Gravel 2027 v černém provedení na lesní stezce — z našeho testu" fill sizes="(max-width: 768px) 100vw, 820px" className="object-cover" priority />
          </div>
          <figcaption className="text-xs text-[#9AA3C2] text-center mt-3 px-6">Nový Addict Gravel 2027 — širší, lehčí, poddajnější. Foto z našeho testu na Valašsku.</figcaption>
        </figure>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">57 mm prostup — gravel, který unese i MTB gumu</h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Největší změna je jasná na první pohled: <strong className="text-[#1a1a2e]">prostup pneumatik 57 mm</strong>.
          To už není &quot;širší gravel&quot; — to je terén. Nový Addict Gravel pobere i{" "}
          <strong>2,2&quot; MTB plášť</strong>, takže na hrubých šotolinách, kořenech a v blátě jedeš na objemu,
          který dřív patřil hardtailu. Sériově Scott obouvá Schwalbe G-One RX Pro 50c.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Zajímavost pro tech geeky: aby se tak objemná guma vešla, jsou{" "}
          <strong className="text-[#1a1a2e]">řetězové vzpěry u středu zúžené až na 8,5 mm</strong> — a přitom si
          drží délku 425 mm, stejnou jako silniční Addict. Výsledek je svižnost silničky s trakcí MTB.{" "}
          <span className="text-[#9AA3C2]">32&quot; (650b) verzi Scott zatím vynechal — čeká na širší podporu trhu.</span>
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">Komfort bez odpružení: +60 % flex vzadu</h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Scott záměrně <strong className="text-[#1a1a2e]">snížil celkovou tuhost rámu o necelých 5 %</strong> —
          což zní jako krok zpět, ale je to přesný záměr. Zadní část je s rigidní sedlovkou až{" "}
          <strong>o 60 % poddajnější</strong>, přední o 30 % (zahnuté nohy vidlice, tenčí hlavová trubka).
          Rám se přizpůsobuje nerovnostem, drží trakci a šetří tvoje ruce i záda na dlouhých dnech v sedle.
        </p>
        <div className="bg-[#FFF3EE] border-l-4 border-[#E8431A] p-5 my-8 rounded-r-xl">
          <p className="text-sm text-[#1a1a2e] leading-relaxed">
            <strong>Detail, který ocení nohy:</strong> košíky na láhve jsou přesunuté na vnitřek vidlice.
            Optimalizovaná poloha snižuje setrvačnost o 35 % — kolo se lépe hází do zatáček a rychleji mění směr.
          </p>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">Nářadí a duše zmizely do kola</h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Nový Addict Gravel má integrované úložiště <strong className="text-[#1a1a2e]">Syncros &quot;Save the Day&quot;</strong>{" "}
          přímo ve spodní trubce — duše, montpáky i mini pumpa jsou schované v rámu. A nejlepší part:{" "}
          <strong>v koncovkách řídítek</strong> je T25 klíč a tubeless opravný kit. Na trati tak vytáhneš nářadí,
          aniž bys sundával batoh nebo brašnu.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Scott navíc <strong className="text-[#1a1a2e]">sjednotil šrouby na T25</strong> (stem, řídítka, sedlovka,
          objímka, košíky) — jeden klíč na celé kolo. Volitelně se přidává i brašna na horní rámovou trubku se
          zapuštěnými šrouby a integrované zadní světlo do D-profilové karbonové sedlovky.
        </p>
        <figure className="my-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F0F2FA]">
              <Image src="/media/articles/scott-addict-gravel-2027/test/test-11.webp" alt="Otevřený úložný port ve spodní trubce Scott Addict Gravel 2027" fill sizes="(max-width: 768px) 50vw, 400px" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F0F2FA]">
              <Image src="/media/articles/scott-addict-gravel-2027/test/test-10.webp" alt="Vytažený Syncros Save the Day kit s nářadím, pumpou a duší" fill sizes="(max-width: 768px) 50vw, 400px" className="object-cover" />
            </div>
          </div>
          <figcaption className="text-xs text-[#9AA3C2] text-center mt-3">Vlevo otevřený úložný port ve spodní trubce, vpravo vytažený Save the Day kit — duše, mini pumpa i montpáky pohromadě.</figcaption>
        </figure>

        {/* Foto dvojice — z testu (bikepacking setup + fialové provedení) */}
        <div className="grid grid-cols-2 gap-3 my-8">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F0F2FA]">
            <Image src="/media/articles/scott-addict-gravel-2027/test/test-03.webp" alt="Scott Addict Gravel 2027 s bikepacking brašnami — z našeho testu" fill sizes="(max-width: 768px) 50vw, 410px" className="object-cover" />
          </div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F0F2FA]">
            <Image src="/media/articles/scott-addict-gravel-2027/test/test-05.webp" alt="Scott Addict Gravel 2027 ve fialovém provedení — z našeho testu" fill sizes="(max-width: 768px) 50vw, 410px" className="object-cover" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">Už jsme ho projeli — naše dojmy z testu</h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Novinku jsme <strong className="text-[#1a1a2e]">otestovali na Valašsku</strong> dřív, než dorazila na
          prodejnu — a tady je, co jsme cítili pod rukama i v nohách:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="bg-[#FFF3EE] rounded-xl p-5 border border-[#F5D2C4]">
            <div className="text-base font-black text-[#1a1a2e] mb-1">🛋 Pohodlí</div>
            <p className="text-sm text-[#5A6480] leading-relaxed">Ten flex vzadu není číslo z katalogu — na rozbité šotolině a kořenech rám tlumí drobné rány, ruce i záda vydrží čerstvé i po dlouhém dni.</p>
          </div>
          <div className="bg-[#FFF3EE] rounded-xl p-5 border border-[#F5D2C4]">
            <div className="text-base font-black text-[#1a1a2e] mb-1">⚡ Rychlost</div>
            <p className="text-sm text-[#5A6480] leading-relaxed">Na asfaltu i hladké šotolině drží tempo skoro jako silničky — patky 425 mm a nízké těžiště dělají své, kolo se nešetří.</p>
          </div>
          <div className="bg-[#FFF3EE] rounded-xl p-5 border border-[#F5D2C4]">
            <div className="text-base font-black text-[#1a1a2e] mb-1">🎯 Hravost</div>
            <p className="text-sm text-[#5A6480] leading-relaxed">Kratší cockpit a přesunuté košíky = kolo se hází do zatáček skoro samo. Mění směr hravě, v technickém terénu je předvídatelné.</p>
          </div>
          <div className="bg-[#FFF3EE] rounded-xl p-5 border border-[#F5D2C4]">
            <div className="text-base font-black text-[#1a1a2e] mb-1">✨ Design a barvy</div>
            <p className="text-sm text-[#5A6480] leading-relaxed">Čisté vedení kabelů, schované nářadí, top zpracování — a barevná provedení, která fakt stojí za to. Kolo, na které se koukáš rád.</p>
          </div>
        </div>
        <figure className="my-8 -mx-6 md:-mx-12">
          <div className="relative aspect-[16/10] bg-[#F0F2FA] rounded-none md:rounded-2xl overflow-hidden">
            <Image src="/media/articles/scott-addict-gravel-2027/test/test-08.webp" alt="Designový rám Scott Addict Gravel 2027 s barevnou grafikou" fill sizes="(max-width: 768px) 100vw, 820px" className="object-cover" />
          </div>
          <figcaption className="text-xs text-[#9AA3C2] text-center mt-3 px-6">Barevná grafika rámu — jedno z provedení, které jsme viděli naživo.</figcaption>
        </figure>

        <p className="mb-8">
          <a href="#galerie" className="inline-flex items-center gap-2 text-sm font-bold text-[#E8431A] hover:opacity-80 transition">
            📸 Galerie z testování novinky (12 fotek) →
          </a>
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">Geometrie: rychlost i jistota</h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Reach 398 mm, stack 575 mm, rozvor 1060 mm a hlavový úhel 70° (vel. M) — <strong className="text-[#1a1a2e]">delší
          přední část</strong> přidává jistotu v rychlosti, snížený střed (BB drop −78 mm) posadí těžiště nízko.
          Sedm velikostí XXS–XXL, takže si sedne malý i vysoký jezdec. Od gravel závodů přes bikepacking po
          rychlé lesní okruhy z Valašska.
        </p>

        <h2 id="modely" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4 scroll-mt-24">Modely a specifikace Addict Gravel 2027</h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-2">
          Řada jede od vlajkové <strong>Premium</strong> (SRAM RED XPLR AXS, HMX, 7,8 kg) přes{" "}
          <strong>Addict 10 / 20 / 30</strong> (SRAM Force XPLR) až po <strong>Addict 40</strong> se Shimano GRX.
          Vybrané modely níže — rozklikni pro{" "}
          <strong className="text-[#1a1a2e]">kompletní specifikaci, fotky, barvy a orientační cenu</strong>:
        </p>

        <GravelModelGrid />

        <div className="bg-[#FFF8E7] border border-[#F5D78E] rounded-xl p-4 text-sm text-[#5A4500] leading-relaxed mb-8">
          <strong>Pozor — náhledové fotky modelů jsou zatím z generace 2026</strong> (ilustrační). Nový{" "}
          <strong>Addict Gravel 2027</strong> je aktuálně <strong>jen v předobjednávce</strong> — oficiální fotky
          2027, finální osazení jednotlivých modelů, ceny v ČR a skladovou dostupnost (model / velikost) doplníme,
          jakmile je potvrdíme u distributora.
        </div>

        <p className="text-sm text-[#5A6480] leading-relaxed mb-8">
          Chceš přehled celé platformy? Přejdi na{" "}
          <Link href="/clanky/scott-2027/scott-addict-gravel" className="text-[#E8431A] font-semibold underline underline-offset-2 hover:text-[#1a1a2e]">
            stránku Addict Gravel 2027
          </Link>{" "}
          nebo do{" "}
          <Link href="/clanky/scott-2027" className="text-[#E8431A] font-semibold underline underline-offset-2 hover:text-[#1a1a2e]">
            přehledu Scott 2027
          </Link>
          .
        </p>

        {/* Předobjednávka CTA + formulář */}
        <div id="predobjednavka" className="bg-gradient-to-br from-[#1a1a2e] to-[#2C1B14] text-white rounded-3xl p-8 md:p-10 my-12 scroll-mt-24">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#F5A97C] mb-3">Předobjednávka otevřená</div>
          <h3 className="text-2xl md:text-3xl font-black leading-tight mb-3">Chceš nový Addict Gravel 2027?</h3>
          <p className="text-base text-white/80 leading-relaxed mb-6 max-w-xl">
            Nech nám kontakt a ozveme se ti osobně — projdeme model, velikost, barvu a dostupnost. Žádné
            automatické sliby termínů, vše po domluvě.
          </p>
          <PreorderInquiryForm />
        </div>

        {/* Galerie z testování */}
        <h2 id="galerie" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4 scroll-mt-24">Galerie z testování novinky</h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Naše vlastní fotky nového Addict Gravel 2027 — z Valašska i z prodejny 100dola sport.
        </p>
        <ArticleGallery
          images={["test-01", "test-02", "test-03", "test-04", "test-05", "test-06", "test-07", "test-08", "test-09", "test-10", "test-11", "test-12"].map(
            (n) => `/media/articles/scott-addict-gravel-2027/test/${n}.webp`,
          )}
          alt="Scott Addict Gravel 2027 — z našeho testu"
        />

        <p className="text-xs text-[#9AA3C2] leading-relaxed">
          Technická data: Scott Sports, BikeRadar, Brújula Bike. Fotky: 100dola sport (vlastní test).
          Ceny v ČR a přesná dostupnost jednotlivých variant potvrdíme po předobjednávce.
        </p>
      </div>
    </article>
  );
}

// Krátký předobjednávkový formulář — odešle dotaz týmu 100dola sport (/api/contact, topic sport).
function PreorderInquiryForm() {
  return (
    <form action="/api/contact" method="POST" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input type="text" name="name" placeholder="Jméno a příjmení" required minLength={2} maxLength={120}
        className="w-full px-4 py-3 rounded-xl bg-white border border-white/20 text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#E8431A]" />
      <input type="email" name="email" placeholder="E-mail" required maxLength={254}
        className="w-full px-4 py-3 rounded-xl bg-white border border-white/20 text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#E8431A]" />
      <input type="hidden" name="topic" value="sport" />
      <input type="hidden" name="consentGdpr" value="true" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <textarea name="message" rows={3} required minLength={5} maxLength={2000}
        placeholder="Který model / velikost / barva tě zajímá?"
        defaultValue="Mám zájem o Scott Addict Gravel 2027 — "
        className="w-full px-4 py-3 rounded-xl bg-white border border-white/20 text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#E8431A] sm:col-span-2" />
      <button type="submit" className="sm:col-span-2 bg-[#E8431A] hover:bg-[#F05A2E] text-white font-bold py-3 rounded-xl transition">
        Předobjednat / poslat dotaz
      </button>
      <p className="text-xs text-white/50 sm:col-span-2">Předobjednávkou tě nic nezavazuje. Domluvíme detaily telefonicky nebo na prodejně.</p>
    </form>
  );
}
