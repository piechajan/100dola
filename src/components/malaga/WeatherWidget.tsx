import { getMalagaForecast } from "@/lib/malaga/weather";

const ICON: Record<string, string> = { sun: "☀️", cloud: "🌤️", rain: "🌧️" };

/**
 * 5denní předpověď pro Málagu z Windy Point Forecast (server-side, cachováno).
 * Když klíč/data chybí, nevykreslí nic (web nespadne).
 */
export default async function WeatherWidget({ className }: { className?: string }) {
  const days = await getMalagaForecast();
  if (days.length === 0) return null;

  return (
    <div className={`rounded-2xl border border-[#E2E6F3] bg-white p-5 ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2]">
          Počasí v Málaze
        </div>
        <div className="text-[10px] text-[#9AA3C2]">
          zdroj{" "}
          <a href="https://www.windy.com/" target="_blank" rel="noopener" className="hover:underline">
            Windy
          </a>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {days.map((d) => (
          <div key={d.dateISO} className="text-center rounded-xl bg-[#FAFAFC] border border-[#F0F2FA] p-2.5">
            <div className="text-[11px] font-bold uppercase text-[#5A6480]">{d.dayLabel}</div>
            <div className="text-2xl my-1">{ICON[d.icon]}</div>
            <div className="text-sm font-black text-[#1a1a2e]">{d.tempMax}°</div>
            <div className="text-[11px] text-[#9AA3C2]">{d.tempMin}°</div>
            <div className="mt-1.5 text-[10px] text-[#5A6480] leading-tight">
              💨 {d.windMaxKmh}
              <br />
              {d.rainMm > 0 ? `💧 ${d.rainMm} mm` : "—"}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#9AA3C2] mt-3">
        Denní max/min teplota, nejsilnější vítr (km/h) a srážky. Orientační — před výjezdem si ověř
        aktuální předpověď.
      </p>
    </div>
  );
}
