import Image from "next/image";
import { LAB_BRAND, LAB_GALLERY } from "@/data/lab";

const brassDark = LAB_BRAND.brassDark;

export default function LabGallery() {
  return (
    <section className="bg-[#F5F7FF] py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mb-12">
          <div className="text-xs tracking-[0.22em] uppercase font-bold mb-3" style={{ color: brassDark }}>
            Z Labu
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
            Detaily, na kterých záleží.
          </h2>
          <div className="mt-6 w-12 h-px" style={{ backgroundColor: brassDark }} />
          <p className="mt-5 text-sm text-[#9AA3C2]">
            Ilustrativní snímky. Po prvních realizacích sem nahrajeme reálné fotky z vlastní dílny.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {LAB_GALLERY.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#1F4937]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
