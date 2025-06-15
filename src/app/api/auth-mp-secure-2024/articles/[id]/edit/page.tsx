// File path: src/app/auth-mp-secure-2024/dashboard/articles/[id]/edit/page.tsx
'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, Loader, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

interface ArticleData {
    title: string;
    content: string;
    summary: string;
    thumbnail: string;
    is_published: boolean;
}

export default function EditArticlePage() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // Fetch the specific article data when the component mounts
  const fetchArticle = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth-mp-secure-2024/articles/${id}`);
      if (!response.ok) throw new Error('Failed to fetch article data.');
      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!article) return;
      const { name, value } = e.target;
      setArticle({ ...article, [name]: value });
  };
  
  const handleStatusChange = () => {
      if (!article) return;
      setArticle({ ...article, is_published: !article.is_published });
  };

  // --- SUBMIT FUNCTION TO SAVE CHANGES ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!article) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
        const response = await fetch(`/api/auth-mp-secure-2024/articles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update article');

        setSuccess('Article updated successfully!');
        setTimeout(() => {
            router.push('/auth-mp-secure-2024/dashboard/articles');
            router.refresh(); // Tells Next.js to refetch server data on the articles page
        }, 1500);

    } catch (err) {
        setError((err as Error).message);
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading article editor...</div>;
  }
  
  if (error && !article) { // Show full-page error if article couldn't be loaded
    return <div className="bg-red-100 p-4 rounded-lg text-red-700">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <Link href="/auth-mp-secure-2024/dashboard/articles" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-2">
                <ArrowLeft className="w-4 h-4" />
                Back to all articles
            </Link>
          <h1 className="text-3xl font-bold font-urbanist text-neutral-charcoal">Edit Article</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-600">
                    {article?.is_published ? 'Status: Published' : 'Status: Draft'}
                </label>
                <button
                    type="button"
                    onClick={handleStatusChange}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 ${article?.is_published ? 'bg-primary-orange' : 'bg-gray-300'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${article?.is_published ? 'translate-x-5' : 'translate-x-0'}`}/>
                </button>
            </div>
            <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary-orange text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-orange/90 transition-colors disabled:bg-gray-400"
            >
                {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-center gap-3"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
      {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg flex items-center gap-3"><CheckCircle className="w-5 h-5" /><span>{success}</span></div>}


      <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200">
         <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Article Title</label>
            <input
                id="title"
                name="title"
                type="text"
                value={article?.title || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50"
                required
            />
         </div>
         <div className="space-y-2">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary</label>
            <textarea
                id="summary"
                name="summary"
                value={article?.summary || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50 min-h-[100px]"
                rows={3}
            />
         </div>
         <div className="space-y-2">
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
            <input
                id="thumbnail"
                name="thumbnail"
                type="url"
                value={article?.thumbnail || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50"
            />
         </div>
         <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
                id="content"
                name="content"
                value={article?.content || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50 min-h-[400px]"
                required
            />
         </div>
      </div>
    </form>
  );
}
