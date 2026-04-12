const photos = [
  { src: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=600&q=80&fit=crop", alt: "Group ride", span: "col-span-1 row-span-2" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop", alt: "Road cycling" },
  { src: "https://images.unsplash.com/photo-1544191696-15693a5c5a38?w=600&q=80&fit=crop", alt: "Gravel" },
  { src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80&fit=crop", alt: "Ski touring" },
  { src: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600&q=80&fit=crop", alt: "MTB trail" },
];

export default function GalleryRecap() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-[#2EAA6E]" />
              <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#2EAA6E]">Z akcí</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">Jak to vypadá v terénu</h2>
            <p className="mt-2 text-sm text-[#9AA3C2]">Fotky z posledních akcí. Víc v galerii.</p>
          </div>
          <a
            href="/community/galerie"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2EAA6E] hover:opacity-75 transition-opacity shrink-0"
          >
            Celá galerie
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[220px]">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl bg-[#F0F2FA] group cursor-pointer ${i === 0 ? "row-span-2" : ""}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
