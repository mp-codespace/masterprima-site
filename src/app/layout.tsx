// src/app/layout.tsx

import { Urbanist, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/seo';

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

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${urbanist.variable} ${plusJakartaSans.variable} font-plus-jakarta antialiased`}>
        {children}
      </body>
    </html>
  );
}
