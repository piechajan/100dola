import { LAB_GALLERY } from "@/data/lab";

export default function LabGallery() {
  return (
    <section className="bg-[#F5F7FF] py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mb-12">
          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#1F4937] mb-3">
            Z Labu
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
            Detaily, na kterých záleží.
          </h2>
          <p className="mt-4 text-sm text-[#9AA3C2]">
            Ilustrativní snímky. Po prvních realizacích sem nahrajeme reálné fotky z vlastní dílny.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {LAB_GALLERY.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#1F4937]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
