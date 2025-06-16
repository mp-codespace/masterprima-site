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

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function getArticleBySlug(slug: string) {
  const res = await fetch(`${baseUrl}/api/public/articles/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data && data.article_id ? data : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);
  if (!article) return {};

  const url = `${baseUrl}/blog/${resolvedParams.slug}`;
  return {
    title: article.title,
    description: article.summary || siteConfig.description,
    keywords: [...(article.tags || []), "blog", "masterprima"],
    openGraph: generateBlogOGMetadata(
      article.title,
      article.summary,
      `/blog/${resolvedParams.slug}`,
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

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);
  if (!article) return notFound();

  const structuredData = generateBlogListingStructuredData([article]);

  return (
    <BlogDetailClient article={article} structuredData={structuredData} />
  );
}
