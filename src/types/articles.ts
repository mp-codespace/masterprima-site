// src/types/article.ts

export type Article = {
  article_id: string;
  title: string;
  summary: string;
  content?: string;
  author_name?: string;
  slug: string;
  thumbnail: string | null;
  publish_date: string | null;
  tags: string[];
  views: number;
  updated_at?: string;
};
