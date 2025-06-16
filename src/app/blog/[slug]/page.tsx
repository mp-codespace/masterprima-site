/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogDetailClient from "./BlogDetailClient";
import {
  siteConfig,
  generateBlogOGMetadata,
  generateTwitterMetadata,
  generateBlogListingStructuredData,
} from "@/lib/seo-utils";

// Get the correct base URL for server-side fetches
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Fetch article data by slug from your API
async function getArticleBySlug(slug: string) {
  const res = await fetch(`${baseUrl}/api/public/articles/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.article_id ? data : null;
}

// Generate SEO metadata for this blog article
export async function generateMetadata(props: any): Promise<Metadata> {
  // Universal, aman!
  const params = (await props).params || props.params;
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  const url = `${baseUrl}/blog/${params.slug}`;
  return {
    title: article.title,
    description: article.summary || siteConfig.description,
    keywords: [...(article.tags || []), "blog", "masterprima"],
    openGraph: generateBlogOGMetadata(
      article.title,
      article.summary,
      `/blog/${params.slug}`,
      article.thumbnail
    ),
    twitter: generateTwitterMetadata(
      article.title,
      article.summary,
      article.thumbnail
    ),
    alternates: { canonical: url },
    other: {
      "article:author": article.author_name || "Tim MasterPrima",
      "article:publisher": siteConfig.organizationName,
      "article:published_time": article.publish_date,
      ...(article.tags?.length
        ? Object.fromEntries(
            article.tags.map((tag: string, i: number) => [
              `article:tag:${i + 1}`,
              tag,
            ])
          )
        : {}),
    },
  };
}

// The main page - fetch data and render client component
export default async function BlogDetailPage(props: any) {
  // Universal, aman!
  const params = (await props).params || props.params;
  const article = await getArticleBySlug(params.slug);
  if (!article) return notFound();

  // For structured data (JSON-LD)
  const structuredData = generateBlogListingStructuredData([article]);

  return (
    <BlogDetailClient article={article} structuredData={structuredData} />
  );
}
