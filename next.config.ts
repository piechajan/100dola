import type { NextConfig } from "next";

const securityHeaders = [
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
    // /api/img/<base64url> — path-based supplier image proxy.
    // Next.js 16 vyžaduje explicit localPatterns whitelist pro local
    // optimizer i bez query stringu.
    localPatterns: [
      { pathname: "/api/img/**", search: "" },
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
};

export default nextConfig;
