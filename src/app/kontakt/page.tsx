import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { COMPANY, STERNBERK_STORE } from "@/data/company";

export const metadata: Metadata = {
  title: { absolute: "Kontakt — 100dola sport Šternberk, Partyzánská 2" },
  description:
    "Napiš nám, zavolej +420 739 045 057 nebo přijď do prodejny 100dola sport ve Šternberku (Partyzánská 2, vedle Namístě). Otevřeno St–So.",
  alternates: { canonical: "/kontakt" },
};

// 25 fotek prodejny (01-obchod.jpg až 25-obchod.jpg), 01 je hlavní.
const STORE_PHOTOS = Array.from({ length: 25 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/media/obchod/${n}-obchod.jpg`;
});

export default function KontaktPage() {
  const photos = STORE_PHOTOS;
  const psc = STERNBERK_STORE.postalCode.replace(/(\d{3})(\d{2})/, "$1 $2");
  const sidloPsc = COMPANY.registeredOffice.postalCode.replace(/(\d{3})(\d{2})/, "$1 $2");

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        {/* Hero */}
        <section className="bg-white border-b border-[#E2E6F3]">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-16">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
              Kontakt
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-3">
              Ozvi se.
            </h1>
            <p className="text-base md:text-lg text-[#5A6480] max-w-2xl leading-relaxed">
              Napiš nám formulářem, zavolej, mrkni přímo do prodejny ve Šternberku.
            </p>
          </div>
        </section>

        <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-10 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Form */}
          <div className="md:col-span-3">
            <h2 className="text-lg font-black text-[#1a1a2e] mb-3">Napiš nám</h2>
            <ContactForm />
          </div>

          {/* Quick contact */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
              <h3 className="text-sm font-black text-[#1a1a2e] mb-3">Rychlý kontakt</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-xs text-[#9AA3C2] uppercase tracking-wider font-bold">Telefon</div>
                  <a href={`tel:${COMPANY.contact.phoneIntl}`} className="text-[#3B7CF4] font-black hover:underline">
                    {COMPANY.contact.phone}
                  </a>
                </div>
                <div>
                  <div className="text-xs text-[#9AA3C2] uppercase tracking-wider font-bold mt-3">E-mail</div>
                  <a href={`mailto:${COMPANY.contact.email}`} className="text-[#3B7CF4] font-black hover:underline">
                    {COMPANY.contact.email}
                  </a>
                </div>
                <div>
                  <div className="text-xs text-[#9AA3C2] uppercase tracking-wider font-bold mt-3">Vede</div>
                  <a
                    href="https://www.instagram.com/janpiecha/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#1a1a2e] hover:text-[#3B7CF4]"
                  >
                    {COMPANY.contact.person}
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="opacity-60">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a2e] text-white rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1">
                Provozovatel
              </div>
              <div className="text-sm font-black mb-2">{COMPANY.name}</div>
              <div className="text-xs text-white/70 leading-relaxed">
                IČO: {COMPANY.ico}<br />
                DIČ: {COMPANY.dic}<br />
                {COMPANY.registeredOffice.streetAddress}<br />
                {sidloPsc} {COMPANY.registeredOffice.addressLocality}
              </div>
              <div className="text-[10px] text-white/40 mt-2">
                {COMPANY.registration}.
              </div>
            </div>
          </div>
        </div>

        {/* Kamenná prodejna */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 pt-12">
          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
            Showroom a prodejna
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-2">
            100dola sport · Šternberk
          </h2>
          <p className="text-sm text-[#5A6480] max-w-2xl leading-relaxed mb-6">
            Prodejna v centru Šternberka, {STERNBERK_STORE.landmark}. Můžeš se
            zastavit osobně — domluvit cyklocestování do Malagy, vybrat kolo,
            přinést rám na servis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Adresa + info */}
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 space-y-3">
              <div>
                <div className="text-xs text-[#9AA3C2] uppercase tracking-wider font-bold mb-1">
                  Adresa
                </div>
                <div className="text-base font-black text-[#1a1a2e]">
                  {STERNBERK_STORE.streetAddress}
                </div>
                <div className="text-sm text-[#5A6480]">
                  {psc} {STERNBERK_STORE.addressLocality}
                </div>
                <div className="text-xs text-[#9AA3C2] mt-1">{STERNBERK_STORE.landmark}</div>
              </div>

              <div>
                <div className="text-xs text-[#9AA3C2] uppercase tracking-wider font-bold mb-1">
                  Otevírací doba
                </div>
                <div className="text-sm text-[#5A6480]">{STERNBERK_STORE.hoursNote}</div>
                <a
                  href={`tel:${COMPANY.contact.phoneIntl}`}
                  className="inline-flex items-center gap-2 mt-2 text-xs font-bold text-[#3B7CF4] hover:underline"
                >
                  📞 Zavolat předem
                </a>
              </div>

              <div className="pt-3 border-t border-[#F0F2FA]">
                <a
                  href={STERNBERK_STORE.mapsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#3B7CF4] text-white text-xs font-black hover:opacity-90"
                >
                  Navigovat (Google Mapy) →
                </a>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <iframe
                src={STERNBERK_STORE.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ minHeight: 280, border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa prodejny 100dola sport Šternberk"
                allowFullScreen
              />
            </div>
          </div>

          {/* Foto galerie obchodu — 25 fotek (portrait 9:16 zdrojový poměr → 3:4 containers) */}
          <div id="galerie" className="mt-8 scroll-mt-24">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-black text-[#1a1a2e]">Jak to u nás vypadá</h3>
              <span className="text-xs text-[#9AA3C2]">{photos.length} fotek</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p, i) => (
                <div
                  key={p}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#E2E6F3] bg-[#F0F2FA]"
                >
                  <Image
                    src={p}
                    alt={`Obchod 100dola sport Šternberk — foto ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={i === 0}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
