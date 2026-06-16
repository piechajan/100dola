"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DEADLINE = new Date("2026-07-07T23:59:59+02:00").getTime();

function daysLeft(): number {
  const ms = DEADLINE - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function SparkUrgencyBanner() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysLeft());
    const id = setInterval(() => setDays(daysLeft()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (days === null || days === 0 || days > 30) return null;

  return (
    <div className="bg-gradient-to-r from-[#FFD23F] via-[#FFC940] to-[#FFB347] rounded-2xl p-5 mb-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a1a2e] text-[#FFD23F] flex items-center justify-center font-black text-lg">
          {days}
        </div>
        <div className="flex-1">
          <div className="text-xs font-black uppercase tracking-wider text-[#1a1a2e] mb-1">
            Předobjednávky končí 7. 7.
          </div>
          <div className="text-sm md:text-base text-[#1a1a2e] mb-3 leading-snug">
            Zbývá <strong>{days} {days === 1 ? "den" : days < 5 ? "dny" : "dní"}</strong> na rezervaci Spark RC 2027.
            První dodávky září 2026. Po deadline ti slot negarantujeme — Scott alokuje výrobu.
          </div>
          <Link
            href="/predobjednavka/spark-rc-2027"
            className="inline-block bg-[#1a1a2e] hover:bg-[#2a2a3e] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition"
          >
            Předobjednat teď →
          </Link>
        </div>
      </div>
    </div>
  );
}
