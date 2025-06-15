// src/lib/seo.ts
import { Metadata } from 'next';

/**
 * -----------------------------------------------------------------------------
 * @name Site-wide SEO Configuration
 * @description
 * This file contains the default metadata for the MasterPrima website.
 * It's used in the root layout to provide a consistent base for all pages.
 * Pages can override these defaults by exporting their own `metadata` object.
 * -----------------------------------------------------------------------------
 */

// Define the base URL of your website. This is crucial for absolute URLs in metadata.
// Replace this with your actual production domain.
const siteUrl = 'https://masterprima.co.id';

export const defaultMetadata: Metadata = {
  // Provides a base for creating absolute URLs for assets and pages
  metadataBase: new URL(siteUrl),

  // Default title configuration
  title: {
    // The default title if no specific title is provided on a page
    default: 'MasterPrima - Bimbel CPNS, Kedinasan & UTBK #1 di Surabaya',
    // A template for child pages to follow, e.g., "About Us | MasterPrima"
    template: '%s | MasterPrima Surabaya',
  },

  // Default description
  description: 'MasterPrima adalah bimbingan belajar terpercaya di Surabaya sejak 2009, spesialis persiapan ujian CPNS, Sekolah Kedinasan, UTBK-SNBT, TNI & Polri. Raih prestasi terbaikmu bersama kami!',

  // Keywords for search engines (less impact now, but good to have)
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

  // Your company/author name
  authors: [{ name: 'MasterPrima', url: siteUrl }],
  creator: 'MasterPrima',

  // --- Open Graph (for Facebook, LinkedIn, etc.) ---
  openGraph: {
    title: 'MasterPrima - Bimbel CPNS, Kedinasan & UTBK #1 di Surabaya',
    description: 'Bimbingan belajar terpercaya di Surabaya untuk persiapan ujian CPNS, Sekolah Kedinasan, dan UTBK-SNBT.',
    url: siteUrl,
    siteName: 'MasterPrima Surabaya',
    // Default image when a page is shared. Replace with a URL to your logo or a branded image.
    images: [
      {
        url: '/mp.ico', // Should be placed in the `public` folder
        width: 1200,
        height: 630,
        alt: 'MasterPrima',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },

  // --- Twitter Card ---
  twitter: {
    card: 'summary_large_image',
    title: 'MasterPrima - Bimbel CPNS, Kedinasan & UTBK #1 di Surabaya',
    description: 'Bimbingan belajar terpercaya di Surabaya untuk persiapan ujian CPNS, Sekolah Kedinasan, dan UTBK-SNBT.',
    // Optional: Your Twitter handle
    // site: '@masterprimasby',
    // creator: '@masterprimasby',
    images: ['/twitter-image.png'], // Should be in `public` folder
  },

  // --- Robots ---
  // Controls how search engine crawlers index your site
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

  // --- Icons ---
  // Favicons for different devices
  icons: {
    icon: '/mp.ico',
    shortcut: '/mp.ico',
    apple: '/mp.ico',
  },

  // --- Manifest ---
  // For Progressive Web App (PWA) capabilities
  // manifest: '/site.webmanifest',
};
