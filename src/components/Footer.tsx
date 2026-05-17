import Link from "next/link";
import Image from "next/image";

const links: Record<string, { label: string; href: string; external?: boolean }[]> = {
  "100dola sport": [
    { label: "Cyklistika", href: "/sport/cyklistika" },
    { label: "Lyžování & Skialpy", href: "/sport/zima" },
    { label: "Běh", href: "/sport/beh" },
    { label: "Turistika", href: "/sport/turistika" },
    { label: "Lab — péče o kola", href: "/lab" },
    { label: "@100dolasport.cz", href: "https://www.instagram.com/100dolasport.cz/", external: true },
  ],
  "100dola malaga": [
    { label: "Jak to funguje", href: "/malaga" },
    { label: "Přeprava kol", href: "/malaga/preprava" },
    { label: "Uskladnění", href: "/malaga/uskladneni" },
    { label: "Balíčky a ceny", href: "/malaga/balicky" },
    { label: "@100dola_malaga", href: "https://www.instagram.com/100dola_malaga/", external: true },
  ],
  "Open Miles Clinic": [
    { label: "Nadcházející eventy", href: "/community" },
    { label: "O Open Miles Clinic", href: "/community/o-klinice" },
    { label: "Testovací jízdy ISAAC", href: "/isaac-test" },
    { label: "@open_miles_clinic", href: "https://www.instagram.com/open_miles_clinic/", external: true },
  ],
  "100dola": [
    { label: "O nás", href: "/o-nas" },
    { label: "Kontakt", href: "mailto:info@100dola.com" },
    { label: "Zásady cookies", href: "/zasady-cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 pb-12 border-b border-white/10">

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/40 leading-relaxed">
            <div>
              <div className="font-bold text-white/60 mb-1">Provozovatel</div>
              FUTUNATU s.r.o.<br />
              Jan Piecha<br />
              <a href="tel:+420739045057" className="hover:text-white/80">+420 739 045 057</a>
            </div>
            <div>
              <div className="font-bold text-white/60 mb-1">Kontakt</div>
              <a href="mailto:info@100dola.com" className="hover:text-white/80">info@100dola.com</a><br />
              <a href="mailto:piecha.jan@gmail.com" className="hover:text-white/80">piecha.jan@gmail.com</a>
            </div>
            <div>
              <div className="font-bold text-white/60 mb-1">100dola sport</div>
              Šternberk, náměstí<br />
              v cíli Závodu míru
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/25">
              © {new Date().getFullYear()} FUTUNATU s.r.o. Všechna práva vyhrazena.
            </div>
            <div className="flex gap-6 text-xs text-white/25">
              <Link href="/zasady-cookies" className="hover:text-white/60 transition-colors">Zásady cookies</Link>
              <Link href="/o-nas" className="hover:text-white/60 transition-colors">O nás</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
