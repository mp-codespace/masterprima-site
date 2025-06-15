/** @type {import('next').NextConfig} */
const nextConfig = {
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
  headers: async () => [
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
  ],
  // Redirects
  redirects: async () => [
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
  ],
};

module.exports = nextConfig;
