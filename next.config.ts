import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "asset.scott-sports.com" },
      { protocol: "https", hostname: "www.q36-5.com" },
      { protocol: "https", hostname: "www.dynastar-lange.com" },
      { protocol: "https", hostname: "sponser.com" },
      { protocol: "https", hostname: "cdn.myshoptet.com" },
      { protocol: "https", hostname: "a.storyblok.com" },
    ],
  },
};

export default nextConfig;
