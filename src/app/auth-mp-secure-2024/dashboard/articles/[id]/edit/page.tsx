// src\app\auth-mp-secure-2024\dashboard\articles\[id]\edit\page.tsx

'use client'

import { useState, useEffect, useCallback, FormEvent, useRef, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, Loader, AlertCircle, ArrowLeft, CheckCircle, RefreshCw, Tag, Calendar, Image as ImageIcon, Upload } from 'lucide-react';
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import Image from "next/image";
import { supabase } from '@/lib/supabase/client'; // <--- Make sure this path is correct

interface ArticleData {
  title: string;
  content: string;
  summary: string;
  thumbnail: string | null;
  is_published: boolean;
  publish_date: string | null;
  slug: string | null;
  tags: string[] | null;
}

const Editor = ({ onChange, initialContent }: { onChange: (value: string) => void; initialContent?: string; }) => {
  const parseInitialContent = (content: string): PartialBlock[] | undefined => {
    if (!content || content.trim() === '') return undefined;
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      if (typeof content === 'string' && content.trim() !== '') {
        return [{ type: "paragraph", content }];
      }
      return undefined;
    }
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent ? parseInitialContent(initialContent) : undefined,
  });

  return (
    <div className="prose prose-sm sm:prose-base max-w-none [&>.ProseMirror]:min-h-[40vh] [&>.ProseMirror]:p-2 [&>.ProseMirror]:focus:outline-none">
      <BlockNoteView
        editor={editor}
        theme="light"
        onChange={() => {
          onChange(JSON.stringify(editor.document, null, 2));
        }}
      />
    </div>
  );
};

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export default function EditArticlePage() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Thumbnail upload state
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // Fetch article data
  const fetchArticle = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth-mp-secure-2024/articles/${id}`);
      if (!response.ok) throw new Error('Failed to fetch article data.');
      const data = await response.json();

      if (data.publish_date) {
        data.publish_date = new Date(data.publish_date).toISOString().split('T')[0];
      }

      setArticle(data);

    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Standard input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!article) return;
    const { name, value } = e.target;
    setArticle({ ...article, [name]: value });
  };

  // Tag handling
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!article) return;
    setArticle({ ...article, tags: e.target.value.split(',').map(t => t.trim()) });
  };

  // Toggle publish
  const handleStatusChange = () => {
    if (!article) return;
    setArticle({ ...article, is_published: !article.is_published });
  };

  const handleSlugGeneration = () => {
    if (article && article.title) {
      setArticle({ ...article, slug: generateSlug(article.title) });
    }
  };

  // Thumbnail upload handler (Supabase upload, previews, error)
  const handleThumbnailImport = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!article) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImportError("Please select an image file.");
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      // Show preview instantly
      setArticle({ ...article, thumbnail: URL.createObjectURL(file) });

      // ---- Upload to Supabase Storage (bucket must exist) ----
      const ext = file.name.split('.').pop();
      const filePath = `thumbnails/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase
        .storage
        .from('article-thumbnails')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase
        .storage
        .from('article-thumbnails')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) throw new Error('Could not get thumbnail URL.');
      setArticle({ ...article, thumbnail: data.publicUrl });

    } catch (err: unknown) {
      setImportError((err as Error).message || 'Thumbnail upload failed.');
    } finally {
      setIsImporting(false);
      if (event.target) event.target.value = '';
    }
  };

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
        body: JSON.stringify({
          ...article,
          tags: article.tags || []
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update article');

      setSuccess('Article updated successfully!');
      setTimeout(() => {
        router.push('/auth-mp-secure-2024/dashboard/articles');
        router.refresh();
      }, 1500);

    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-center p-10 font-semibold">Loading Article Editor...</div>;
  if (error && !article) return <div className="bg-red-100 p-4 rounded-lg text-red-700">{error}</div>;
  if (!article) return <div className="text-center p-10 font-semibold">Article not found.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/auth-mp-secure-2024/dashboard/articles" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
          <h1 className="text-3xl font-bold font-urbanist text-neutral-charcoal">Edit Article</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">
              {article.is_published ? 'Publish' : 'Set to Draft'}
            </label>
            <button
              type="button"
              onClick={handleStatusChange}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 ${article.is_published ? 'bg-primary-orange' : 'bg-green-500'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${article.is_published ? 'translate-x-5' : 'translate-x-0'}`} />
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
      </header>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-center gap-3"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
      {importError && <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-r-lg flex items-center gap-3"><AlertCircle className="w-5 h-5" /><span>{importError}</span></div>}
      {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg flex items-center gap-3"><CheckCircle className="w-5 h-5" /><span>{success}</span></div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sidebar */}
        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold text-neutral-charcoal">Post Settings</h2>
          <div className="space-y-2">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="summary" name="summary" value={article.summary || ''} onChange={handleInputChange} placeholder="A short summary..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50 min-h-[100px]" rows={4} />
          </div>
          <div className="space-y-2">
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
              Thumbnail URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="thumbnail"
                name="thumbnail"
                type="url"
                value={article.thumbnail || ''}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50"
              />
            </div>
            <input
              type="file"
              id="thumbnailImport"
              accept="image/*"
              onChange={handleThumbnailImport}
              ref={thumbnailInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
              disabled={isImporting}
            >
              {isImporting && !importError ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isImporting && !importError ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">URL Slug</label>
            <div className="flex items-center gap-2">
              <input id="slug" name="slug" type="text" value={article.slug || ''} onChange={handleInputChange} placeholder="my-awesome-article" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50" />
              <button type="button" onClick={handleSlugGeneration} className="p-2 text-gray-500 hover:text-primary-orange hover:bg-gray-100 rounded-md" title="Generate from title"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="tags" name="tags" type="text" value={Array.isArray(article.tags) ? article.tags.join(', ') : ''} onChange={handleTagsChange} placeholder="tech, news, update" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50" />
            </div>
            <p className="text-xs text-gray-500">Separate tags with a comma.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700">Publish Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="publish_date" name="publish_date" type="date" value={article.publish_date || ''} onChange={handleInputChange} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50" />
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm pl-2 pr-4 py-4 space-y-4">
          {/* Thumbnail Preview */}
          {article.thumbnail && (
            <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={article.thumbnail}
                alt="Article thumbnail preview"
                width={800}
                height={450}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          )}
          <input
            id="title"
            name="title"
            type="text"
            value={article.title || ''}
            onChange={handleInputChange}
            placeholder="Article Title..."
            className="w-full text-2xl sm:text-4xl font-bold font-urbanist bg-transparent focus:outline-none placeholder-gray-300"
            required
          />
          {article.content !== null && (
            <Editor
              onChange={(value) => {
                if (article) {
                  setArticle({ ...article, content: value });
                }
              }}
              initialContent={article.content}
            />
          )}
        </div>
      </div>
    </form>
  );
}
