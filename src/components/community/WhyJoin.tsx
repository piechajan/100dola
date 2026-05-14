const reasons = [
  {
    emoji: "🤝🏾",
    title: "Jedeme v tempu, které sedí většině.",
    desc: "Naše akce nejsou závody. Pokud rozdíl ve výkonnosti není diametrální, vyjedeš kopec svým tempem a nahoře tě počkáme. Vracíme se spolu.",
  },
  {
    emoji: "📍",
    title: "Prověřené, lokální.",
    desc: "Spolupracujeme s osvědčenými kavárnami a restauracemi v regionu — vyjížďky tam buď začínají, nebo končí. Kafe, pivo, pokec a sdílení. K pohybu pro nás patří stejně jako kola — a vznikají z toho přátelství.",
  },
  {
    emoji: "🏔️",
    title: "Kolo, lyže, příroda. A lidi, kteří to milují.",
    desc: "Cyklistika, skialpy, běžky nebo turistika — záleží na sezóně a počasí. Platforma roste s komunitou.",
  },
  {
    emoji: "❤️",
    title: "Žádné ego, ale společné kilometry.",
    desc: "Přijď sám, odejdeš s kontakty. Komunita je základ — vybavení je bonus.",
  },
  {
    emoji: "✨",
    title: "Stylová cyklistika.",
    desc: "Sport, který nás baví, si zaslouží péči o detaily — pěkné kolo, dobrý dres, ladící vybavení. Není to o póze, je to o radosti z celku.",
  },
];

export default function WhyJoin() {
  return (
    <section className="py-20 md:py-24" style={{ backgroundColor: "#EDFAF3" }}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-px bg-[#2EAA6E]" />
              <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#2EAA6E]">Proč jezdit s námi</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a1a2e] leading-tight text-balance">
              Pohyb je lepší
              {" "}
              <span style={{ color: "#2EAA6E" }}>ve skupině.</span>
            </h2>
            <p className="mt-5 text-[#5A6480] leading-relaxed max-w-md">
              Open Miles Clinic jezdí spolu od roku 2025. Začalo to pár lidmi v kavárně,
              dnes pravidelně vyrážíme napříč sezónami. Stačí přijít jednou.
            </p>

            {/* Big stat */}
            <div className="mt-10 flex gap-10">
              {[
                { value: "2025", label: "rok založení" },
                { value: "2", label: "sezóny" },
                { value: "6", label: "typů aktivit" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-black text-[#1a1a2e]">{s.value}</div>
                  <div className="text-xs text-[#9AA3C2] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — reasons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((r) => (
              <div key={r.title} className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                <div className="text-3xl mb-3">{r.emoji}</div>
                <h3 className="font-black text-[#1a1a2e] text-sm leading-snug mb-2">{r.title}</h3>
                <p className="text-xs text-[#9AA3C2] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
