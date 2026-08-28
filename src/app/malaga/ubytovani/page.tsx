import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LOCALITIES, VERDICT_META, CYCLO_STAYS, type Verdict } from "@/data/malaga/ubytovani";

const accent = "#E8431A";

export const metadata: Metadata = {
  title: "Kde bydlet na kole u Malagy — nejlepší lokality pro cyklisty | 100dola",
  description:
    "Kde se v provincii Málaga ubytovat na kolo: rozhodovací nástroj podle času na dobrou silnici, tras od dveří a transferu z letiště. Doporučené lokality + cyklo-ubytování.",
  alternates: { canonical: "/malaga/ubytovani" },
};

const ORDER: Verdict[] = ["top", "good", "avoid"];

export default function UbytovaniPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-white">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-10 md:py-14">
          <div className="text-xs text-[#9AA3C2] mb-5">
            <Link href="/malaga" className="hover:text-[#1a1a2e]">100dola Malaga</Link>
            {" / "}
            <span className="text-[#5A6480]">Ubytování</span>
          </div>

          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>
            Rozhodovací nástroj
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight mb-3">
            Kde bydlet, když jedeš na kole
          </h1>
          <p className="text-[#5A6480] leading-relaxed mb-4 max-w-[720px]">
            <strong>Ubytování řešíme my</strong> — vybereme a zajistíme podle toho, jak jezdíš,
            nemusíš nic hledat sám. Tady je, jak o lokalitách přemýšlíme: co cyklistu skutečně pálí —
            jak rychle jsi z postele na dobré silnici, jakou máš rozmanitost tras od dveří bez auta a
            jak daleko je transfer z letiště (AGP). Naše zázemí je ve východní Málaze — odtud jsou
            trasy „od dveří".
          </p>
          <p className="text-xs text-[#9AA3C2] mb-8">
            Ceny za pokoj neuvádíme (ubytovatelé je nepublikují) — jen cenovou hladinu €–€€€€.
          </p>

          {/* Lokality podle verdiktu */}
          {ORDER.map((v) => {
            const items = LOCALITIES.filter((l) => l.verdict === v);
            if (items.length === 0) return null;
            const meta = VERDICT_META[v];
            return (
              <section key={v} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{meta.icon}</span>
                  <h2 className="text-lg font-black" style={{ color: meta.color }}>{meta.label}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((l) => (
                    <div
                      key={l.name}
                      className="rounded-2xl border border-[#E2E6F3] p-5"
                      style={{ borderLeftWidth: 4, borderLeftColor: meta.color }}
                    >
                      <div className="font-black text-[#1a1a2e] mb-2">{l.name}</div>
                      <p className="text-sm text-[#5A6480] leading-relaxed mb-3">{l.note_cs}</p>
                      <dl className="space-y-1 text-xs">
                        <div className="flex gap-2">
                          <dt className="text-[#9AA3C2] w-32 shrink-0">Na dobrou silnici</dt>
                          <dd className="text-[#1a1a2e] font-semibold">{l.toRoad}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-[#9AA3C2] w-32 shrink-0">Stoupání od dveří</dt>
                          <dd className="text-[#1a1a2e]">{l.climbs}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-[#9AA3C2] w-32 shrink-0">Z letiště (AGP)</dt>
                          <dd className="text-[#1a1a2e]">{l.agp}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Cyklo-ubytování */}
          <section className="mb-10 border-t border-[#E2E6F3] pt-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-4">Ubytování s cyklo-službami</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CYCLO_STAYS.map((s) => (
                <div key={s.name} className="rounded-2xl border border-[#E2E6F3] p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-black text-[#1a1a2e]">{s.name}</div>
                    <span className="text-sm font-bold" style={{ color: accent }}>{s.level}</span>
                  </div>
                  <div className="text-xs text-[#9AA3C2] mb-2">{s.town}</div>
                  <p className="text-sm text-[#5A6480] leading-relaxed">{s.services_cs}</p>
                  {s.caveat_cs && <p className="text-xs text-[#B8460F] mt-2">⚠ {s.caveat_cs}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-2xl bg-[#1a0e08] p-6 md:p-8 text-white">
            <h2 className="text-xl font-black mb-2">Ubytování ti zajistíme</h2>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Napiš nám, jak jezdíš a co hledáš (klid, město, hory, poměr cena/výkon) — vybereme a
              zajistíme lokalitu i konkrétní ubytování podle toho, jaké trasy chceš jezdit z naší
              základny. Nemusíš nic hledat sám.
            </p>
            <Link href="/malaga#poptavka" className="inline-block bg-[#E8431A] hover:bg-[#F05A2E] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition">
              Poptat ubytování →
            </Link>
          </div>

          <p className="text-[11px] text-[#9AA3C2] mt-6 leading-relaxed">
            Hodnocení lokalit ověřujeme průběžně v terénu. Dostupnost konkrétního ubytování a jeho
            cyklo-služby si vždy potvrď u provozovatele.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
