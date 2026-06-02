import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Item art and icons for later passes (uniques catalog, gear cards).
    remotePatterns: [
      { protocol: "https", hostname: "web.poecdn.com" },
      { protocol: "https", hostname: "**.poecdn.com" },
      { protocol: "https", hostname: "poe2db.tw" },
      { protocol: "https", hostname: "**.poe2db.tw" },
      { protocol: "https", hostname: "poe.ninja" },
      { protocol: "https", hostname: "**.poe.ninja" },
    ],
  },
};

export default nextConfig;
