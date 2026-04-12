import Link from "next/link";
import Image from "next/image";

const links = {
  Sport: [
    { label: "Kola", href: "/shop/kola" },
    { label: "Cyklistika", href: "/shop/cyklistika" },
    { label: "Lyžování & Skialpy", href: "/shop/lyzovani" },
    { label: "Běh", href: "/shop/beh" },
    { label: "Turistika", href: "/shop/turistika" },
  ],
  Malaga: [
    { label: "Jak to funguje", href: "/malaga" },
    { label: "Přeprava kol", href: "/malaga/preprava" },
    { label: "Uskladnění", href: "/malaga/uskladneni" },
    { label: "Eventy", href: "/malaga/eventy" },
    { label: "FAQ", href: "/malaga/faq" },
  ],
  Community: [
    { label: "Nadcházející eventy", href: "/community/eventy" },
    { label: "O Open Miles Clinic", href: "/community/o-klinice" },
    { label: "Galerie", href: "/community/galerie" },
  ],
  "100dola": [
    { label: "O nás", href: "/o-nas" },
    { label: "Magazín", href: "/magazin" },
    { label: "Kontakt", href: "/kontakt" },
    { label: "FAQ", href: "/faq" },
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
            <div className="flex gap-3 mt-6">
              {["instagram", "strava", "facebook"].map((social) => (
                <a key={social} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {social === "instagram" && (
                      <>
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </>
                    )}
                    {social === "strava" && <path d="m13.5 19-3-6 3.5-6H10L6.5 13l3 6zM17.5 13 14 19" />}
                    {social === "facebook" && <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />}
                  </svg>
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
                    <Link href={item.href} className="text-sm text-white/50 hover:text-white transition-colors duration-150">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-white/25">© 2025 100dola. Všechna práva vyhrazena.</div>
          <div className="flex gap-6 text-xs text-white/25">
            {["Ochrana soukromí", "Obchodní podmínky", "Cookies"].map((label) => (
              <Link key={label} href="#" className="hover:text-white/60 transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
