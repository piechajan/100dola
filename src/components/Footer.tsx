import Link from "next/link";
import Image from "next/image";
import { COMPANY, STERNBERK_STORE } from "@/data/company";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getPublishedLocations } from "@/data/locations";
import { getPublishedSocialRides } from "@/data/social-rides";

const links: Record<string, { label: string; href: string; external?: boolean }[]> = {
  "100dola sport": [
    { label: "Cyklistika", href: "/sport/cyklistika" },
    { label: "Lyžování & Skialpy", href: "/sport/zima" },
    { label: "Běh", href: "/sport/beh" },
    { label: "Turistika", href: "/sport/turistika" },
    { label: "Lab — péče o kola", href: "/lab" },
    { label: "Pojištění kola", href: "/pojisteni" },
    { label: "Vyzkoušej SCOTT", href: "/vyzkousej-scott" },
    { label: "Kalkulačka dojezdu e-kola", href: "/kalkulacka-dojezdu-elektrokola" },
    { label: "Předobjednávka Spark RC", href: "/predobjednavka/spark-rc-2027" },
    { label: "@100dolasport.cz", href: "https://www.instagram.com/100dolasport.cz/", external: true },
    { label: "@100dola_lab", href: "https://www.instagram.com/100dola_lab/", external: true },
  ],
  "100dola malaga": [
    { label: "Jak to funguje", href: "/malaga" },
    { label: "Přeprava kol", href: "/malaga/preprava" },
    { label: "Uskladnění", href: "/malaga/uskladneni" },
    { label: "Trasy a okruhy", href: "/malaga/trasy" },
    { label: "Balíčky a ceny", href: "/malaga/balicky" },
    { label: "@100dola_malaga", href: "https://www.instagram.com/100dola_malaga/", external: true },
  ],
  "Open Miles Clinic": [
    { label: "Nadcházející eventy", href: "/community" },
    { label: "O Open Miles Clinic", href: "/community/o-klinice" },
    { label: "Vyzkoušej ISAAC", href: "/isaac-test" },
    ...getPublishedSocialRides().map((r) => ({
      label: `Social rides ${r.city}`,
      href: `/social-rides/${r.slug}`,
    })),
    { label: "@open_miles_clinic", href: "https://www.instagram.com/open_miles_clinic/", external: true },
  ],
  "100dola": [
    { label: "O nás", href: "/o-nas" },
    { label: "Magazín / Články", href: "/clanky" },
    ...getPublishedLocations().map((l) => ({
      label: `Prodejna ${l.city}`,
      href: `/prodejna/${l.slug}`,
    })),
    { label: "Kontakt", href: "/kontakt" },
    { label: "Obchodní podmínky", href: "/obchodni-podminky" },
    { label: "Ochrana osobních údajů", href: "/ochrana-osobnich-udaju" },
    { label: "Zásady cookies", href: "/zasady-cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Image src="/logo.png" alt="100dola" width={90} height={36} className="object-contain brightness-0 invert" />
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-[200px]">
              Sport. Komunita. Malaga. Jeden ekosystém pro aktivní lidi.
            </p>
            <div className="flex flex-col gap-2 mt-6">
              {[
                { handle: "@100dolasport.cz", href: "https://www.instagram.com/100dolasport.cz/" },
                { handle: "@100dola_malaga", href: "https://www.instagram.com/100dola_malaga/" },
                { handle: "@100dola_lab", href: "https://www.instagram.com/100dola_lab/" },
                { handle: "@open_miles_clinic", href: "https://www.instagram.com/open_miles_clinic/" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors duration-150 group"
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="shrink-0 opacity-60 group-hover:opacity-100">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  {item.handle}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-xs tracking-[0.15em] uppercase font-bold text-white/30 mb-4">Newsletter</div>
            <p className="text-xs text-white/40 leading-relaxed mb-3">
              Novinky ze shopu, tipy z tréninků, akce.
            </p>
            <NewsletterSignup variant="footer" source="shop" />
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="text-xs tracking-[0.15em] uppercase font-bold text-white/30 mb-4">{section}</div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors duration-150 group"
                      >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="shrink-0 opacity-60 group-hover:opacity-100">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href} className="text-sm text-white/50 hover:text-white transition-colors duration-150">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/40 leading-relaxed">
            <div>
              <div className="font-bold text-white/60 mb-1">Provozovatel</div>
              {COMPANY.name}<br />
              IČO: {COMPANY.ico} · DIČ: {COMPANY.dic}<br />
              {COMPANY.registeredOffice.streetAddress}<br />
              {COMPANY.registeredOffice.postalCode.replace(/(\d{3})(\d{2})/, "$1 $2")} {COMPANY.registeredOffice.addressLocality}
            </div>
            <div>
              <div className="font-bold text-white/60 mb-1">Showroom a prodejna</div>
              <a
                href={STERNBERK_STORE.mapsLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 block"
              >
                {STERNBERK_STORE.streetAddress}<br />
                {STERNBERK_STORE.postalCode.replace(/(\d{3})(\d{2})/, "$1 $2")} {STERNBERK_STORE.addressLocality}
              </a>
              <span className="text-white/30 block">{STERNBERK_STORE.landmark}</span>
              <div className="mt-2 text-white/50 leading-snug">
                St 9:30–16 · Čt 9–17 · Pá 9–16 · So 9–12<br />
                Po, Út, Ne — po dohodě (jsme na telefonu)
              </div>
              <div className="mt-3 text-white/40 leading-snug text-[11px]">
                Doručení & osobní předání: Vsetín, Valašské Meziříčí, Olomouc, Ostrava, Brno
              </div>
            </div>
            <div>
              <div className="font-bold text-white/60 mb-1">Kontakt</div>
              <a
                href="https://www.instagram.com/janpiecha/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 inline-flex items-center gap-1"
              >
                {COMPANY.contact.person}
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="opacity-60">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a><br />
              <a
                href="https://www.instagram.com/dendolf/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 inline-flex items-center gap-1"
              >
                Denisa Piecha
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="opacity-60">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a><br />
              <a href={`mailto:${COMPANY.contact.email}`} className="hover:text-white/80">{COMPANY.contact.email}</a><br />
              <a href={`tel:${COMPANY.contact.phoneIntl}`} className="hover:text-white/80">{COMPANY.contact.phone}</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/25">
              © {new Date().getFullYear()} {COMPANY.name}. Společnost {COMPANY.registration}.
            </div>
            <div className="flex gap-4 text-xs text-white/25 flex-wrap">
              <Link href="/obchodni-podminky" className="hover:text-white/60 transition-colors">Obchodní podmínky</Link>
              <Link href="/ochrana-osobnich-udaju" className="hover:text-white/60 transition-colors">Ochrana osobních údajů</Link>
              <Link href="/zasady-cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
