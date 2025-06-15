// src/components/SEOHead.tsx
'use client';

import Head from 'next/head';
import { siteConfig } from '@/lib/seo-utils';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  structuredData?: object[];
  noIndex?: boolean;
  noFollow?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags = [],
  structuredData = [],
  noIndex = false,
  noFollow = false,
}: SEOHeadProps) {
  const pageTitle = title ? `${title} | ${siteConfig.siteName}` : siteConfig.siteName;
  const pageDescription = description || siteConfig.description;
  const pageImage = ogImage || `${siteConfig.baseUrl}/blog-og-image.jpg`;
  const canonicalUrl = canonical ? `${siteConfig.baseUrl}${canonical}` : undefined;
  
  const allKeywords = [
    ...keywords,
    ...tags,
    'bimbel surabaya',
    'cpns',
    'kedinasan',
    'utbk',
    'masterprima'
  ].filter((keyword, index, arr) => arr.indexOf(keyword) === index);

  const robotsContent = `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}, max-snippet:-1, max-image-preview:large, max-video-preview:-1`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content={author || 'Tim MasterPrima'} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || siteConfig.baseUrl} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:site_name" content={siteConfig.siteName} />
      <meta property="og:locale" content="id_ID" />
      
      {/* Article-specific Open Graph tags */}
      {ogType === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          <meta property="article:publisher" content={siteConfig.organizationName} />
          <meta property="article:section" content="Education" />
          {tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.twitterHandle} />
      <meta name="twitter:creator" content={siteConfig.twitterHandle} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#f97316" />
      <meta name="msapplication-TileColor" content="#f97316" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="MasterPrima" />
      <meta name="application-name" content="MasterPrima" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      
      {/* DNS Prefetch for better performance */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      
      {/* Structured Data */}
      {structuredData.map((data, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      
      {/* Hreflang for international SEO */}
      <link rel="alternate" hrefLang="id" href={canonicalUrl || siteConfig.baseUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl || siteConfig.baseUrl} />
      
      {/* Additional link tags */}
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="icon" href="/mp.ico" />
      <link rel="apple-touch-icon" href="/mp.ico" />
      
      {/* Rich Snippets Enhancement */}
      <meta name="rating" content="5" />
      <meta name="price" content="0" />
      <meta name="priceCurrency" content="IDR" />
      <meta name="availability" content="in stock" />
      <meta name="category" content="Education" />
    </Head>
  );
}

// Usage example:
/*
<SEOHead
  title="Tips Sukses CPNS 2024"
  description="Panduan lengkap persiapan tes CPNS 2024 dari para ahli MasterPrima"
  keywords={['cpns 2024', 'tips cpns', 'persiapan cpns']}
  canonical="/blog/tips-sukses-cpns-2024"
  ogImage="/images/cpns-2024-tips.jpg"
  ogType="article"
  publishedTime="2024-01-15T10:00:00Z"
  author="Tim MasterPrima"
  tags={['CPNS', 'Tips', 'Persiapan']}
  structuredData={[articleStructuredData, breadcrumbStructuredData]}
/>
*/