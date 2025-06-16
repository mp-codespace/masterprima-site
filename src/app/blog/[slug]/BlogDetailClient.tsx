/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { PartialBlock } from "@blocknote/core";
import { codeBlock } from "@blocknote/code-block";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { useArticleViews } from "@/hooks/useArticleViews";
import Image from "next/image";

// Fungsi untuk membuat slug yang bersih dan unik dari teks
const slugify = (text: string): string => {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Ganti spasi dengan -
    .replace(p, c => b.charAt(a.indexOf(c))) // Ganti karakter spesial
    .replace(/&/g, '-and-') // Ganti & dengan 'and'
    .replace(/[^\w\-]+/g, '') // Hapus semua karakter non-kata
    .replace(/\-\-+/g, '-') // Ganti -- dengan -
    .replace(/^-+/, '') // Hapus - dari awal
    .replace(/-+$/, ''); // Hapus - dari akhir
};


function UniversalContentView({ content }: { content: string }) {
  let parsed: unknown;
  let isBlockNote = false;

  try {
    parsed = JSON.parse(content);
    if (Array.isArray(parsed)) isBlockNote = true;
  } catch {
    isBlockNote = false;
  }

    const editor = useCreateBlockNote({
  initialContent: isBlockNote && Array.isArray(parsed) ? (parsed as PartialBlock[]) : [],
  codeBlock: {
    ...codeBlock,
    supportedLanguages: {
      javascript: { name: "JavaScript", aliases: ["js"] },
      typescript: { name: "TypeScript", aliases: ["ts"] },
      python: { name: "Python", aliases: ["py"] },
      html: { name: "HTML" },
      css: { name: "CSS" },
    },
  },
});

  if (isBlockNote && Array.isArray(parsed)) {
    return (
      <div className="prose prose-lg max-w-none">
        <BlockNoteView editor={editor} theme="light" editable={false} />
      </div>
    );
  } else {
    return (
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          skipHtml={false}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
}

// --- Table of Contents ---
type HeadingItem = { id: string; text: string; level: number; };

// Fungsi parseHeadings yang sudah diperbaiki untuk membuat slug unik
function parseHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const slugCounts: { [key: string]: number } = {};

  const generateUniqueSlug = (text: string) => {
    const baseSlug = slugify(text);
    if (slugCounts[baseSlug] === undefined) {
      slugCounts[baseSlug] = 0;
      return baseSlug;
    }
    slugCounts[baseSlug]++;
    return `${baseSlug}-${slugCounts[baseSlug]}`;
  };
  
  // Helper function to recursively extract text from BlockNote's inline content,
  // handling nested structures like links.
  const getTextFromInlineContent = (items: any[] | undefined): string => {
      if (!Array.isArray(items)) {
          return '';
      }
      return items.map(item => {
          if (typeof item === 'string') {
              return item;
          }
          // If it's a link, recursively get text from its content
          if (item.type === 'link' && item.content) {
              return getTextFromInlineContent(item.content);
          }
          // Otherwise, it's a text object
          return item.text || '';
      }).join('');
  }


  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      (parsed as PartialBlock[]).forEach((block) => {
        if (block.type === 'heading' && block.props?.level) {
          
          // Use the robust helper function to extract text
          const text = getTextFromInlineContent(block.content as any[]);

          if (text) {
            headings.push({
              id: generateUniqueSlug(text),
              text: text,
              level: parseInt(String(block.props.level), 10),
            });
          }
        }
      });
      return headings;
    }
  } catch {}

  // Parsing untuk Markdown
  const lines = content.split("\n");
  lines.forEach(line => {
    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (match) {
      const text = match[2].trim();
      const level = match[1].length;
      headings.push({
        id: generateUniqueSlug(text),
        text: text,
        level: level,
      });
    }
  });

  return headings;
}

// Komponen TableOfContents yang sudah diperbaiki
function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => parseHeadings(content), [content]);

  // useEffect ini sekarang secara andal menemukan elemen judul yang benar dan memberinya ID.
  useEffect(() => {
    const articleContent = document.getElementById('main-content');
    if (!articleContent) return;

    // Ambil semua elemen heading dari dalam container artikel
    const headingElements = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const parserHeadingsQueue = [...headings];

    // Cocokkan elemen DOM dengan data heading berdasarkan konten teksnya
    headingElements.forEach(element => {
      const elementText = element.textContent?.trim();
      if (!elementText) return;

      const matchIndex = parserHeadingsQueue.findIndex(h => h.text.trim() === elementText);

      if (matchIndex !== -1) {
        // Jika cocok, berikan ID dan hapus dari antrian agar tidak ada duplikat
        element.id = parserHeadingsQueue[matchIndex].id;
        parserHeadingsQueue.splice(matchIndex, 1);
      }
    });
  }, [headings]); // Dijalankan kembali jika `headings` berubah

  const [activeId, setActiveId] = useState('');
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -80% 0%' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length <= 2) return null;

  return (
    <div className="sticky top-28">
      <div className="w-80 bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-xl shadow-gray-100/50 max-h-[75vh] overflow-hidden">
        <div className="flex items-center mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-600 to-purple-700 rounded-full mr-3"></div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Table of Contents
          </h3>
        </div>
        <nav className="overflow-y-auto max-h-[calc(75vh-48px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2">
          <div className="space-y-1">
            {headings.map(({ id, text, level }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(id);
                  if (element) {
                    const offsetTop = element.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({
                      top: offsetTop,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`block py-2.5 px-3 text-sm rounded-lg transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeId === id
                    ? 'text-blue-700 bg-blue-50 font-medium border-l-4 border-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  } ${level === 1 ? 'ml-0 font-medium' :
                    level === 2 ? 'ml-4' :
                      level === 3 ? 'ml-8' : 'ml-12'
                  }`}
                style={{
                  fontSize: level === 1 ? '14px' : level === 2 ? '13px' : '12px',
                  lineHeight: '1.5'
                }}
                aria-label={`Go to section ${text}`}
              >
                <span className="block truncate">
                  {text.substring(0, 50)}{text.length > 50 ? '...' : ''}
                </span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

// --- ShareActions (tidak ada perubahan) ---
function ShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <title>Twitter</title>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <title>Facebook</title>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    }
  ];

  return (
    <div className="border-t border-gray-200 pt-12 mt-16">
      <div className="bg-gray-50 rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium text-gray-800">Share this article</span>
            </div>
            <div className="flex items-center gap-3">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-white hover:bg-gray-900 bg-white border border-gray-200 rounded-full transition-all duration-200 hover:scale-105"
                  title={`Share on ${link.name}`}
                  aria-label={`Share on ${link.name}`}
                >
                  {link.icon}
                </a>
              ))}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-white hover:bg-gray-900 bg-white border border-gray-200 rounded-full transition-all duration-200 hover:scale-105"
                title="Copy link"
                aria-label="Copy link"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <title>Link copied!</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <title>Copy link</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
            aria-label="Back to top"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <title>Back to top</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Back to top
          </button>
        </div>
      </div>
    </div>
  );
}

type ArticleDetail = {
  article_id: string;
  title: string;
  summary: string | null;
  content: string;
  thumbnail: string | null;
  publish_date: string | null;
  author_name: string | null;
  views?: number;
  tags?: string[];
};

export default function BlogDetailClient({
  article,
  structuredData,
}: {
  article: ArticleDetail;
  structuredData: object;
}) {
  const [mounted, setMounted] = useState(false);
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    setMounted(true);

    let words = 0;
    try {
      const blocks = JSON.parse(article.content);
      if (Array.isArray(blocks)) {
        words = blocks.reduce((count: number, block: PartialBlock) => {
          const getText = (content: PartialBlock["content"]): string => {
            if (!content || !Array.isArray(content)) return "";
            return content
              .map((item) => (item && typeof item === "object" && "text" in item ? String((item as { text: string }).text) || "" : ""))
              .join(" ");
          };
          const text = getText(block.content);
          return count + text.split(/\s+/).filter((word: string) => word.length > 0).length;
        }, 0);
      }
    } catch {
      words =
        typeof article.content === "string"
          ? article.content.split(/\s+/).filter((word: string) => word.length > 0).length
          : 0;
    }
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
  }, [article]);

  useArticleViews({ articleId: article?.article_id || "", enabled: !!article });

  return (
    <div className="min-h-screen bg-white">
      {/* Accessibility: Skip link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute z-50 bg-blue-600 text-white px-4 py-2 rounded-b-lg">
        Skip to main content
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <div className="relative max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-x-12">
          {/* MAIN CONTENT */}
          <main id="main-content" className="min-w-0">
            <header className="mb-16 mt-24">
              {article.thumbnail && (
                <div className="mb-12 overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src={article.thumbnail}
                    alt={article.title}
                    width={1280}
                    height={320}
                    className="w-full h-80 object-cover"
                    priority
                  />
                </div>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8 tracking-tight">
                {article.title}
              </h1>
              {article.summary && (
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-10 font-light">
                  {article.summary}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 pb-8 border-b border-gray-200">
                {article.author_name && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">
                        {article.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {article.author_name}
                    </span>
                  </div>
                )}
                {article.publish_date && (
                  <>
                    <span className="text-gray-400">•</span>
                    <time className="font-medium">
                      {new Date(article.publish_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </>
                )}
                {readingTime > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium">{readingTime} min read</span>
                  </>
                )}
                {typeof article.views === "number" && article.views > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium">
                      {article.views.toLocaleString()} views
                    </span>
                  </>
                )}
              </div>
            </header>
            <article className="prose-container">
              {mounted && article?.content && <UniversalContentView content={article.content} />}
              <ShareActions title={article.title} />
            </article>
          </main>
          {/* SIDEBAR */}
          <aside className="hidden xl:block">
            <TableOfContents content={article.content} />
          </aside>
        </div>
      </div>
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Footer />
        </div>
      </section>
    </div>
  );
}
