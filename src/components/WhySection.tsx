const values = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Výběr s rozumem",
    desc: "Neprodáváme vše, co existuje. Vybíráme to, co sami používáme a co má smysl pro reálný sport.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Expertise z terénu",
    desc: "Mluvíme ze zkušenosti. Lyžujeme, jedeme na kole, chodíme do hor. Ne z kanceláře, ale z praxe.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Skutečná komunita",
    desc: "Open Miles Clinic nejsou eventy na papíře. Jsou to lidi, kteří se pravidelně setkávají a jedou spolu.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Zázemí na místě",
    desc: "Malaga není jen nápad. Je to fungující servis. Kola tam jezdí. Zázemí je připravené. Je to skutečné.",
  },
];

export default function WhySection() {
  return (
    <section className="py-20 md:py-28 bg-[#F4F4F4]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Header */}
        <div className="max-w-xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-px bg-[#111111]" />
            <span className="text-xs tracking-[0.18em] uppercase font-semibold text-[#666666]">
              Proč 100dola
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#111111]">
            Nejsme anonymní e-shop.
            {" "}
            <br />
            <span className="text-[#9A9A9A]">Jsme sportovci, kteří prodávají sport.</span>
          </h2>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div key={value.title} className="bg-white rounded-2xl p-7">
              <div className="text-[#E8431A] mb-5">{value.icon}</div>
              <h3 className="font-black text-[#111111] text-lg mb-2">{value.title}</h3>
              <p className="text-sm text-[#666666] leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              quote: "Nebyl jsem si jistý velikostí kola a měl obavu objednat bez vyzkoušení. Napsal jsem a dostal jsem podrobný popis, jak přesně změřit všechny míry. Výběr velikosti dopadl perfektně.",
              author: "Tomáš K.",
              role: "Zákazník 100dola sport",
            },
            {
              quote: "Kolo mám v Malaze od října. Přiletěl jsem třikrát, vždy bylo připravené a v pořádku. Přesně jak říkali.",
              author: "Lukáš M.",
              role: "Zákazník 100dola malaga",
            },
            {
              quote: "Open Miles Clinic jsou lidi, kteří jedou. Žádné hry, žádné ego. Doporučuji každému, kdo chce jezdit ve skupině.",
              author: "Petra V.",
              role: "Členka komunity",
            },
          ].map((t) => (
            <div key={t.author} className="bg-white rounded-2xl p-6 border border-[#E8E8E8]">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="#E8431A" className="mb-4 opacity-30">
                <path d="M0 16V9.455C0 4.09 3.333.727 10 .727V4.09c-3.394 0-5.091 1.7-5.091 5.091H8V16H0zm12 0V9.455C12 4.09 15.333.727 22 .727V4.09c-3.394 0-5.091 1.7-5.091 5.091H20V16h-8z" />
              </svg>
              <p className="text-sm text-[#444444] leading-relaxed italic mb-5">{t.quote}</p>
              <div>
                <div className="text-sm font-bold text-[#111111]">{t.author}</div>
                <div className="text-xs text-[#9A9A9A]">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
