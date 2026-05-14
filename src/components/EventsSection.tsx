import Link from "next/link";

interface HomeEvent {
  id: number;
  title: string;
  type: string;
  date: string;
  dateISO: string;       // pro filtraci past events
  time: string;
  location: string;
  distance: string;
  elevation: string;
  capacity: number;
  filled: number;
  color: string;
}

const ALL_EVENTS: HomeEvent[] = [
  {
    id: 0,
    title: "Season Opening",
    type: "Cyklistika",
    date: "Ne 19. dubna",
    dateISO: "2026-04-19",
    time: "09:45",
    location: "Kavárna Chochino, Valašské Meziříčí",
    distance: "63–68 km",
    elevation: "565–670 m",
    capacity: 20,
    filled: 13,
    color: "var(--community-color)",
  },
  {
    id: 8,
    title: "Troják — Tesák",
    type: "Cyklistika",
    date: "So 2. května",
    dateISO: "2026-05-02",
    time: "09:45",
    location: "Valašské Meziříčí — Hostýnské vrchy",
    distance: "~95 km",
    elevation: "~1 400 m",
    capacity: 20,
    filled: 9,
    color: "var(--community-color)",
  },
  {
    id: 1,
    title: "Vyjížďka od Chochina",
    type: "Cyklistika",
    date: "So 16. května",
    dateISO: "2026-05-16",
    time: "09:45",
    location: "Kavárna Chochino, Valašské Meziříčí",
    distance: "55 km",
    elevation: "600 m",
    capacity: 20,
    filled: 3,
    color: "var(--community-color)",
  },
  {
    id: 2,
    title: "Podzimní Malaga I",
    type: "Cyklistika · Malaga",
    date: "23.–29. října",
    dateISO: "2026-10-23",
    time: "—",
    location: "Málaga, Španělsko",
    distance: "~80 km / den",
    elevation: "~1 000 m / den",
    capacity: 12,
    filled: 4,
    color: "var(--malaga-color)",
  },
];

// Filter: jen budoucí akce. Server-side render použije dateISO porovnání s aktuální dobou.
// `>= today` zajišťuje, že akce v den startu se ještě zobrazí.
function getUpcoming(): HomeEvent[] {
  const today = new Date().toISOString().slice(0, 10);
  return ALL_EVENTS.filter((e) => e.dateISO >= today).slice(0, 3);
}

const events = getUpcoming();

export default function EventsSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-px" style={{ backgroundColor: "var(--community-color)" }} />
              <span className="text-xs tracking-[0.18em] uppercase font-semibold" style={{ color: "var(--community-color)" }}>
                Open Miles Clinic
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#111111]">
              Nadcházející eventy
            </h2>
            <p className="mt-2 text-sm text-[#666666]">
              Jedeme spolu. Přidej se.
            </p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors shrink-0"
            style={{ color: "var(--community-color)" }}
          >
            Všechny eventy
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Event cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-[#F4F4F4]">
          <div className="flex-1">
            <div className="font-bold text-[#111111]">Nechceš přijít o nový event?</div>
            <div className="text-sm text-[#666666] mt-0.5">Přihlásíme tě k odběru a budeš první vědět.</div>
          </div>
          <Link
            href="/community#newsletter"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full shrink-0 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--community-color)" }}
          >
            Přihlásit se k odběru
          </Link>
        </div>
      </div>
    </section>
  );
}

function EventCard({
  title, type, date, time, location, distance, elevation, capacity, filled, color,
}: {
  title: string; type: string; date: string; time: string; location: string;
  distance: string; elevation: string; capacity: number; filled: number; color: string;
}) {
  const fillPct = (filled / capacity) * 100;
  const spotsLeft = capacity - filled;

  return (
    <Link
      href="/community"
      className="group flex flex-col bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden hover:border-[#111111]/20 hover:shadow-lg transition-all duration-200"
    >
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <div className="p-5 flex flex-col flex-1">
        <div
          className="inline-flex self-start text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {type}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-2">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {date} · {time}
        </div>
        <h3 className="text-lg font-black text-[#111111] leading-tight mb-2">{title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-[#666666] mb-4">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </div>
        <div className="flex gap-4 text-xs mb-auto">
          <div>
            <div className="font-black text-[#111111]">{distance}</div>
            <div className="text-[#9A9A9A]">vzdálenost</div>
          </div>
          <div>
            <div className="font-black text-[#111111]">{elevation}</div>
            <div className="text-[#9A9A9A]">převýšení</div>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-[#F4F4F4]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#666666]">{filled} / {capacity} míst obsazeno</span>
            <span className="font-semibold" style={{ color }}>{spotsLeft} zbývá</span>
          </div>
          <div className="h-1 bg-[#F4F4F4] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${fillPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <button
          className="mt-4 w-full py-2.5 text-sm font-bold rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: color }}
        >
          Přihlásit se
        </button>
      </div>
    </Link>
  );
}
