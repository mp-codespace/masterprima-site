// src/app/blog/BlogPageClient.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyBanner from '@/components/StickyBanner';
import { Eye, Tag, Calendar, Clock, User, Search, X, TrendingUp } from "lucide-react";
import Image from 'next/image';


type Article = {
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

function formatDate(date: string | null) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatViews(views: number): string {
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
}

// Real reading time, not always 1!
function readingTime(a: Article) {
    // Use summary, title, content (if available)
    const text = [a.title, a.summary, a.content].filter(Boolean).join(' ');
    const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
    // 200 words/minute
    return Math.max(1, Math.round(words / 200));
}

function TagButton({ tag, active, onClick }: { tag: string, active: boolean, onClick: () => void }) {
    return (
        <button
            type="button"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${active
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                }`}
            onClick={onClick}
            aria-pressed={active}
        >
            {tag}
        </button>
    );
}

// Generate JSON-LD structured data for SEO
function generateStructuredData(articles: Article[]) {
    const baseUrl = 'https://masterprima.co.id';

    const blogStructuredData = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Blog MasterPrima",
        "description": "Blog dan artikel terbaru seputar bimbel, CPNS, TNI-POLRI, UTBK, Kedinasan, dan pendidikan",
        "url": `${baseUrl}/blog`,
        "publisher": {
            "@type": "Organization",
            "name": "MasterPrima",
            "url": baseUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/mp.ico`
            }
        },
        "blogPost": articles.slice(0, 10).map(article => ({
            "@type": "BlogPosting",
            "headline": article.title,
            "description": article.summary,
            "url": `${baseUrl}/blog/${article.slug}`,
            "datePublished": article.publish_date,
            "dateModified": article.updated_at || article.publish_date,
            "author": {
                "@type": "Person",
                "name": article.author_name || "Tim MasterPrima"
            },
            "publisher": {
                "@type": "Organization",
                "name": "MasterPrima",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${baseUrl}/mp.ico`
                }
            },
            "image": article.thumbnail ? {
                "@type": "ImageObject",
                "url": article.thumbnail
            } : undefined,
            "keywords": article.tags.join(", "),
            "wordCount": article.content ? article.content.split(/\s+/).length : article.summary.split(/\s+/).length,
            "timeRequired": `PT${readingTime(article)}M`,
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ReadAction",
                "userInteractionCount": article.views
            }
        }))
    };

    const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${baseUrl}/blog`
            }
        ]
    };

    return [blogStructuredData, breadcrumbStructuredData];
}

export default function BlogPageClient() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagsError, setTagsError] = useState<string | null>(null);
    const [activeTag, setActiveTag] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sort, setSort] = useState<'date' | 'views'>('date');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch articles
    const fetchArticles = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/public/articles');
            const data = await res.json();
            if (!Array.isArray(data)) {
                setArticles([]);
            } else {
                setArticles(data);
            }
        } catch {
            setArticles([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fallback: Collect tags from articles
    const collectTagsFromArticles = (articles: Article[]) => {
        const tagSet = new Set<string>();
        articles.forEach(article => {
            (article.tags ?? []).forEach(tag => tag && tag.trim() && tagSet.add(tag.trim()));
        });
        return Array.from(tagSet).sort();
    };

    // Fetch tags from the correct endpoint
    const fetchTags = async (articlesList: Article[]) => {
        try {
            setTagsError(null);
            const res = await fetch('/api/auth-mp-secure-2024/public/tags');
            if (!res.ok) throw new Error('Tag endpoint not found');
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setTags(data.sort());
            } else if (data && Array.isArray(data.tags) && data.tags.length > 0) {
                setTags(data.tags.sort());
            } else {
                const collected = collectTagsFromArticles(articlesList);
                setTags(collected);
                setTagsError("No tags endpoint data; using collected tags.");
            }
        } catch {
            const collected = collectTagsFromArticles(articlesList);
            setTags(collected);
            setTagsError("Tag endpoint missing; tags collected from articles.");
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    useEffect(() => {
        fetchTags(articles);
        // eslint-disable-next-line
    }, [articles]);

    const filteredArticles = useMemo(() => {
        let filtered = articles;
        if (searchQuery) {
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        if (activeTag) {
            filtered = filtered.filter(a =>
                Array.isArray(a.tags) && a.tags.includes(activeTag)
            );
        }
        if (sort === 'views') {
            filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0));
        } else {
            filtered = [...filtered].sort((a, b) =>
                (b.publish_date || '').localeCompare(a.publish_date || '')
            );
        }
        return filtered;
    }, [articles, activeTag, sort, searchQuery]);

    const popularArticles = useMemo(() => {
        return articles
            .filter(a => a.views && a.views > 0)
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
    }, [articles]);

    const clearSearch = () => setSearchQuery('');
    const clearAllFilters = () => {
        setActiveTag('');
        setSearchQuery('');
        setSort('date');
    };

    // Generate structured data when articles are loaded
    // FIX: tags removed from generateStructuredData call
    const structuredData = useMemo(() => {
        if (articles.length > 0) {
            return generateStructuredData(articles);
        }
        return [];
    }, [articles]);

    return (
        <>
            <Head>
                {/* Additional SEO meta tags */}
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta property="og:locale" content="id_ID" />
                <meta property="og:site_name" content="MasterPrima Surabaya" />
                <meta name="twitter:site" content="@masterprima" />
                <meta name="twitter:creator" content="@masterprima" />

                {/* Structured Data */}
                {structuredData.map((data, index) => (
                    <script
                        key={`structured-data-${index}`}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
                    />
                ))}

                {/* Preconnect to external domains for performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Additional meta tags for better SEO */}
                <meta name="theme-color" content="#f97316" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="MasterPrima Blog" />
                <meta name="application-name" content="MasterPrima Blog" />
                <meta name="msapplication-TileColor" content="#f97316" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
            </Head>

            <main className="bg-gradient-to-b from-orange-50 to-white min-h-screen">
                <StickyBanner />
                <Navbar />

                {/* Hero Section with improved semantic HTML */}
                <header className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-16 pb-12">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold font-urbanist text-gray-900 mb-6">
                            Blog & Artikel
                            <span className="block text-orange-500">MasterPrima</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Kumpulan artikel, tips, dan berita terbaru seputar bimbel, CPNS, TNI-POLRI, UTBK, Kedinasan, dan pendidikan.
                        </p>

                        {/* Search Bar with better accessibility */}
                        <div className="relative max-w-lg mx-auto mb-8">
                            <label htmlFor="search-articles" className="sr-only">
                                Cari artikel
                            </label>
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="search-articles"
                                type="search"
                                placeholder="Cari artikel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-700 placeholder-gray-400"
                                aria-describedby="search-help"
                            />
                            <div id="search-help" className="sr-only">
                                Ketik kata kunci untuk mencari artikel yang Anda inginkan
                            </div>
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Hapus pencarian"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Stats with better semantic structure */}
                        <div className="flex justify-center items-center gap-8 text-sm text-gray-500" role="status" aria-live="polite">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span aria-label={`${articles.length} artikel tersedia`}>
                                    {articles.length} artikel
                                </span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                <span aria-label={`${tags.length} kategori tersedia`}>
                                    {tags.length} kategori
                                </span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span aria-label={`Total ${articles.reduce((total, article) => total + (article.views || 0), 0).toLocaleString()} views`}>
                                    {articles.reduce((total, article) => total + (article.views || 0), 0).toLocaleString()} views
                                </span>
                            </span>
                        </div>

                        {/* Tag endpoint error */}
                        {tagsError && (
                            <div className="mt-4 text-sm text-orange-700 bg-orange-100 rounded p-2 inline-block" role="alert">
                                {tagsError}
                            </div>
                        )}
                    </div>
                </header>

                <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Main Content */}
                        <main className="flex-1 min-w-0">
                            {/* Filter Controls */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <label htmlFor="sort-select" className="sr-only">
                                        Urutkan artikel berdasarkan
                                    </label>
                                    <select
                                        id="sort-select"
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value as 'date' | 'views')}
                                        className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                                    >
                                        <option value="date">Terbaru</option>
                                        <option value="views">Terpopuler</option>
                                    </select>
                                    {(activeTag || searchQuery) && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                            aria-label="Hapus semua filter"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500" role="status" aria-live="polite">
                                    {isLoading ? 'Memuat artikel...' : `${filteredArticles.length} artikel ditemukan`}
                                </div>
                            </div>

                            {/* Loading state */}
                            {isLoading && (
                                <div className="flex justify-center items-center py-12" role="status" aria-live="polite">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                                    <span className="sr-only">Memuat artikel...</span>
                                </div>
                            )}

                            {/* No articles found */}
                            {!isLoading && filteredArticles.length === 0 && (
                                <div className="text-center py-12" role="status">
                                    <p className="text-gray-500 text-lg mb-4">
                                        {searchQuery || activeTag ? 'Tidak ada artikel yang sesuai dengan filter Anda.' : 'Belum ada artikel tersedia.'}
                                    </p>
                                    {(searchQuery || activeTag) && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            Hapus filter untuk melihat semua artikel
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Articles Grid */}
                            {!isLoading && filteredArticles.length > 0 && (
                                <div className="grid gap-6" role="feed" aria-label="Daftar artikel blog">
                                    {filteredArticles.map((article, index) => (
                                        <article
                                            key={article.article_id}
                                            className={`
                        bg-white rounded-2xl border border-gray-100 overflow-hidden
                        hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                        focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-200
                        ${index === 0 ? 'lg:flex-row' : 'flex-col sm:flex-row'}
                      `}
                                        >
                                            <Link
                                                href={`/blog/${article.slug}`}
                                                className="group block focus:outline-none"
                                                aria-label={`Baca artikel: ${article.title}`}
                                            >
                                                <div className={`flex gap-6 p-6 ${index === 0 ? 'lg:items-center' : 'items-start'}`}>
                                                    {article.thumbnail && (
                                                        <div className={`
                              flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 relative
                              ${index === 0 ? 'w-48 h-32 lg:w-56 lg:h-36' : 'w-32 h-24 sm:w-40 sm:h-28'}
                            `}>
                                                            <Image
                                                                src={article.thumbnail || '/placeholder.png'}
                                                                alt={`Thumbnail untuk artikel: ${article.title}`}
                                                                width={index === 0 ? 224 : 160}
                                                                height={index === 0 ? 144 : 112}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                priority={index === 0}
                                                            />
                                                            {article.views && article.views > 0 && (
                                                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                                    <Eye className="w-3 h-3" />
                                                                    <span aria-label={`${article.views} views`}>
                                                                        {formatViews(article.views)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                                                            {article.author_name && (
                                                                <span className="flex items-center gap-1">
                                                                    <User className="w-3 h-3" />
                                                                    {article.author_name}
                                                                </span>
                                                            )}
                                                            {article.publish_date && (
                                                                <time
                                                                    className="flex items-center gap-1"
                                                                    dateTime={article.publish_date}
                                                                    title={formatDate(article.publish_date)}
                                                                >
                                                                    <Calendar className="w-3 h-3" />
                                                                    {formatDate(article.publish_date)}
                                                                </time>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span aria-label={`Waktu baca ${readingTime(article)} menit`}>
                                                                    {readingTime(article)} min read
                                                                </span>
                                                            </span>
                                                            {typeof article.views === 'number' && article.views > 0 && (
                                                                <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                                    <Eye className="w-3 h-3" />
                                                                    <span aria-label={`${article.views} views`}>
                                                                        {article.views.toLocaleString()} views
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h2 className={`
                              font-bold text-gray-900 mb-3 line-clamp-2
                              group-hover:text-orange-600 transition-colors
                              ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'}
                            `}>
                                                            {article.title}
                                                        </h2>
                                                        {article.summary && (
                                                            <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                                                {article.summary}
                                                            </p>
                                                        )}
                                                        {article.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2" role="list" aria-label="Tag artikel">
                                                                {article.tags.map((tag, tagIndex) => (
                                                                    <span
                                                                        key={`${article.article_id}-tag-${tagIndex}`}
                                                                        className="bg-orange-50 text-orange-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                                                                        role="listitem"
                                                                    >
                                                                        <Tag className="w-3 h-3" />
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </main>

                        {/* Sidebar: Tags & Popular */}
                        <aside className="w-full lg:w-80 lg:flex-shrink-0" role="complementary" aria-label="Sidebar">
                            <div className="sticky top-8 space-y-8 mt-20">
                                {/* Categories */}
                                <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-orange-500" />
                                        Kategori
                                    </h3>
                                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter berdasarkan kategori">
                                        {tags.length > 0 ? (
                                            tags.map((tag, index) => (
                                                <TagButton
                                                    key={`tag-${index}-${tag}`}
                                                    tag={tag}
                                                    active={activeTag === tag}
                                                    onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                                                />
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm">Belum ada kategori</span>
                                        )}
                                    </div>
                                    {tagsError && (
                                        <div className="mt-3 text-xs text-orange-700 bg-orange-100 rounded p-2" role="alert">
                                            {tagsError}
                                        </div>
                                    )}
                                </section>

                                {/* Popular Articles */}
                                {popularArticles.length > 0 && (
                                    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-orange-500" />
                                            Artikel Terpopuler
                                        </h3>
                                        <div className="space-y-4" role="list" aria-label="Artikel terpopuler">
                                            {popularArticles.map((article, index) => (
                                                <div key={`popular-${article.article_id}`} role="listitem">
                                                    <Link
                                                        href={`/blog/${article.slug}`}
                                                        className="block group focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-lg p-1 -m-1"
                                                        aria-label={`Artikel terpopuler #${index + 1}: ${article.title}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 truncate">
                                                                    {article.title}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                    <Eye className="w-3 h-3" />
                                                                    <span aria-label={`${article.views} views`}>
                                                                        {formatViews(article.views)}
                                                                    </span>
                                                                    <span className="ml-2 flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        <span aria-label={`${readingTime(article)} menit baca`}>
                                                                            {readingTime(article)} min
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </aside>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 py-12">
                        <Footer />
                    </div>
                </footer>
            </main>
        </>
    );
}
