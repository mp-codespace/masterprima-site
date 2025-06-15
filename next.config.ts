// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all
      },
    ],
  },
  // Security headers
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  // Redirects
  redirects: async () => {
    return [
      {
        source: "/admin",
        destination: "/auth-mp-secure-2024/login",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/auth-mp-secure-2024/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
