import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false,
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400,
  },

  experimental: {
    optimizePackageImports: ["gsap", "framer-motion"],
  },

  async headers() {
    return [
      {
        // Long-lived cache for static image assets
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Long-lived cache for Next.js static chunks
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Security headers — all pages
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",              value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options",        value: "nosniff" },
          { key: "Referrer-Policy",               value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy",    value: "same-origin-allow-popups" },
          { key: "Permissions-Policy",            value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
