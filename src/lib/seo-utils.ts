// src\lib\seo-utils.ts


import { Article } from '@/types/articles';

export const siteConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  siteName: 'MasterPrima Surabaya',
  defaultImage: '/mp.ico',
  twitterHandle: '@masterprima',
  organizationName: 'MasterPrima',
  description: 'Bimbingan belajar terpercaya di Surabaya untuk persiapan ujian CPNS, Sekolah Kedinasan, dan UTBK-SNBT.',
};

/**
 * Generate Open Graph metadata for blog pages
 */
export function generateBlogOGMetadata(
  title: string,
  description: string,
  path: string,
  image?: string
) {
  return {
    title,
    description,
    url: `${siteConfig.baseUrl}${path}`,
    siteName: siteConfig.siteName,
    images: [
      {
        url: image || `${siteConfig.baseUrl}/blog-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    locale: 'id_ID',
    type: 'website' as const,
  };
}

/**
 * Generate Twitter Card metadata
 */
export function generateTwitterMetadata(
  title: string,
  description: string,
  image?: string
) {
  return {
    card: 'summary_large_image' as const,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title,
    description,
    images: [image || `${siteConfig.baseUrl}/blog-twitter-image.jpg`],
  };
}

/**
 * Generate structured data for blog listing page
 */
export function generateBlogListingStructuredData(
  articles: Article[]
) {
  const blogStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog MasterPrima',
    description: 'Blog dan artikel terbaru seputar bimbel, CPNS, TNI-POLRI, UTBK, Kedinasan, dan pendidikan',
    url: `${siteConfig.baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.organizationName,
      url: siteConfig.baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.baseUrl}${siteConfig.defaultImage}`,
      },
    },
    blogPost: articles.slice(0, 10).map(article => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.summary,
      url: `${siteConfig.baseUrl}/blog/${article.slug}`,
      datePublished: article.publish_date,
      dateModified: article.updated_at || article.publish_date,
      author: {
        '@type': 'Person',
        name: article.author_name || 'Tim MasterPrima',
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.organizationName,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.baseUrl}${siteConfig.defaultImage}`,
        },
      },
      image: article.thumbnail ? {
        '@type': 'ImageObject',
        url: article.thumbnail,
      } : undefined,
      keywords: article.tags.join(', '),
      wordCount: calculateWordCount(article),
      timeRequired: `PT${calculateReadingTime(article)}M`,
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: article.views || 0,
      },
    })),
  };

  return blogStructuredData;
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.organizationName,
    alternateName: 'MasterPrima Bimbel',
    url: siteConfig.baseUrl,
    logo: `${siteConfig.baseUrl}${siteConfig.defaultImage}`,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Contoh No. 123', // Replace with actual address
      addressLocality: 'Surabaya',
      addressRegion: 'Jawa Timur',
      postalCode: '60111', // Replace with actual postal code
      addressCountry: 'ID',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+62-xxx-xxxx-xxxx', // Replace with actual phone
      contactType: 'customer service',
      areaServed: 'ID',
      availableLanguage: ['Indonesian'],
    },
    sameAs: [
      // Add your social media URLs here
      'https://www.instagram.com/masterprima',
      'https://www.facebook.com/masterprima',
      'https://www.youtube.com/masterprima',
    ],
  };
}

/**
 * Generate FAQ structured data for blog pages
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Calculate word count from article content
 */
export function calculateWordCount(article: Article): number {
  const text = [article.title, article.summary, article.content]
    .filter(Boolean)
    .join(' ');
  return text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
}

/**
 * Calculate reading time (in minutes)
 */
export function calculateReadingTime(article: Article): number {
  const wordCount = calculateWordCount(article);
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.round(wordCount / 200));
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  return `${siteConfig.baseUrl}${path}`;
}

/**
 * Generate robots meta content based on article status
 */
export function generateRobotsContent(isPublished: boolean = true): string {
  if (isPublished) {
    return 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  }
  return 'noindex, nofollow';
}

/**
 * Generate meta keywords from article tags and content
 */
export function generateMetaKeywords(
  tags: string[],
  additionalKeywords: string[] = []
): string[] {
  const baseKeywords = [
    'bimbel surabaya',
    'cpns',
    'kedinasan',
    'utbk',
    'masterprima',
  ];

  return [...baseKeywords, ...tags, ...additionalKeywords];
}

/**
 * Format date for structured data (ISO format)
 */
export function formatDateForStructuredData(date: string | null): string | undefined {
  if (!date) return undefined;
  try {
    return new Date(date).toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Validate and clean URL for social sharing
 */
export function validateUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  return `${siteConfig.baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

/**
 * Generate hreflang attributes for international SEO
 */
export function generateHreflangData(path: string) {
  return [
    {
      hreflang: 'id',
      href: `${siteConfig.baseUrl}${path}`,
    },
    {
      hreflang: 'x-default',
      href: `${siteConfig.baseUrl}${path}`,
    },
  ];
}

/**
 * Generate viewport meta content
 */
export function generateViewportContent(): string {
  return 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
}

/**
 * Generate meta description with optimal length
 */
export function generateMetaDescription(
  content: string,
  maxLength: number = 160
): string {
  if (content.length <= maxLength) {
    return content;
  }

  // Truncate at word boundary
  const truncated = content.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Extract excerpt from article content
 */
export function extractExcerpt(
  content: string,
  maxLength: number = 200
): string {
  // Remove HTML tags and extra whitespace
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return generateMetaDescription(cleanContent, maxLength);
}
