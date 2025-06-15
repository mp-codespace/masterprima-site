// File path: src/app/auth-mp-secure-2024/dashboard/articles/page.tsx

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, Trash2, Edit, AlertTriangle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  updatedAt: string;
  status: 'Published' | 'Draft';
  authorName: string;
}

function formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Published' | 'Draft'>('All');
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const fetchArticles = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('/api/auth-mp-secure-2024/articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data: Article[] = await response.json();
      setArticles(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchArticles();
  }, [fetchArticles]);
  
  const handleDelete = async () => {
      if (!articleToDelete) return;

      const originalArticles = [...articles];
      setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
      
      try {
          const response = await fetch(`/api/auth-mp-secure-2024/articles/${articleToDelete.id}`, {
              method: 'DELETE',
          });
          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to delete article');
          }
      } catch (err) {
           setError((err as Error).message);
           setArticles(originalArticles);
      } finally {
          setArticleToDelete(null); 
      }
  };

  // Filter and sort articles based on search and active filter
  const filteredArticles = useMemo(() => {
    return articles
      .filter(article => {
        const matchesFilter = activeFilter === 'All' || article.status === activeFilter;
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [articles, searchTerm, activeFilter]);

  return (
    <div className="space-y-6">
        {/* Delete Confirmation Modal */}
        {articleToDelete && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Delete Article</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete &quot;{articleToDelete.title}&quot;? This action cannot be undone.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setArticleToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Cancel
                        </button>
                        <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-urbanist text-neutral-charcoal">Articles</h1>
                <p className="text-neutral-dark-gray mt-1">Create, manage, and organize all your content.</p>
            </div>
            <Link href="/auth-mp-secure-2024/dashboard/articles/new" className="flex items-center gap-2 bg-primary-orange text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-orange/90 transition-colors">
                <Plus className="w-4 h-4" />
                Create Article
            </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by article title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-primary-orange transition-colors"
                    />
                </div>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {(['All', 'Published', 'Draft'] as const).map(filter => (
                        <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 text-sm py-1 rounded-md transition-colors font-medium ${activeFilter === filter ? 'bg-white text-neutral-charcoal shadow-sm' : 'text-gray-500 hover:bg-gray-200/50'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b-2 border-gray-200 bg-gray-50">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse border-b border-gray-100">
                                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
                                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/2"></div></td>
                                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/2"></div></td>
                                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/2"></div></td>
                                <td className="p-4 flex justify-end gap-2"><div className="h-8 w-8 bg-gray-200 rounded-md"></div><div className="h-8 w-8 bg-gray-200 rounded-md"></div></td>
                            </tr>
                        ))}
                        {!isLoading && !error && filteredArticles.map(article => (
                            <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                <td className="p-4 font-semibold text-neutral-charcoal">{article.title}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${article.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {article.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">{article.authorName}</td>
                                <td className="p-4 text-gray-600">{formatDate(article.updatedAt)}</td>
                                <td className="p-4 text-right flex justify-end items-center gap-2">
                                    <Link href={`/auth-mp-secure-2024/dashboard/articles/${article.id}/edit`} className="p-2 text-gray-500 hover:text-primary-orange hover:bg-gray-100 rounded-md transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => setArticleToDelete(article)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {!isLoading && !error && filteredArticles.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300"/>
                    <h4 className="font-semibold text-lg">No Articles Found</h4>
                    <p className="text-sm">Try adjusting your search or filter to find what you&apos;re looking for.</p>
                </div>
             )}
              {error && <p className="text-center py-20 text-red-500">Error: {error}</p>}
        </div>
    </div>
  );
}
