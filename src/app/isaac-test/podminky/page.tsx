import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Podmínky zápůjčky · ISAAC test · 100dola sport",
  description:
    "Podmínky bezplatné testovací zápůjčky kola ISAAC — odpovědnost za kolo, podpis protokolu, doklad totožnosti.",
  alternates: { canonical: "https://www.100dola.com/isaac-test/podminky" },
};

export default function IsaacTermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[760px] mx-auto px-6 md:px-12 pt-10">
          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
            ISAAC test · podmínky
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-2">
            Podmínky zápůjčky
          </h1>
          <p className="text-sm text-[#5A6480] mb-8">
            Pravidla bezplatné testovací jízdy ISAAC. Stručně a jednou větou na začátku,
            detailně níže. Odeslání rezervace = souhlas s tímto dokumentem.
          </p>

          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 space-y-6 text-sm text-[#1a1a2e] leading-relaxed">
            <div className="bg-[#FFF8E7] border border-[#F5D78E] rounded-xl p-4 text-[#5A4500]">
              <strong>Shrnutí v jedné větě:</strong> Půjčíme ti kolo na 1 hodinu zdarma; po tu dobu
              za něj plně odpovídáš a před vyzvednutím podepíšeš protokol.
            </div>

            <section>
              <h2 className="text-lg font-black mb-2">1. Provozovatel</h2>
              <p className="text-[#5A6480]">
                FUTUNATU s.r.o., Jan Piecha · IČO uvedené v patičce webu ·{" "}
                <a href="mailto:info@100dola.com" className="text-[#3B7CF4] hover:underline">
                  info@100dola.com
                </a>{" "}
                ·{" "}
                <a href="tel:+420739045057" className="text-[#3B7CF4] hover:underline">
                  +420 739 045 057
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">2. Předmět a doba zápůjčky</h2>
              <p className="text-[#5A6480]">
                Bezplatná testovací zápůjčka jednoho vybraného jízdního kola značky ISAAC
                v rozsahu 1 hodiny (60 minut), v rámci akce 29. května – 1. června 2026.
                Konkrétní model, čas a místo si volíš v rezervačním formuláři.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">3. Cena</h2>
              <p className="text-[#5A6480]">
                Zápůjčka je <strong>bezplatná</strong>. Případné penále za pozdní vrácení nebo
                náhrada škody se řídí body 5 a 6 níže.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">4. Před vyzvednutím</h2>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li>
                  Před převzetím podepíšeš <strong>protokol o zápůjčce</strong> — papírový
                  dokument, který sepíšeme za tebe. Ty jen doplníš podpis.
                </li>
                <li>
                  Doneste si <strong>občanský průkaz</strong> — slouží jako{" "}
                  <strong>záloha</strong> po dobu zápůjčky a zároveň pro ověření identity v
                  protokolu. OP ti <strong>vrátíme ihned</strong> po odevzdání kola.
                </li>
                <li>
                  Příjď minimálně 10 minut před začátkem slotu — kolo seřídíme a nasadíme tvoje
                  pedály.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">5. Odpovědnost</h2>
              <p className="text-[#5A6480] mb-2">
                Po celou dobu zápůjčky <strong>plně odpovídáš za zapůjčené kolo a příslušenství</strong>.
                Konkrétně:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li>
                  Za <strong>poškození</strong> (pády, nárazy, neoprávněné úpravy) hradíš plnou cenu
                  opravy v autorizovaném servisu.
                </li>
                <li>
                  Za <strong>ztrátu nebo krádež</strong> (vč. krádeže způsobené nedostatečným
                  zabezpečením) hradíš plnou hodnotu nového kola odpovídajícího modelu.
                </li>
                <li>
                  Za <strong>úrazy třetích osob</strong> způsobené v souvislosti s užitím kola
                  odpovídáš sám/sama.
                </li>
                <li>
                  Provozovatel nemá uzavřené pojištění odpovědnosti za tebe. Případné škody hradíš
                  ze svého.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">6. Závazky vypůjčujícího</h2>
              <p className="text-[#5A6480] mb-2">Prohlašuješ, že:</p>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li>Je ti 18 let a víc (nebo máš souhlas zákonného zástupce).</li>
                <li>Jsi zdravotně způsobilý/á k jízdě na kole.</li>
                <li>
                  Jsi obeznámen/a s pravidly silničního provozu a máš dostatečné jezdecké
                  zkušenosti pro typ kola, který testuješ.
                </li>
                <li>Při jízdě <strong>budeš mít helmu</strong>.</li>
              </ul>
              <p className="text-[#5A6480] mt-2">Zavazuješ se:</p>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li>Nepředat kolo třetí osobě.</li>
                <li>
                  Nepoužívat kolo k aktivitám mimo standardní silniční / gravelovou jízdu (žádné
                  sjezdy, skoky, dirt parky apod.).
                </li>
                <li>Vrátit kolo v sjednaném čase a v původním stavu.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">7. Vrácení a penále</h2>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li>Kolo musí být vráceno ve sjednaném čase.</li>
                <li>
                  Při zpoždění o víc než <strong>15 minut</strong> bez předchozí dohody si
                  provozovatel může účtovat penále <strong>500 Kč za každou započatou hodinu</strong>{" "}
                  prodlení.
                </li>
                <li>Případné nové závady budou zaznamenány v protokolu při vrácení.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">8. Osobní údaje</h2>
              <p className="text-[#5A6480]">
                Údaje z rezervace (jméno, e-mail, telefon) zpracováváme výhradně pro účely
                organizace zápůjčky a navazující komunikaci. Detaily ve{" "}
                <Link href="/zasady-cookies" className="text-[#3B7CF4] hover:underline">
                  zásadách zpracování
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">9. Závěrečná ustanovení</h2>
              <p className="text-[#5A6480]">
                Vztah se řídí občanským zákoníkem č. 89/2012 Sb. v platném znění. Odesláním
                rezervace stvrzuješ, že jsi tyto podmínky přečetl/a a souhlasíš s nimi.
              </p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/isaac-test"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90"
            >
              ← Zpět na rezervaci
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
