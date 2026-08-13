import type { NextConfig } from "next";

// Content-Security-Policy — ZÁMĚRNĚ permisivní na script/img/connect (inline
// GA/Meta pixel + Next hydration by strict policy rozbila), ale zpevňující na
// frame-ancestors / base-uri / object-src / form-action. Single-line string.
const csp = [
  "default-src 'self'",
  // Inline + eval nutné pro Next hydration a inline GA/Pixel snippety.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://*.google.com https://connect.facebook.net https://*.facebook.com https://*.vercel-insights.com https://va.vercel-scripts.com https://widget.packeta.com https://*.clarity.ms https://unpkg.com https://challenges.cloudflare.com https://*.heureka.cz https://*.heureka.group",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // Image-heavy shop — širší img-src je bezpečný.
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https: https://*.googletagmanager.com https://*.google-analytics.com https://*.google.com https://connect.facebook.net https://*.facebook.com https://*.vercel-insights.com https://va.vercel-scripts.com https://*.supabase.co https://*.public.blob.vercel-storage.com https://*.heureka.cz https://*.heureka.group",
  // Co smíme iframovat: Packeta widget, YouTube (nocookie), Google Maps embed.
  "frame-src 'self' https://widget.packeta.com https://www.youtube-nocookie.com https://www.google.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // HSTS — Cloudflare už ho posílá taky; tohle je belt-and-suspenders pro případ,
  // že někdy provoz nepůjde přes CF (přímý origin přístup).
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Clickjacking ochrana — žádné iframování naší stránky cizími doménami.
  { key: "X-Frame-Options", value: "DENY" },
  // MIME sniffing — prohlížeč musí respektovat Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer info nesendovat na cizí origin při downgrade z HTTPS.
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Vypneme všechny browser features, které nepoužíváme.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 75, 85, 90],
    // AVIF + WebP — prohlížeč si vybere; AVIF je ~30-50% menší proti JPEG.
    formats: ["image/avif", "image/webp"],
    // Next.js 16 — localPatterns je whitelist (vše ostatní DENY).
    // Musíme proto pokrýt VŠECHNY lokální cesty které servírujeme přes
    // next/image. Pokud chybí pattern, výsledek je 400
    // INVALID_IMAGE_OPTIMIZE_REQUEST a obrázek nezobrazí.
    localPatterns: [
      { pathname: "/**", search: "" },          // /logo.png, /media/*, /brands/*
      { pathname: "/api/img/**", search: "" },  // supplier proxy (path-based)
    ],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "asset.scott-sports.com" },
      { protocol: "https", hostname: "www.q36-5.com" },
      { protocol: "https", hostname: "www.dynastar-lange.com" },
      { protocol: "https", hostname: "sponser.com" },
      { protocol: "https", hostname: "cdn.myshoptet.com" },
      { protocol: "https", hostname: "a.storyblok.com" },
      // Supplier CDNs — supplier_products feedy (Sportimport, alecko)
      { protocol: "https", hostname: "www.sportimport.cz" },
      { protocol: "https", hostname: "www.alecko.cz" },
      // Supabase Storage bucket 'supplier-images' — migrované fotky.
      // Vercel optimizer si je stáhne + AVIF/WebP + resize per device.
      // Legacy: před přechodem na Vercel Blob. Nech tady, dokud nejsou
      // všechny DB URL přepsané na vercel-storage.com (viz 037 migrace).
      { protocol: "https", hostname: "ngglervufcwkjnmtxgud.supabase.co" },
      // Vercel Blob `futunatu-shared-assets` — primární storage produktových
      // fotek po migraci ze Supabase Storage (Supabase free limit překročen).
      { protocol: "https", hostname: "x8igiusyfrnhkluf.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Český alias pro wishlist (canonical zůstává /wishlist).
      { source: "/oblibene", destination: "/wishlist", permanent: true },
      { source: "/oblibene/:path*", destination: "/wishlist/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
