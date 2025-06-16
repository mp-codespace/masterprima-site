// src/lib/seo.ts
import { Metadata } from 'next';

/**
 * Site-wide SEO Configuration
 * Gunakan ENV agar otomatis ikut domain di Vercel/production/dev.
 */
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MasterPrima - Bimbel CPNS, Kedinasan & UTBK #1 di Surabaya',
    template: '%s | MasterPrima Surabaya',
  },
  description:
    'MasterPrima adalah bimbingan belajar terpercaya di Surabaya sejak 2009, spesialis persiapan ujian CPNS, Sekolah Kedinasan, UTBK-SNBT, TNI & Polri. Raih prestasi terbaikmu bersama kami!',
  keywords: [
    'Bimbel Surabaya',
    'Bimbel CPNS Surabaya',
    'Bimbel Kedinasan Surabaya',
    'Bimbel UTBK SNBT Surabaya',
    'Bimbel PKN STAN',
    'Les Privat CPNS',
    'MasterPrima',
    'Tips Lulus CPNS',
  ],
  authors: [{ name: 'MasterPrima', url: siteUrl }],
  creator: 'MasterPrima',
  openGraph: {
    title: 'MasterPrima - Bimbel CPNS, Kedinasan & UTBK #1 di Surabaya',
    description: 'Bimbingan belajar terpercaya di Surabaya untuk persiapan ujian CPNS, Sekolah Kedinasan, dan UTBK-SNBT.',
    url: siteUrl,
    siteName: 'MasterPrima Surabaya',
    images: [
      {
        url: '/mp.ico',
        width: 1200,
        height: 630,
        alt: 'MasterPrima',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MasterPrima - Bimbel CPNS, Kedinasan & UTBK #1 di Surabaya',
    description: 'Bimbingan belajar terpercaya di Surabaya untuk persiapan ujian CPNS, Sekolah Kedinasan, dan UTBK-SNBT.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/mp.ico',
    shortcut: '/mp.ico',
    apple: '/mp.ico',
  },
  // manifest: '/site.webmanifest',
};

