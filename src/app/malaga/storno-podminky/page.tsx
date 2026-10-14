import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Storno podmínky · Cyklistické služby Malaga · 100dola",
  description:
    "Storno podmínky cyklistických služeb 100dola Malaga: kdy a kolik vracíme, jak stornovat, náhradník a zrušení ze strany 100dola.",
  alternates: { canonical: "https://www.100dola.com/malaga/storno-podminky" },
};

export default function MalagaStornoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[760px] mx-auto px-6 md:px-12 pt-10">
          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#E8431A] mb-2">
            Malaga · storno podmínky
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-2">
            Storno podmínky
          </h1>
          <p className="text-sm text-[#5A6480] mb-8">
            Cyklistické služby 100dola Malaga. Stručně nahoře, podrobně níže.
          </p>

          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 space-y-6 text-sm text-[#1a1a2e] leading-relaxed">
            <div className="bg-[#FFF3EE] border border-[#F5D2C4] rounded-xl p-4 text-[#1a1a2e]">
              <strong>Shrnutí:</strong> storno více než 30 dní před zahájením = vracíme{" "}
              <strong>20 %</strong> uhrazené ceny. Storno 30 dní a méně před zahájením = nevracíme
              nic. Místo sebe můžeš kdykoli poslat náhradníka bez poplatku.
            </div>

            <section>
              <h2 className="text-lg font-black mb-2">1. Na co se podmínky vztahují</h2>
              <p className="text-[#5A6480]">
                Na cyklistické služby 100dola Malaga, které poskytuje FUTUNATU s.r.o. v rámci
                cyklistického kempu: vedení vyjížděk (guiding) v Málaze a okolí, doprava a
                uskladnění kola z ČR do Španělska a zpět, zázemí základny (základní servis,
                sprcha), doprava kola v rámci Málagy z a na ubytování, svoz zavazadel a vybavení
                z ubytování na základnu, foto a video z vyjížděk, sportovní výživa na základně a
                organizační pomoc a informace.
              </p>
              <p className="text-[#5A6480] mt-2">
                Letenky, ubytování, stravu ani přepravu osob nezajišťujeme a nejsou součástí
                ceny. Řídí se podmínkami jejich dodavatelů.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">2. Storno ze strany účastníka</h2>
              <div className="overflow-hidden rounded-xl border border-[#E2E6F3]">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F9FF] text-[#5A6480] text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-2 font-bold">Kdy oznámíš storno</th>
                      <th className="px-4 py-2 font-bold">Co vracíme</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E2E6F3]">
                      <td className="px-4 py-3">Více než 30 dní před zahájením</td>
                      <td className="px-4 py-3 font-bold">20 % uhrazené ceny</td>
                    </tr>
                    <tr className="border-t border-[#E2E6F3]">
                      <td className="px-4 py-3">30 dní a méně před zahájením</td>
                      <td className="px-4 py-3 font-bold">nevracíme nic</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[#5A6480] mt-2">
                Lhůta se počítá od data, kdy nám storno doručíš e-mailem, do prvního dne akce
                (uvedeného u konkrétního termínu).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">3. Jak stornovat</h2>
              <p className="text-[#5A6480]">
                Napiš na{" "}
                <a href="mailto:info@100dola.com" className="text-[#E8431A] font-bold hover:underline">
                  info@100dola.com
                </a>
                . Storno je platné dnem doručení e-mailu. Potvrdíme ti ho do 2 pracovních dnů.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">4. Náhradník</h2>
              <p className="text-[#5A6480]">
                Místo sebe můžeš kdykoli určit jiného účastníka (jméno, kontakt, velikost kola),
                bez poplatku. Vyrovnání mezi tebou a náhradníkem řešíte mezi sebou. Změnu nám
                oznam co nejdřív, nejpozději 30 dní před zahájením, ať stihneme připravit kolo a
                doplňky.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">5. Zrušení ze strany 100dola</h2>
              <p className="text-[#5A6480]">
                Pokud akci zrušíme (nedostatek účastníků, vyšší moc, bezpečnost), nabídneme ti
                vrácení 100 % uhrazené ceny nebo náhradní termín.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">6. Doprava a uskladnění kola</h2>
              <p className="text-[#5A6480]">
                Náklady na dopravu a uskladnění kola vznikají předem a u dopravce a partnera jsou
                nevratné. Proto jsou zohledněny v tabulce v bodě 2.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">7. Cestovní pojištění se stornem</h2>
              <p className="text-[#5A6480]">
                Doporučujeme sjednat si vlastní cestovní pojištění se stornem (například pro
                případ nemoci nebo úrazu). Na požádání ti vystavíme potvrzení o stornu a o výši
                poplatku, které můžeš předložit pojišťovně. Neručíme za to, že ti pojišťovna
                storno uhradí.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">8. Odstoupení od smlouvy</h2>
              <p className="text-[#5A6480]">
                U služeb poskytovaných ve sjednaném termínu (volnočasové aktivity) nemá spotřebitel
                právo odstoupit od smlouvy uzavřené na dálku do 14 dnů (§ 1837 písm. j) občanského
                zákoníku). O této skutečnosti informujeme před uzavřením smlouvy a vyžádáme si
                tvé potvrzení.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">9. Kontakt</h2>
              <p className="text-[#5A6480]">
                FUTUNATU s.r.o., IČO uvedené v patičce webu ·{" "}
                <a href="mailto:info@100dola.com" className="text-[#E8431A] font-bold hover:underline">
                  info@100dola.com
                </a>{" "}
                ·{" "}
                <a href="tel:+420739045057" className="text-[#E8431A] font-bold hover:underline">
                  +420 739 045 057
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
