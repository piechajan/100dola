"use client";

import { useEffect, useState } from "react";

interface Props {
  modelSlug: string;
  /** Pod jakou hodnotou skrýt, aby to nevypadalo trapně. Default 3. */
  minToShow?: number;
  className?: string;
}

export default function PreorderCounter({
  modelSlug,
  minToShow = 3,
  className = "",
}: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/preorders/count?model=${encodeURIComponent(modelSlug)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setCount(typeof d.count === "number" ? d.count : 0);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [modelSlug]);

  if (count === null || count < minToShow) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 text-sm ${className}`}
      aria-label={`Aktuálně ${count} předobjednávek`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8431A] opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8431A]" />
      </span>
      <span>
        <strong className="text-[#1a1a2e]">{count}</strong>{" "}
        {count === 1 ? "předobjednávka" : count < 5 ? "předobjednávky" : "předobjednávek"}
      </span>
    </div>
  );
}
