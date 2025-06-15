// src/app/blog/page.tsx

import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const metadata: Metadata = {
  title: 'Blog & Artikel Terbaru - Tips CPNS, Kedinasan & UTBK',
  description: 'Baca artikel terbaru tentang tips sukses CPNS, persiapan tes kedinasan, strategi UTBK-SNBT, dan panduan belajar efektif dari para ahli MasterPrima Surabaya.',
  keywords: [
    'blog CPNS',
    'artikel kedinasan',
    'tips UTBK',
    'strategi belajar',
    'panduan CPNS',
    'persiapan tes kedinasan',
    'blog pendidikan Surabaya',
    'tips sukses ujian',
    'artikel MasterPrima',
    'berita pendidikan terbaru'
  ],
  openGraph: {
    title: 'Blog & Artikel Terbaru - MasterPrima Surabaya',
    description: 'Temukan artikel terbaru tentang tips sukses CPNS, persiapan tes kedinasan, dan strategi UTBK dari para ahli MasterPrima.',
    type: 'website',
    url: '/blog',
    images: [
      {
        url: '/blog-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog MasterPrima - Artikel Pendidikan Terbaru',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Artikel Terbaru - MasterPrima Surabaya',
    description: 'Temukan artikel terbaru tentang tips sukses CPNS, persiapan tes kedinasan, dan strategi UTBK dari para ahli MasterPrima.',
    images: ['/blog-twitter-image.jpg'],
  },
  alternates: {
    canonical: '/blog',
  },
  other: {
    'article:publisher': 'MasterPrima Surabaya',
    'article:author': 'Tim MasterPrima',
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}