/**
 * 5-star rating display (server-safe — no client logic).
 * value: 0-5 float
 * size: 'small' | 'medium' | 'large'
 */
export default function Stars({
  value,
  size = "medium",
  showValue = false,
}: {
  value: number;
  size?: "small" | "medium" | "large";
  showValue?: boolean;
}) {
  const dim = size === "large" ? 18 : size === "small" ? 12 : 14;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.max(0, Math.min(1, value - i));
    return fill;
  });

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} z 5 hvězd`}>
      {stars.map((fill, i) => (
        <Star key={i} fill={fill} size={dim} />
      ))}
      {showValue && (
        <span className="ml-1.5 text-xs font-bold text-[#1a1a2e]">{value.toFixed(1)}</span>
      )}
    </div>
  );
}

function Star({ fill, size }: { fill: number; size: number }) {
  if (fill >= 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5A623">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  if (fill <= 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E2E6F3" strokeWidth={2}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  // partial — clip přes overlay (deterministic, no Math.random pro purity)
  const pct = Math.round(fill * 100);
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
      }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E2E6F3" strokeWidth={2} style={{ position: "absolute", inset: 0 }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span
        style={{
          position: "absolute",
          inset: 0,
          width: `${pct}%`,
          overflow: "hidden",
        }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5A623">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </span>
    </span>
  );
}
