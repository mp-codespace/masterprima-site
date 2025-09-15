/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/auth-mp-secure-2024/dashboard/testimoni/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Loader, CheckCircle, AlertCircle, Plus, Trash2, Save, Edit3, X, Star,
  Building, User, Calendar, Award, Upload
} from 'lucide-react';
import Image from 'next/image';

interface TestimoniItem {
  id: number;
  name: string;
  position: string;
  rating: number;
  review: string;
  institution: string;
  score?: string;
  year: string;
  verified: boolean;
  image_url?: string | null;
  tempId?: string; // Add temporary ID for new items
}

// Create a unique temporary ID that won't change between renders
let tempIdCounter = 0;

const emptyTestimoni = (): TestimoniItem => ({
  id: 0,
  name: '',
  position: '',
  rating: 5,
  review: '',
  institution: '',
  score: '',
  year: new Date().getFullYear().toString(),
  verified: true,
  image_url: null,
  tempId: `temp-${++tempIdCounter}`, // Stable temporary ID
});

export default function TestimoniDashboardPage() {
  const [testimoni, setTestimoni] = useState<TestimoniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Fixed key generation - use stable IDs
  const generateKey = (item: TestimoniItem, idx: number) => {
    if (item.id) return `testimoni-${item.id}`;
    if (item.tempId) return `new-testimoni-${item.tempId}`;
    return `testimoni-idx-${idx}`;
  };

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const fetchTestimoni = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth-mp-secure-2024/testimonials', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load testimonials');
      const arr = await res.json();
      setTestimoni(arr);
    } catch {
      setError('Failed to load testimonials');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimoni();
  }, []);

  const handleChange = (idx: number, field: keyof TestimoniItem, value: any) => {
    setTestimoni((old) => old.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const addTestimoni = () => {
    const newTestimoni = emptyTestimoni();
    setTestimoni((old) => [...old, newTestimoni]);
    setEditingIdx(testimoni.length);
  };

  // ---------- IMAGE UPLOAD (via API route) ----------
  const handleImageUpload = async (idx: number, file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image size must be less than 5MB'); return; }

    setUploadingImage(idx);
    setError('');

    try {
      const fd = new FormData();
      fd.append('file', file, file.name);

      const res = await fetch('/api/auth-mp-secure-2024/upload-testimonial-image', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      handleChange(idx, 'image_url', data.url as string);
      setSuccess('Image uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(null);
      if (fileInputRefs.current[idx]) fileInputRefs.current[idx]!.value = '';
    }
  };

  // ---------- REMOVE IMAGE (via API route) ----------
  const removeImage = async (idx: number) => {
    const url = testimoni[idx]?.image_url;
    if (!url) { handleChange(idx, 'image_url', null); return; }

    try {
      const res = await fetch(
        `/api/auth-mp-secure-2024/upload-testimonial-image?path=${encodeURIComponent(url)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      handleChange(idx, 'image_url', null);
      setSuccess('Image removed.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete image.');
    }
  };

  // ---------- DELETE TESTIMONIAL ----------
  const deleteTestimoni = async (idx: number) => {
    const item = testimoni[idx];
    setDeleteIdx(null);

    if (!item.id) {
      setTestimoni((old) => old.filter((_, i) => i !== idx));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (item.image_url) await removeImage(idx);

      // Kirim ID via query param (kompatibel untuk DELETE)
      let res = await fetch(
        `/api/auth-mp-secure-2024/testimonials?id=${encodeURIComponent(String(item.id))}`,
        { method: 'DELETE', credentials: 'include' }
      );

      // Fallback: server yang butuh body JSON
      if (!res.ok) {
        res = await fetch('/api/auth-mp-secure-2024/testimonials', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: item.id }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to delete (status ${res.status})`);

      setSuccess('Testimonial deleted successfully!');
      await fetchTestimoni();
    } catch (e: any) {
      setError(e.message || 'Failed to delete testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const saveTestimonial = async (idx: number) => {
    const item = testimoni[idx];
    if (!item.name?.trim() || !item.review?.trim()) {
      setError('Name and Review fields are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const testimonialData = {
        name: item.name.trim(),
        position: item.position?.trim() || '',
        institution: item.institution?.trim() || '',
        year: item.year?.trim() || new Date().getFullYear().toString(),
        rating: Number(item.rating) || 5,
        score: item.score?.trim() || '',
        review: item.review.trim(),
        verified: Boolean(item.verified),
        image_url: typeof item.image_url === 'string' ? item.image_url.trim() : null,
      };

      const method = item.id ? 'PUT' : 'POST';
      const body = item.id ? JSON.stringify({ ...testimonialData, id: item.id }) : JSON.stringify(testimonialData);

      const res = await fetch('/api/auth-mp-secure-2024/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${item.id ? 'update' : 'add'} testimonial.`);
      }

      setSuccess(`Testimonial ${item.id ? 'updated' : 'added'} successfully!`);
      setEditingIdx(null);
      await fetchTestimoni();
    } catch (e: any) {
      setError(e.message || 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';

  const ProfileAvatar = ({ item }: { item: TestimoniItem }) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { setImageError(false); setIsLoading(true); }, [item.image_url]);

    const handleImageLoad = () => setIsLoading(false);
    const handleImageError = () => { setImageError(true); setIsLoading(false); };

    if (!item.image_url || imageError) {
      return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-xs sm:text-sm">{getInitials(item.name)}</span>
        </div>
      );
    }

    return (
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
        {isLoading && <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse"></div>}
        <Image
          src={item.image_url}
          alt={`Profile photo of ${item.name}`}
          width={48}
          height={48}
          className={`w-full h-full object-cover rounded-full border-2 border-white shadow-sm transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          unoptimized
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Testimonial Management</h1>
              <p className="mt-1 text-gray-500">Manage alumni testimonials with profile photos for the landing page.</p>
            </div>
            <button
              type="button"
              onClick={addTestimoni}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimoni.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials yet</h3>
                <p className="text-gray-500">Add your first testimonial to get started.</p>
              </div>
            </div>
          ) : (
            testimoni.map((item, idx) => (
              <div
                key={generateKey(item, idx)}
                className={`relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                  editingIdx === idx ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {editingIdx === idx ? (
                  // -------- Edit Mode --------
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Profile Image */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {item.image_url ? (
                              <div className="relative">
                                <Image
                                  src={item.image_url}
                                  alt={item.name || 'Profile'}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                  unoptimized
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  title="Remove image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                <span className="text-gray-500 text-lg font-semibold">
                                  {getInitials(item.name)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              ref={(el) => { fileInputRefs.current[idx] = el; }}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(idx, file);
                              }}
                              className="hidden"
                              id={`image-upload-${idx}`}
                            />
                            <label
                              htmlFor={`image-upload-${idx}`}
                              className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                                uploadingImage === idx ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {uploadingImage === idx ? (
                                <><Loader className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                              ) : (
                                <><Upload className="w-4 h-4 mr-2" />{item.image_url ? 'Change' : 'Upload'}</>
                              )}
                            </label>
                            <p className="mt-1 text-xs text-gray-500">JPG, PNG up to 5MB</p>
                          </div>
                        </div>
                      </div>

                      {/* Fields */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => handleChange(idx, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                     bg-white text-gray-900 tracking-normal normal-case leading-normal font-normal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={item.position || ''}
                          onChange={(e) => handleChange(idx, 'position', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                     bg-white text-gray-900 tracking-normal normal-case leading-normal font-normal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          value={item.institution || ''}
                          onChange={(e) => handleChange(idx, 'institution', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                     bg-white text-gray-900 tracking-normal normal-case leading-normal font-normal"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                          <input
                            type="number" min="2020" max="2030"
                            value={item.year || ''}
                            onChange={(e) => handleChange(idx, 'year', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                       bg-white text-gray-900 tracking-normal normal-case leading-normal font-normal"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <select
                            value={item.rating || 5}
                            onChange={(e) => handleChange(idx, 'rating', Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
                                       text-gray-900 tracking-normal normal-case leading-normal font-normal"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                            <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                            <option value={3}>⭐⭐⭐ 3 Stars</option>
                            <option value={2}>⭐⭐ 2 Stars</option>
                            <option value={1}>⭐ 1 Star</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKD Score (Optional)</label>
                        <input
                          type="text"
                          value={item.score || ''}
                          onChange={(e) => handleChange(idx, 'score', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                                     bg-white text-gray-900 tracking-normal normal-case leading-normal font-normal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
                        <textarea
                          value={item.review || ''}
                          onChange={(e) => handleChange(idx, 'review', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical
                                     bg-white text-gray-900 tracking-normal normal-case leading-normal font-normal"
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`verified-${idx}`}
                          checked={item.verified}
                          onChange={(e) => handleChange(idx, 'verified', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`verified-${idx}`} className="ml-2 block text-sm text-gray-700">
                          Show verification badge
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setEditingIdx(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 mr-1 inline" />Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveTestimonial(idx)}
                        disabled={saving || uploadingImage === idx}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? <Loader className="w-4 h-4 mr-1 inline animate-spin" /> : <Save className="w-4 h-4 mr-1 inline" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // -------- View Mode --------
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <ProfileAvatar item={item} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name || 'Unnamed'}</h3>
                            {item.verified && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1 mb-2">{renderStars(item.rating)}</div>
                        </div>
                      </div>
                      {/* Icon actions */}
                      <div className="flex gap-2 z-10 pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => setEditingIdx(idx)}
                          aria-label="Edit testimonial"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteIdx(idx)}
                          aria-label="Delete testimonial"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" /><span>{item.position || 'No position'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" /><span>{item.institution || 'No institution'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{item.year}</span></div>
                        {item.score && <div className="flex items-center gap-1"><Award className="w-4 h-4" /><span>SKD: {item.score}</span></div>}
                      </div>
                      <div className="mt-4">
                        <p className="text-gray-700 text-sm leading-relaxed">{item.review || 'No review provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteIdx === idx && (
                  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Testimonial</h3>
                      <p className="text-gray-500 mb-4">Are you sure? This will also remove the associated image.</p>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setDeleteIdx(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTestimoni(idx)}
                          disabled={saving}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {saving ? <Loader className="w-4 h-4 inline animate-spin mr-1" /> : null}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}