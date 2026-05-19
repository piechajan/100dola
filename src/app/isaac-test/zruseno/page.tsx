import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Zrušení rezervace ISAAC",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ status?: string; slot?: string }>;
}

const STATES: Record<string, { emoji: string; title: string; body: string }> = {
  ok: {
    emoji: "✅",
    title: "Rezervace zrušena.",
    body: "Slot je teď volný pro další zájemce. Pokud si to rozmyslíš, klidně si vyber nový termín.",
  },
  already: {
    emoji: "ℹ️",
    title: "Tato rezervace je už zrušená.",
    body: "Nic dalšího nedělej — slot je už dávno volný.",
  },
  expired: {
    emoji: "⌛",
    title: "Odkaz vypršel nebo byl použitý.",
    body: "Tento token už neexistuje. Pokud potřebuješ zrušit jinou rezervaci, vyžádej si nový link.",
  },
  invalid: {
    emoji: "🤷",
    title: "Neplatný odkaz.",
    body: "V odkazu chybí cancel token. Pokud jsi sem klikal/a z e-mailu, zkus odkaz zkopírovat ručně.",
  },
  error: {
    emoji: "⚠️",
    title: "Něco se pokazilo.",
    body: "Zkus to za chvíli znovu. Pokud problém přetrvá, napiš nám na info@100dola.com.",
  },
};

export default async function Page({ searchParams }: PageProps) {
  const { status, slot } = await searchParams;
  const s = STATES[status || ""] || STATES.error;

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-[70vh] flex items-center">
        <div className="max-w-[560px] mx-auto px-6 md:px-12 text-center py-16">
          <div className="text-5xl mb-4">{s.emoji}</div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">{s.title}</h1>
          <p className="text-sm md:text-base text-[#5A6480] mb-3 leading-relaxed">{s.body}</p>
          {status === "ok" && slot && (
            <p className="text-xs text-[#9AA3C2] mb-6">
              Zrušený slot: <strong>{decodeURIComponent(slot)}</strong>
            </p>
          )}

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link
              href="/isaac-test"
              className="px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90"
            >
              Vybrat nový termín
            </Link>
            <Link
              href="/isaac-test/zrusit-rezervaci"
              className="px-5 py-3 rounded-full border border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#E8431A]"
            >
              Zrušit jinou rezervaci
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
