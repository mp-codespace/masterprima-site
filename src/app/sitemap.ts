// src/app/sitemap.ts
// This file generates dynamic sitemap for Next.js 13+ App Router

import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo-utils';

// Define the Article type (adjust import path as needed)
type Article = {
  article_id: string;
  title: string;
  slug: string;
  publish_date: string | null;
  updated_at?: string;
  tags: string[];
};

/**
 * Fetch articles from your API
 * Replace this with your actual API endpoint
 */
async function fetchArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${siteConfig.baseUrl}/api/public/articles`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    const articles = await response.json();
    return Array.isArray(articles) ? articles : [];
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
    return [];
  }
}

/**
 * Fetch tags from your API
 */
async function fetchTags(): Promise<string[]> {
  try {
    const response = await fetch(`${siteConfig.baseUrl}/api/auth-mp-secure-2024/public/tags`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.tags)) {
      return data.tags;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching tags for sitemap:', error);
    return [];
  }
}

/**
 * Generate sitemap entries
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchArticles();
  const tags = await fetchTags();
  
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteConfig.baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteConfig.baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteConfig.baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Add more static routes as needed
  ];

  // Generate article sitemap entries
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updated_at || article.publish_date || new Date()),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Generate tag-based routes (if you have tag pages)
  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${siteConfig.baseUrl}/blog/tag/${encodeURIComponent(tag.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...tagRoutes];
}

/**
 * Alternative: Generate robots.txt
 * Create this file as src/app/robots.ts
 */
export function generateRobotsTxt(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/_next/',
          '/temp/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
    ],
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
    host: siteConfig.baseUrl,
  };
}