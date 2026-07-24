import Link from "next/link";

/**
 * Dočasná náhrada za ConfiguratorUI, dokud neověříme správnost cen komponent.
 * ISAAC konfigurátor přeplácel o 17–48k (base dvojitě počítal entry komponenty +
 * DuraAce diff +15k mimo) — viz audit 2026-07. Pevná SKU jsou nacenění správně,
 * tak na ně směrujeme + nabízíme poptávku na míru. Re-enable přes
 * CONFIGURATOR_PRICING_VERIFIED v /shop/[...slug]/page.tsx po validaci.
 */
export default function ConfiguratorInquiryNotice({ productName }: { productName: string }) {
  return (
    <div className="rounded-2xl border border-[#E2E6F3] bg-[#F7F9FF] p-6">
      <h3 className="text-lg font-black text-[#1a1a2e] mb-2">Sestavení na míru</h3>
      <p className="text-sm text-[#5A6480] mb-4 leading-relaxed">
        Online konfigurátor u tohoto modelu právě dolaďujeme (kontrola cen jednotlivých
        komponent). Chceš {productName} na míru — jiné osazení, kola nebo náboje? Napiš nám
        a připravíme přesnou nabídku i cenu.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/kontakt?topic=sport"
          className="inline-flex items-center px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Poptat sestavení na míru
        </Link>
        <a
          href="tel:+420739045057"
          className="inline-flex items-center px-5 py-3 rounded-full border-2 border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4] transition-colors"
        >
          +420 739 045 057
        </a>
      </div>
      <p className="text-xs text-[#9AA3C2] mt-4">
        Hotové konfigurace ISAAC (105 Di2 / Ultegra Di2 / Dura Ace Di2) máš{" "}
        <Link href="/shop/kola/silnicni" className="text-[#3B7CF4] font-semibold hover:underline">
          skladem v e-shopu
        </Link>{" "}
        za pevnou cenu.
      </p>
    </div>
  );
}
