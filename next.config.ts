import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "asset.scott-sports.com" },
      { protocol: "https", hostname: "www.q36-5.com" },
      { protocol: "https", hostname: "www.dynastar-lange.com" },
    ],
  },
};

export default nextConfig;
