import Image from "next/image";

// Reálné fotky z OMC silničních vyjížděk. Postupně doplníme MTB / gravel / skialp.
const photos = [
  {
    src: "/media/community/omc-road-01-start-kavarna.jpg",
    alt: "Start vyjížďky u kavárny — Open Miles Clinic",
    span: "row-span-2",
  },
  {
    src: "/media/community/omc-road-04-stoupani.jpg",
    alt: "Skupina cyklistů na jarním stoupání",
  },
  {
    src: "/media/community/omc-road-02-espresso.jpg",
    alt: "Espresso po dojezdu — kavárenská kultura OMC",
  },
  {
    src: "/media/community/omc-road-03-skupina-silnice.jpg",
    alt: "Skupina jede po silnici — klasická OMC vyjížďka",
  },
  {
    src: "/media/community/omc-road-05-lahev-detail.jpg",
    alt: "Detail: hydratace na vyjížďce",
  },
];

export default function GalleryRecap() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

        <div className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-px bg-[#2EAA6E]" />
            <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#2EAA6E]">Z akcí</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">Jak to vypadá v terénu</h2>
          <p className="mt-2 text-sm text-[#9AA3C2]">Fotky ze silničních OMC vyjížděk. Postupně doplníme MTB, gravel a skialp.</p>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[220px]">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl bg-[#F0F2FA] group cursor-pointer ${i === 0 ? "row-span-2" : ""}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                quality={80}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-2xl pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
