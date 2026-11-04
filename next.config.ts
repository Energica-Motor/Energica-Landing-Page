import type { NextConfig } from "next";

const LOUNGE_HOST = "lounge.energicamotor.com";
const LOUNGE_HEADERS = [
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "X-Robots-Tag",       value: "noindex, nofollow" },
];

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
      // Energica Lounge (static prototype in public/lounge). Listed after the
      // catch-all so these values win: its rider QR scanner needs the camera,
      // and the prototype is kept out of search results until it is approved.
      {
        source: "/:path*",
        has: [{ type: "host", value: LOUNGE_HOST }],
        headers: LOUNGE_HEADERS,
      },
      {
        source: "/lounge/:path*",
        headers: LOUNGE_HEADERS,
      },
    ];
  },

  async redirects() {
    return [
      // The lounge uses relative asset paths, so it must load from
      // /lounge/index.html (not /lounge) when opened on the main domain.
      { source: "/lounge", destination: "/lounge/index.html", permanent: false },
    ];
  },

  async rewrites() {
    return {
      // lounge.energicamotor.com serves public/lounge at its root.
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: LOUNGE_HOST }],
          destination: "/lounge/index.html",
        },
        {
          source: "/:path((?!lounge/).+)",
          has: [{ type: "host", value: LOUNGE_HOST }],
          destination: "/lounge/:path",
        },
      ],
    };
  },
};

export default nextConfig;
