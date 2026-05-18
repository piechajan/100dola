import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Potvrzení odběru",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATES: Record<string, { emoji: string; title: string; body: string; tone: "ok" | "info" | "err" }> = {
  ok: {
    emoji: "✅",
    title: "Odběr potvrzen.",
    body: "Díky! Teď ti začneme posílat informace o nadcházejících akcích Open Miles Clinic.",
    tone: "ok",
  },
  already: {
    emoji: "👋",
    title: "Už jsi přihlášený.",
    body: "Tento e-mail je v odběru už dřív. Žádná duplikace, žádný spam navíc.",
    tone: "info",
  },
  expired: {
    emoji: "⌛",
    title: "Odkaz vypršel nebo byl už použitý.",
    body: "Pokud chceš odběr potvrdit znovu, přihlas se na /community a vyžádej si nový.",
    tone: "info",
  },
  invalid: {
    emoji: "🤷",
    title: "Neplatný odkaz.",
    body: "V odkazu chybí potvrzovací token. Pokud jsi sem klikal/a z e-mailu, zkus odkaz zkopírovat ručně.",
    tone: "err",
  },
  error: {
    emoji: "⚠️",
    title: "Něco se pokazilo.",
    body: "Zkus to za chvíli znovu. Pokud problém přetrvá, napiš nám na info@100dola.com.",
    tone: "err",
  },
};

const TONE_BG: Record<"ok" | "info" | "err", string> = {
  ok: "bg-[#EDFAF3] border-[#A8E5C5]",
  info: "bg-[#F7F9FF] border-[#E2E6F3]",
  err: "bg-red-50 border-red-200",
};

export default async function Page({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const s = STATES[status || ""] || STATES.error;

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-[70vh] flex items-center">
        <div className="max-w-[560px] mx-auto px-6 md:px-12 text-center py-16">
          <div className="text-5xl mb-4">{s.emoji}</div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">{s.title}</h1>
          <p className={`text-sm md:text-base text-[#5A6480] mb-8 leading-relaxed`}>
            {s.body}
          </p>

          <div className={`rounded-2xl p-5 mb-8 border ${TONE_BG[s.tone]}`}>
            <p className="text-xs text-[#5A6480]">
              Open Miles Clinic je komunita 100dola. Sledujeme nadcházející vyjížďky,
              skupinové akce a sezónní pobyty v Malaze. Žádný spam, max 1 e-mail za pár týdnů.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/community"
              className="px-5 py-3 rounded-full bg-[#2EAA6E] text-white text-sm font-black hover:opacity-90"
            >
              Otevřít kalendář akcí
            </Link>
            <Link
              href="/"
              className="px-5 py-3 rounded-full border border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#2EAA6E]"
            >
              Zpět domů
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
