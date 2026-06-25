import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { STERNBERK_STORE } from "@/data/company";

export const metadata: Metadata = {
  title: "O nás — 100dola sport Šternberk | kola, běh, Malaga, OMC",
  description:
    "100dola sport — kamenná prodejna ve Šternberku (Partyzánská 2). Kola, běžecké a lyžařské vybavení, servis, bikefit, přeprava kol do Malagy, komunita Open Miles Clinic.",
  alternates: { canonical: "/o-nas" },
  keywords: [
    "100dola sport Šternberk",
    "cyklistický obchod Šternberk",
    "sportovní obchod Šternberk",
    "kola Šternberk",
    "servis kol Šternberk",
    "kola Malaga",
    "přeprava kola Španělsko",
    "Open Miles Clinic",
    "skialpy Šternberk",
  ],
  openGraph: {
    title: "O nás — 100dola sport Šternberk",
    description: "Sportovní obchod ve Šternberku. Kola, běh, ski, Malaga, komunita.",
    images: ["/media/sport-hero.jpg"],
  },
};

export default function ONasPage() {
  return (
    <>
    <Navbar />
    <main className="pt-20">

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a1a2e] text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #3B7CF4 0%, transparent 60%), radial-gradient(circle at 80% 20%, #7C5CBF 0%, transparent 50%)" }}
        />
        <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-5 h-px bg-[#3B7CF4]" />
              <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#3B7CF4]">O projektu</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-6">
              Sport je způsob,<br />jak žít.
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-lg">
              100dola vzniklo z potřeby, která neexistovala — mít jedno přirozené místo pro vybavení, cestu na soustředění i partu, se kterou chceš jet.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#3B7CF4", boxShadow: "0 4px 20px #3B7CF440" }}
              >
                Prohlédnout e-shop
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full text-white border border-white/20 hover:border-white/40 transition-all"
              >
                Nadcházející eventy
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Kdo je 100dola */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-px bg-[#E8431A]" />
                <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#E8431A]">Kdo jsme</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-6 leading-tight">
                Nejsme e-shop.<br />Jsme sportovní projekt.
              </h2>
              <div className="space-y-4 text-[#5A6480] leading-relaxed">
                <p>
                  Jsme projekt postavený na čtyřech věcech: detailech, správném vybavení, smysluplné logistice a komunitě. Ne jako korporát, ne jako lifestylová značka. Jako lidi, kteří to žijí.
                </p>
                <p>
                  Za projektem 100dola stojí reálné zkušenosti — z tréninků, závodů, soustředění, lokálních vyjížděk a aktivních dovolených po celém světě.
                </p>
              </div>
            </div>
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-[#F0F2FA]">
              <Image
                src="/media/sport-hero.jpg"
                alt="100dola sport"
                fill
                className="object-cover object-[60%_20%]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Proč 100dola vzniklo */}
      <section className="py-20 bg-[#F5F7FF]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-5 h-px bg-[#7C5CBF]" />
              <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#7C5CBF]">Proč to vzniklo</span>
              <span className="w-5 h-px bg-[#7C5CBF]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-6">Vzniklo z praxe.</h2>
            <p className="text-lg text-[#5A6480] leading-relaxed">
              Chybělo místo, kde by vše sedělo dohromady — dobrá výbava, kvalitní zákaznický servis a skupina lidí, se kterými má smysl jet nejen na švih po sousedství. Tak vznikal projekt 100dola.
            </p>
          </div>
        </div>
      </section>

      {/* Tři pilíře */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-5 h-px bg-[#2EAA6E]" />
              <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#2EAA6E]">Tři pilíře</span>
              <span className="w-5 h-px bg-[#2EAA6E]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">Tři věci. Jedna značka.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Sport */}
            <div className="rounded-2xl border border-[#E2E6F3] p-8 hover:border-[#3B7CF4] hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-5" style={{ backgroundColor: "#3B7CF415" }}>🚴</div>
              <div className="text-xs tracking-[0.15em] uppercase font-bold text-[#3B7CF4] mb-2">100dola sport</div>
              <h3 className="text-xl font-black text-[#1a1a2e] mb-3">Výbava od těch, co to jedou.</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-6">
                Kola, lyže, skialpy, běžecké a cyklistické vybavení. Bez anonymity. Každou značku jsme si prověřili. Poradíme, doporučíme a za výběrem si stojíme.
              </p>
              <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3B7CF4] hover:gap-3 transition-all">
                Do e-shopu
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Malaga */}
            <div className="rounded-2xl border border-[#E2E6F3] p-8 hover:border-[#7C5CBF] hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-5" style={{ backgroundColor: "#7C5CBF15" }}>☀️</div>
              <div className="text-xs tracking-[0.15em] uppercase font-bold text-[#7C5CBF] mb-2">100dola malaga</div>
              <h3 className="text-xl font-black text-[#1a1a2e] mb-3">Kolo tam pošleme. Ty přiletíš.</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-6">
                Přeprava a uskladnění kol v Malaze. Tvoje kolo čeká v zázemí — přes zimu, přes sezónu, klidně celý rok. Přiletíš jen s příručákem a jedeš. Andalusie bez kompromisů.
              </p>
              <Link href="/malaga" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#7C5CBF] hover:gap-3 transition-all">
                Jak to funguje
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* OMC */}
            <div className="rounded-2xl border border-[#E2E6F3] p-8 hover:border-[#2EAA6E] hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-5" style={{ backgroundColor: "#2EAA6E15" }}>🤝🏽</div>
              <div className="text-xs tracking-[0.15em] uppercase font-bold text-[#2EAA6E] mb-2">Open Miles Clinic</div>
              <h3 className="text-xl font-black text-[#1a1a2e] mb-3">Jedeme spolu. Není to jen výjezd.</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-6">
                Social rides, eventy, skupinové akce. Dnes hlavně cyklistika, do budoucna i skialpy, běžky a další outdoor sporty.
              </p>
              <Link href="/community" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2EAA6E] hover:gap-3 transition-all">
                Nadcházející eventy
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Co nás spojuje */}
      <section className="py-20 bg-[#F5F7FF]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-[#1a1a2e]">
              <Image
                src="/media/ona-zkusenost.jpg"
                alt="Open Miles Clinic — reálná zkušenost"
                fill
                className="object-cover object-[40%_center] opacity-85"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-px bg-[#E8431A]" />
                <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#E8431A]">Co nás spojuje</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-6 leading-tight">
                Reálná zkušenost.<br />Žádná omáčka.
              </h2>
              <div className="space-y-4 text-[#5A6480] leading-relaxed">
                <p>
                  Ať jde o výběr kola, organizaci výjezdu do Malagy nebo sobotní social ride — vždy platí jedno: stojíme za tím, co děláme. Osobně.
                </p>
                <p>
                  100dola není franšíza ani agenturní projekt. Je to přirozené propojení věcí, kterými žijeme — výbava, cesta a parta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Najdeš nás ve Šternberku */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-3">
                Kamenná prodejna
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight mb-4">
                Najdeš nás ve Šternberku.
              </h2>
              <p className="text-base text-[#5A6480] leading-relaxed mb-3">
                Nejsme jen e-shop. Máme kamenný obchod přímo v centru Šternberka —{" "}
                <strong>{STERNBERK_STORE.streetAddress}</strong>, {STERNBERK_STORE.landmark}.
                Stav si pro radu, na servis, vyzkoušet kolo, nebo se jen mrknout.
              </p>
              <p className="text-base text-[#5A6480] leading-relaxed mb-6">
                Otevřeno po předchozí domluvě a v rámci akcí. Stačí zavolat a domluvit se,
                kdy se nejlépe potkáme.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/kontakt"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-full text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#3B7CF4", boxShadow: "0 4px 20px #3B7CF440" }}
                >
                  Adresa a mapa →
                </Link>
                <a
                  href={`tel:+420739045057`}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4]"
                >
                  📞 +420 739 045 057
                </a>
              </div>
            </div>

            <div>
              {/* Lišta nad galerií */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#9AA3C2]">
                  Pohled dovnitř
                </div>
                <Link
                  href="/kontakt#galerie"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B7CF4] hover:underline"
                >
                  📷 Galerie prodejny — 25 fotek →
                </Link>
              </div>

              {/* Grid 2×2, portrait containers — fotky jsou 9:16, takže 3:4 minimizuje oříznutí */}
              <div className="grid grid-cols-2 gap-3">
                {["/media/obchod/01-obchod.jpg", "/media/obchod/06-obchod.jpg", "/media/obchod/14-obchod.jpg", "/media/obchod/22-obchod.jpg"].map((src, i) => (
                  <Link
                    key={src}
                    href="/kontakt#galerie"
                    className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-[#E2E6F3] bg-[#F0F2FA] block"
                  >
                    <Image
                      src={src}
                      alt="Obchod 100dola sport Šternberk"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proč nám věřit — trust signály */}
      <section className="py-20 md:py-24 bg-[#F5F7FF] border-t border-[#E2E6F3]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-5 h-px bg-[#10B981]" />
              <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#10B981]">Proč nám věřit</span>
              <span className="w-5 h-px bg-[#10B981]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-3">
              Konkrétní fakta. Ne fráze.
            </h2>
            <p className="text-base text-[#5A6480] max-w-2xl mx-auto leading-relaxed">
              Kola, která prodáváme, jezdíme. Kufry, které posíláme do Malagy, jsme balili.
              Závody, na které tě nasazujeme, jsme sami absolvovali.
            </p>
          </div>

          {/* Trust signály grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
            <TrustTile
              icon="🏪"
              label="Kamenná prodejna"
              value="Šternberk"
              detail="Partyzánská 2 + showroom Valašské Meziříčí"
            />
            <TrustTile
              icon="📅"
              label="V provozu od"
              value="2023"
              detail="Cyklistika je v rodině přes dekádu"
            />
            <TrustTile
              icon="🛡"
              label="Vrácení zboží"
              value="14 dní"
              detail="Zdarma, bez udání důvodu (§ 1829 obč. zák.)"
            />
            <TrustTile
              icon="📍"
              label="Doručujeme"
              value="Celá ČR"
              detail="DPD, GLS, Zásilkovna, osobně po Moravě"
            />
            <TrustTile
              icon="🚲"
              label="Servisujeme"
              value="Vše"
              detail="Silnice / gravel / MTB / elektrokola"
            />
            <TrustTile
              icon="🇪🇸"
              label="Malaga"
              value="365 dní"
              detail="Kolo ti hlídáme i přes zimu"
            />
            <TrustTile
              icon="✓"
              label="GDPR & ESPCS"
              value="Compliant"
              detail="FUTUNATU s.r.o., IČO 07376766"
            />
            <TrustTile
              icon="📞"
              label="Vždy dovoláš"
              value="Janovi"
              detail="+420 739 045 057, osobně"
            />
          </div>

          {/* Kontaktní karta */}
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B7CF4] to-[#7C5CBF] flex items-center justify-center text-white text-3xl font-black shrink-0 mx-auto md:mx-0">
                JP
              </div>
              <div className="text-center md:text-left">
                <div className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold mb-1">
                  Stojí za tím
                </div>
                <h3 className="text-xl font-black text-[#1a1a2e] mb-2">Jan Piecha</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
                  Zakladatel 100dola sport, Malaga base &amp; Open Miles Clinic. Pokud máš dotaz,
                  klidně rovnou volej nebo piš — beru telefon i mail osobně.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <a
                    href="tel:+420739045057"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4FF] text-[#3B7CF4] text-xs font-bold hover:bg-[#3B7CF4] hover:text-white transition-colors"
                  >
                    📞 +420 739 045 057
                  </a>
                  <a
                    href="mailto:piecha.jan@gmail.com"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4FF] text-[#3B7CF4] text-xs font-bold hover:bg-[#3B7CF4] hover:text-white transition-colors"
                  >
                    ✉ piecha.jan@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Závěrečné CTA */}
      <section className="py-20 md:py-24 bg-[#1a1a2e] text-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Kde začít?</h2>
          <p className="text-lg text-white/60 mb-10 max-w-lg mx-auto">
            Prohlédni si výbavu, zjisti jak funguje Malaga nebo se přidej na nejbližší social ride.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#3B7CF4", boxShadow: "0 4px 20px #3B7CF440" }}
            >
              100dola sport — e-shop
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link
              href="/malaga"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#7C5CBF", boxShadow: "0 4px 20px #7C5CBF40" }}
            >
              Malaga — jak to funguje
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#2EAA6E", boxShadow: "0 4px 20px #2EAA6E40" }}
            >
              Social rides — eventy
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

    </main>
    <Footer />
    </>
  );
}

function TrustTile({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E6F3] p-4 hover:border-[#10B981]/40 hover:shadow-md transition-all">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-0.5">
        {label}
      </div>
      <div className="text-base font-black text-[#1a1a2e] leading-tight mb-1">{value}</div>
      <div className="text-[11px] text-[#5A6480] leading-snug">{detail}</div>
    </div>
  );
}
