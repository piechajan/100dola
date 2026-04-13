import Link from "next/link";

const steps = [
  { num: "01", title: "Domluv přepravu", desc: "Vyplníš formulář. Domluvíme termín a vše potřebné." },
  { num: "02", title: "Kolo odjede", desc: "Postaráme se o přepravu kola bezpečně do Malagy." },
  { num: "03", title: "Přiletíš sám", desc: "Jen ty, příruční zavazadlo a letenka. Žádné kolo na letišti." },
  { num: "04", title: "Kolo čeká. Jedeš.", desc: "Vyzvedneš kolo a jedeš. Jednoduché." },
];

export default function MalagaPromo() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#F3EEFF" }}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-5 h-px" style={{ backgroundColor: "#7C5CBF" }} />
              <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: "#7C5CBF" }}>
                100dola malaga
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a2e] leading-[0.95] text-balance">
              Kolo ti pošleme
              <br />do Malagy.
              <br /><span style={{ color: "#7C5CBF" }}>Přileť jen s příručákem.</span>
            </h2>

            <p className="mt-6 text-[#5A6480] leading-relaxed max-w-md">
              Zázemí pro zimní ježdění ve Španělsku. Přepravíme kolo,
              uskladníme ho v Malaze a ty přiletíš, kdy chceš.
              Kolo čeká. Ty jedeš.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Přeprava kola do Španělska",
                "Uskladnění přes celou zimu",
                "Zázemí pro opakované příjezdy",
                "Eventy a group rides v Andalusii",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#7C5CBF" }} />
                  <span className="text-sm text-[#5A6480]">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/malaga"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: "#7C5CBF", boxShadow: "0 4px 14px #7C5CBF30" }}
              >
                Zjistit víc
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/malaga#poptavka"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full border-2 text-[#7C5CBF] hover:bg-[#7C5CBF] hover:text-white transition-all"
                style={{ borderColor: "#7C5CBF" }}
              >
                Odeslat poptávku
              </Link>
            </div>
          </div>

          {/* Right — steps */}
          <div>
            <div className="text-xs tracking-[0.18em] uppercase font-bold text-[#9AA3C2] mb-8">
              Jak to funguje
            </div>
            <div className="space-y-0">
              {steps.map((step, i) => (
                <div key={step.num} className="flex gap-6 pb-8 relative">
                  {i < steps.length - 1 && (
                    <div
                      className="absolute left-[19px] top-10 bottom-0 w-px"
                      style={{ background: "linear-gradient(to bottom, #7C5CBF40, transparent)" }}
                    />
                  )}
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-black border-2"
                    style={{ borderColor: "#7C5CBF", color: "#7C5CBF", backgroundColor: "#fff" }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <div className="font-bold text-[#1a1a2e] leading-tight">{step.title}</div>
                    <div className="text-sm text-[#9AA3C2] mt-1 leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-2 p-5 rounded-2xl border-2"
              style={{ borderColor: "#7C5CBF30", backgroundColor: "#fff" }}
            >
              <div className="text-xs font-bold tracking-wide text-[#9AA3C2] uppercase mb-1">Klíčová myšlenka</div>
              <p className="text-[#5A6480] text-sm leading-relaxed italic">
                &ldquo;Kolo pošleme. Zázemí zajistíme. Ty přiletíš a jedeš. Žádné komplikace na letišti.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
