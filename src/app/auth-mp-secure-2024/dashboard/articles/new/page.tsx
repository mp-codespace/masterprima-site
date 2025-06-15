// src\app\auth-mp-secure-2024\dashboard\articles\new\page.tsx

'use client'

import { useState, useMemo, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Loader, AlertCircle, CheckCircle, ArrowLeft, RefreshCw, Tag, Calendar, Image as ImageIcon, Eye, Edit, Upload, FileText } from 'lucide-react';
import { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import dynamic from 'next/dynamic';
import * as mammoth from 'mammoth';
import Image from 'next/image';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Root, Content, Heading, Paragraph, Code, Blockquote, List, ListItem, Image as MdastImage } from 'mdast';
import { supabase } from '@/lib/supabase/client';

// --- Markdown To Blocks ---
const markdownToBlocks = (markdown: string): PartialBlock[] => {
  const tree = remark().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const blocks: PartialBlock[] = [];

  function toText(node: Content): string {
    switch (node.type) {
      case 'text':
        return node.value;
      case 'strong':
        return (node.children as Content[]).map(toText).join('');
      case 'emphasis':
        return (node.children as Content[]).map(toText).join('');
      case 'inlineCode':
        return node.value;
      case 'link':
        return (node.children as Content[]).map(toText).join('');
      default:
        if ('children' in node && Array.isArray(node.children)) {
          return (node.children as Content[]).map(toText).join('');
        }
        return '';
    }
  }

  visit(tree, (node) => {
    if (node.type === 'heading') {
      const heading = node as Heading;
      blocks.push({
        type: 'heading',
        props: { level: Math.min(heading.depth, 3) as 1 | 2 | 3 },
        content: heading.children.map(toText).join(''),
      });
    } else if (node.type === 'paragraph') {
      const para = node as Paragraph;
      // If paragraph is only an image, map to image block
      if (
        para.children.length === 1 &&
        para.children[0].type === 'image'
      ) {
        const img = para.children[0] as MdastImage;
        blocks.push({
          type: 'image',
          props: { url: img.url },
        });
      } else {
        blocks.push({
          type: 'paragraph',
          content: para.children.map(toText).join(''),
        });
      }
    } else if (node.type === 'code') {
      const code = node as Code;
      blocks.push({
        type: 'codeBlock',
        content: code.value,
        props: code.lang ? { language: code.lang } : {},
      });
    } else if (node.type === 'blockquote') {
      const blockquote = node as Blockquote;
      blocks.push({
        type: 'paragraph',
        content: blockquote.children.map(toText).join(''),
        props: { textColor: 'gray' },
      });
    } else if (node.type === 'list') {
      const list = node as List;
      for (const item of list.children) {
        const listItem = item as ListItem;
        const listContent = listItem.children.map((liChild: Content) =>
          toText(liChild)
        ).join('');
        if (list.ordered) {
          blocks.push({
            type: 'numberedListItem',
            content: listContent,
          });
        } else {
          blocks.push({
            type: 'bulletListItem',
            content: listContent,
          });
        }
      }
    } else if (node.type === 'thematicBreak') {
      blocks.push({ type: 'paragraph', content: '---' });
    } else if (node.type === 'image') {
      const img = node as MdastImage;
      blocks.push({
        type: 'image',
        props: { url: img.url }, // Only url!
      });
    }
  });

  return blocks.length > 0 ? blocks : [{ type: "paragraph", content: "" }];
};

// --- Slug generator ---
const generateSlug = (title: string): string =>
  title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+|-+$/g, '');

// --- Editor Component ---
const Editor = ({
  onChange,
  content,
}: { onChange: (value: string) => void; content?: string }) => {
  const editor = useCreateBlockNote();
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Only load initial content ONCE (not on every update)
  useEffect(() => {
    if (!initialLoaded && editor && content) {
      try {
        const blocks: PartialBlock[] = JSON.parse(content);
        editor.replaceBlocks(editor.document, blocks);
        setInitialLoaded(true);
      } catch {
        editor.replaceBlocks(editor.document, [{ type: "paragraph", content }]);
        setInitialLoaded(true);
      }
    }
    // eslint-disable-next-line
  }, [editor, content, initialLoaded]);

  return (
    <div className="w-full max-w-none">
      <BlockNoteView
        editor={editor}
        theme="light"
        formattingToolbar={true}
        slashMenu={true}
        sideMenu={true}
        onChange={() => {
          onChange(JSON.stringify(editor.document, null, 2));
        }}
        editable={true}
      />
    </div>
  );
};

// --- Preview Component ---
const Preview = ({ title, summary, thumbnailUrl, contentJSON }: { title: string; summary: string; thumbnailUrl: string; contentJSON: string; }) => {
  const previewEditor = useCreateBlockNote();
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    async function loadContent() {
      if (previewEditor) {
        try {
          const blocks: PartialBlock[] = contentJSON ? JSON.parse(contentJSON) : [];
          await previewEditor.replaceBlocks(previewEditor.document, blocks);
        } catch {
          await previewEditor.replaceBlocks(previewEditor.document, []);
        }
      }
    }
    loadContent();
  }, [contentJSON, previewEditor]);

  useEffect(() => setThumbnailError(false), [thumbnailUrl]);

  if (!previewEditor) return null;

  return (
    <article className="prose prose-sm sm:prose-base max-w-none">
      {thumbnailUrl && !thumbnailError && (
        <div className="w-full aspect-video mb-8 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={thumbnailUrl}
            alt="Article thumbnail preview"
            width={800}
            height={450}
            className="w-full h-full object-cover"
            onError={() => setThumbnailError(true)}
            unoptimized // Allow external
          />
        </div>
      )}
      {thumbnailUrl && thumbnailError && (
        <div className="w-full aspect-video mb-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Unable to load thumbnail</p>
          </div>
        </div>
      )}
      <h1>{title || 'Article Title'}</h1>
      {summary && <p className="lead">{summary}</p>}
      <div>
        <BlockNoteView editor={previewEditor} theme="light" editable={false} />
      </div>
    </article>
  );
};

// --- Main Page ---
export default function NewArticlePage() {
  // Form state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState(''); // BlockNote JSON
  const [publishDate, setPublishDate] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Memoized editor/preview
  const MemoizedEditor = useMemo(() => dynamic(() => Promise.resolve(Editor), { ssr: false, loading: () => <p>Loading editor...</p> }), []);
  const MemoizedPreview = useMemo(() => dynamic(() => Promise.resolve(Preview), { ssr: false, loading: () => <p>Loading preview...</p> }), []);

  // ---- Thumbnail Import Handler (with Supabase upload) ----
  const handleThumbnailImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImportError("Please select an image file.");
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      // Show preview instantly while uploading
      setThumbnailUrl(URL.createObjectURL(file));

      // --- IMPORTANT: Your bucket must exist! ---
      const ext = file.name.split('.').pop();
      const filePath = `thumbnails/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase
        .storage
        .from('article-thumbnails') // This bucket must exist in your Supabase Storage UI!
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data } = supabase
        .storage
        .from('article-thumbnails')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) throw new Error('Could not get thumbnail URL.');
      setThumbnailUrl(data.publicUrl);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setImportError(err.message || 'Thumbnail upload failed.');
      } else {
        setImportError('Thumbnail upload failed.');
      }
    } finally {
      setIsImporting(false);
      if (event.target) event.target.value = '';
    }
  };


  // ---- File Import Handler ----
  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportError(null);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let importedContent = '';
      let extractedTitle = '';

      switch (fileExtension) {
        case 'txt': {
          importedContent = await file.text();
          const lines = importedContent.split('\n');
          if (lines[0] && lines[0].length < 100 && lines[0].length > 10) {
            extractedTitle = lines[0].trim();
            importedContent = lines.slice(1).join('\n').trim();
          }
          break;
        }
        case 'md':
        case 'markdown': {
          importedContent = await file.text();
          const mdLines = importedContent.split('\n');
          const firstHeadingIndex = mdLines.findIndex(line => line.trim().startsWith('#'));
          let extractedTitle = '';
          if (firstHeadingIndex !== -1) {
            const firstHeading = mdLines[firstHeadingIndex];
            extractedTitle = firstHeading.replace(/^#+\s*/, '').trim();
            mdLines.splice(firstHeadingIndex, 1);
            importedContent = mdLines.join('\n').trim();
          }
          if (extractedTitle && !title) setTitle(extractedTitle);
          const blocks = markdownToBlocks(importedContent);
          setContent(JSON.stringify(blocks, null, 2));
          break;
        }
        case 'docx': {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          importedContent = result.value;
          const titleMatch = importedContent.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i)
            || importedContent.match(/<p[^>]*><strong>(.*?)<\/strong><\/p>/i)
            || importedContent.match(/<p[^>]*>(.*?)<\/p>/i);
          if (titleMatch && titleMatch[1] && titleMatch[1].length < 100 && titleMatch[1].length > 10) {
            extractedTitle = titleMatch[1].replace(/<[^>]*>/g, '').trim();
          }
          break;
        }
        case 'html':
        case 'htm': {
          importedContent = await file.text();
          const htmlTitleMatch = importedContent.match(/<title>(.*?)<\/title>/i)
            || importedContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
          if (htmlTitleMatch && htmlTitleMatch[1]) {
            extractedTitle = htmlTitleMatch[1].replace(/<[^>]*>/g, '').trim();
          }
          break;
        }
        default:
          throw new Error('Unsupported file format. Please use .txt, .md, .docx, or .html files.');
      }

      let blocks: PartialBlock[] = [];
      if (fileExtension === 'txt') {
        blocks = importedContent.split('\n\n').map(p => ({ type: "paragraph", content: p.trim() }));
      } else if (fileExtension === 'md' || fileExtension === 'markdown') {
        blocks = markdownToBlocks(importedContent);
      } else if (fileExtension === 'docx' || fileExtension === 'html' || fileExtension === 'htm') {
        const plain = importedContent.replace(/<[^>]*>/g, '').trim();
        blocks = plain.split('\n\n').map(p => ({ type: "paragraph", content: p.trim() }));
      }

      if (extractedTitle && !title) {
        setTitle(extractedTitle);
        if (!slug) setSlug(generateSlug(extractedTitle));
      }

      setContent(JSON.stringify(blocks, null, 2));

      if (!summary && importedContent) {
        const plainText = importedContent.replace(/<[^>]*>/g, '').trim();
        const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const firstSentences = sentences.slice(0, 2).join('. ');
        if (firstSentences && firstSentences.length > 20) {
          setSummary(firstSentences.substring(0, 200) + (firstSentences.length > 200 ? '...' : '.'));
        }
      }
    } catch (err: unknown) {
      setImportError((err as Error).message);
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleSlugGeneration = () => {
    if (title) setSlug(generateSlug(title));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth-mp-secure-2024/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          summary,
          thumbnail: thumbnailUrl,
          is_published: isPublished,
          publish_date: publishDate || null,
          slug,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setSuccess('Article created successfully! Redirecting...');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/auth-mp-secure-2024/dashboard/articles" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to all articles
            </Link>
            <h1 className="text-3xl font-bold font-urbanist text-neutral-charcoal">Create New Article</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">
                {isPublished ? 'Publish' : 'Set to Draft'}
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 ${isPublished ? 'bg-primary-orange' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary-orange text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-orange/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Article'}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {importError && (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-r-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{importError}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="lg:hidden border-b border-gray-200 p-4">
                <div className="flex items-center justify-center">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${!showPreview ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Edit className="w-4 h-4" />
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${showPreview ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!showPreview ? (
                  <div className="w-full max-w-none space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          id="fileImport"
                          accept=".txt,.md,.markdown,.docx,.html,.htm"
                          onChange={handleFileImport}
                          className="hidden"
                        />
                        <label
                          htmlFor="fileImport"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        >
                          {isImporting ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {isImporting ? 'Importing...' : 'Import Document'}
                        </label>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FileText className="w-3 h-3" />
                          <span>Supports: .txt, .md, .docx, .html</span>
                        </div>
                      </div>
                    </div>

                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Article Title..."
                      className="w-full text-2xl sm:text-4xl font-bold font-urbanist bg-transparent focus:outline-none placeholder-gray-300 border-none p-0 m-0"
                      required
                    />
                    <div className="w-full blocknote-editor-container">
                      <MemoizedEditor onChange={setContent} content={content} />
                    </div>
                  </div>
                ) : (
                  <div className="blocknote-editor-container">
                    <MemoizedPreview title={title} summary={summary} thumbnailUrl={thumbnailUrl} contentJSON={content} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 h-fit sticky top-24">
              <h2 className="text-lg font-semibold text-neutral-charcoal">Post Settings</h2>

              <div className="space-y-2">
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="A short, compelling summary for the article..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-primary-orange transition-colors min-h-[100px] resize-vertical"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="thumbnailUrl"
                    type="url"
                    value={thumbnailUrl}
                    onChange={e => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-primary-orange transition-colors"
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
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="my-awesome-article"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-primary-orange transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSlugGeneration}
                    className="p-2 text-gray-500 hover:text-primary-orange hover:bg-gray-100 rounded-md transition-colors"
                    title="Generate from title"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="tech, news, update"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-primary-orange transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500">Separate tags with a comma.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">Publish Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="publishDate"
                    type="date"
                    value={publishDate}
                    onChange={e => setPublishDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-primary-orange transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
