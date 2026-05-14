import { PROJECTS, type MonthBucket, type ProjectId } from "@/lib/accounting";

interface Props {
  buckets: MonthBucket[];
}

/**
 * Jednoduchý SVG sloupcový graf — měsíční revenue per projekt.
 * Stacked bar, žádná externí library. Mobile-friendly responsive.
 */
export default function MonthlyChart({ buckets }: Props) {
  if (buckets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E6F3] p-12 text-center">
        <div className="text-3xl mb-2">📊</div>
        <div className="text-sm text-[#9AA3C2]">Žádné faktury v období — graf se vyplní jakmile přijde první.</div>
      </div>
    );
  }

  const maxValue = Math.max(...buckets.map((b) => b.total), 1);
  const barWidth = 100 / buckets.length;

  // Stack order: sport (bottom) → malaga → lab → omc (top)
  const stackOrder: ProjectId[] = ["sport", "malaga", "lab", "omc"];

  const fmt = (n: number) => new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-black text-[#1a1a2e]">Měsíční obrat (Kč s DPH)</h2>
        <div className="flex flex-wrap gap-3 text-xs">
          {PROJECTS.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />
              <span className="text-[#5A6480]">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 1000 320" preserveAspectRatio="none" className="w-full h-[280px]">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1="0"
              x2="1000"
              y1={300 * (1 - p)}
              y2={300 * (1 - p)}
              stroke="#F0F2FA"
              strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {buckets.map((b, idx) => {
            const x = (idx + 0.15) * (1000 / buckets.length);
            const w = (barWidth * 10) * 0.7; // 70% of allocated width
            let yCursor = 300;
            return (
              <g key={b.month}>
                {stackOrder.map((projectId) => {
                  const value = b.perProject[projectId];
                  if (value <= 0) return null;
                  const h = (value / maxValue) * 300;
                  yCursor -= h;
                  const color = PROJECTS.find((p) => p.id === projectId)!.color;
                  return (
                    <rect
                      key={projectId}
                      x={x}
                      y={yCursor}
                      width={w}
                      height={h}
                      fill={color}
                      opacity={0.9}
                      rx={2}
                    >
                      <title>{b.month} · {PROJECTS.find((p) => p.id === projectId)!.label}: {fmt(value)} Kč</title>
                    </rect>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* X axis labels */}
        <div className="flex mt-2 text-[10px] text-[#9AA3C2]">
          {buckets.map((b) => (
            <div key={b.month} className="flex-1 text-center font-mono">
              {b.month.slice(5)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
