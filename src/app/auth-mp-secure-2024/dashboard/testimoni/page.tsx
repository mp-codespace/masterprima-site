/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/auth-mp-secure-2024/dashboard/testimoni/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Loader, CheckCircle, AlertCircle, Plus, Trash2, Edit3, Save, X, Star, Building, User, Calendar, Award } from 'lucide-react';

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
}

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
});

export default function TestimoniDashboardPage() {
  const [testimoni, setTestimoni] = useState<TestimoniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  // Generate unique key for each item
  const generateKey = (item: TestimoniItem, idx: number) => {
    return item.id ? `testimoni-${item.id}` : `new-testimoni-${idx}-${Date.now()}`;
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch all testimonials
  const fetchTestimoni = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth-mp-secure-2024/testimonials');
      if (!res.ok) throw new Error('Failed to load');
      const arr = await res.json();
      setTestimoni(arr);
    } catch (e: any) {
      setError('Failed to load testimonials');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimoni();
  }, []);

  // Edit field in table
  const handleChange = (idx: number, field: keyof TestimoniItem, value: any) => {
    setTestimoni((old) =>
      old.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    );
  };

  // Add new empty testimonial
  const addTestimoni = () => {
    setTestimoni((old) => [...old, emptyTestimoni()]);
    setEditingIdx(testimoni.length);
  };

  // Delete testimonial
  const deleteTestimoni = async (idx: number) => {
    const item = testimoni[idx];
    setDeleteIdx(null);

    // New draft, never saved (id=0)
    if (!item.id) {
      setTestimoni((old) => old.filter((_, i) => i !== idx));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth-mp-secure-2024/testimonials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setSuccess('Testimonial deleted successfully!');
      await fetchTestimoni();
    } catch (e: any) {
      setError('Failed to delete testimonial');
    }
    setSaving(false);
  };

  // Save individual testimonial
  const saveTestimonial = async (idx: number) => {
    const item = testimoni[idx];
    if (!item.name?.trim()) {
      setError('Name is required');
      return;
    }
    if (!item.review?.trim()) {
      setError('Review is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare data for API
      const testimonialData = {
        name: item.name.trim(),
        position: item.position?.trim() || '',
        institution: item.institution?.trim() || '',
        year: item.year?.trim() || new Date().getFullYear().toString(),
        rating: Number(item.rating) || 5,
        score: item.score?.trim() || '',
        review: item.review.trim(),
        verified: Boolean(item.verified)
      };

      if (!item.id) {
        // New testimonial - POST
        const res = await fetch('/api/auth-mp-secure-2024/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testimonialData),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to add testimonial');
        }
        
        setSuccess('New testimonial added successfully!');
      } else {
        // Update existing testimonial - PUT
        const res = await fetch('/api/auth-mp-secure-2024/testimonials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...testimonialData, id: item.id }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update testimonial');
        }
        
        setSuccess('Testimonial updated successfully!');
      }
      
      setEditingIdx(null);
      await fetchTestimoni();
      
    } catch (e: any) {
      setError(e.message || 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
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
              <p className="mt-1 text-gray-500">Manage alumni testimonials for Masterprima landing page</p>
            </div>
            <button
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
        {/* Alerts */}
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimoni.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials yet</h3>
                <p className="text-gray-500">Add your first testimonial to get started</p>
              </div>
            </div>
          ) : (
            testimoni.map((item, idx) => (
              <div
                key={generateKey(item, idx)}
                className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                  editingIdx === idx ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {editingIdx === idx ? (
                  // Edit Mode
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => handleChange(idx, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={item.name ? '' : 'Enter full name'}
                          autoComplete="off"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={item.position || ''}
                          onChange={(e) => handleChange(idx, 'position', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={item.position ? '' : 'Enter job position'}
                          autoComplete="off"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          value={item.institution || ''}
                          onChange={(e) => handleChange(idx, 'institution', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={item.institution ? '' : 'Enter institution name'}
                          autoComplete="off"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                          <input
                            type="number"
                            min="2020"
                            max="2030"
                            value={item.year || ''}
                            onChange={(e) => handleChange(idx, 'year', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={item.year ? '' : '2024'}
                            autoComplete="off"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <select
                            value={item.rating || 5}
                            onChange={(e) => handleChange(idx, 'rating', Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value={1}>⭐ 1 Star</option>
                            <option value={2}>⭐⭐ 2 Stars</option>
                            <option value={3}>⭐⭐⭐ 3 Stars</option>
                            <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                            <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKD Score (Optional)</label>
                        <input
                          type="text"
                          value={item.score || ''}
                          onChange={(e) => handleChange(idx, 'score', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={item.score ? '' : 'e.g., 450'}
                          autoComplete="off"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
                        <textarea
                          value={item.review || ''}
                          onChange={(e) => handleChange(idx, 'review', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                          rows={4}
                          placeholder={item.review ? '' : 'Write testimonial review...'}
                          autoComplete="off"
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
                        onClick={() => setEditingIdx(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <X className="w-4 h-4 mr-1 inline" />
                        Cancel
                      </button>
                      <button
                        onClick={() => saveTestimonial(idx)}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader className="w-4 h-4 mr-1 inline animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1 inline" />
                        )}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name || 'Unnamed'}</h3>
                          {item.verified && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(item.rating)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingIdx(idx)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteIdx(idx)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{item.position || 'No position'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{item.institution || 'No institution'}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{item.year}</span>
                        </div>
                        {item.score && (
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>SKD: {item.score}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {item.review || 'No review provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Delete Confirmation Modal */}
                {deleteIdx === idx && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Testimonial</h3>
                      <p className="text-gray-500 mb-4">Are you sure you want to delete this testimonial? This action cannot be undone.</p>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setDeleteIdx(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteTestimoni(idx)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
                        >
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