import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventFeedbackForm from "@/components/community/EventFeedbackForm";
import { getPublishedEvents } from "@/lib/events-db";
import { SPORT_COLORS } from "@/data/events";

export const metadata: Metadata = {
  title: "Zpětná vazba k akci — 100dola",
  robots: { index: false, follow: false },
};

export default async function EventFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const signupId = typeof sp?.s === "string" ? sp.s : undefined;

  const list = await getPublishedEvents();
  const event = list.find((e) => e.slug === slug);
  const title = event?.title ?? "Akce";
  const color = event ? SPORT_COLORS[event.sport] : "#2EAA6E";

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-white min-h-screen">
        <div className="max-w-[640px] mx-auto px-6 py-10 md:py-14">
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color }}>
            Zpětná vazba
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight mb-2">
            Jak se ti líbila akce {title}?
          </h1>
          <p className="text-sm text-[#5A6480] mb-8">
            Pár minut — pomůžeš nám to udělat příště ještě líp.
          </p>
          <EventFeedbackForm eventSlug={slug} signupId={signupId} color={color} />
        </div>
      </main>
      <Footer />
    </>
  );
}
