// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Urbanist, Plus_Jakarta_Sans } from "next/font/google";
import { defaultMetadata } from "@/lib/seo";
import { CartProvider } from "@/components/cart/CartProvider";
import CartWidget from "@/components/cart/CartWidget";

// Load fonts at module scope (SSR-safe and deterministic)
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Next 15: still OK to export Metadata
export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      // Put all deterministic classes on <html> so <body> can be “quiet”.
      className={`${urbanist.variable} ${plusJakartaSans.variable} font-plus-jakarta antialiased`}
      suppressHydrationWarning
    >
      <body
        // Extensions (e.g. Grammarly) add attributes to <body>. This prevents
        // React from complaining about SSR → client mismatches there.
        suppressHydrationWarning
        // Hint for Grammarly to not inject into this document (helps in practice).
        data-gramm="false"
      >
        <CartProvider>
          {children}
          <CartWidget />
        </CartProvider>
      </body>
    </html>
  );
}
