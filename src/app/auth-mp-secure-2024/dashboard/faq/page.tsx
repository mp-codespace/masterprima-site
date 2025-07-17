/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/auth-mp-secure-2024/dashboard/faq/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Loader, CheckCircle, AlertCircle, Plus, Trash2, Save, Edit3, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

const emptyFAQ = (): FAQItem => ({
  id: 0, // New FAQ
  question: '',
  answer: '',
  category: '',
});

export default function FAQDashboardPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  // Load FAQ from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/auth-mp-secure-2024/faqs');
        if (!res.ok) throw new Error('Failed to load');
        const arr = await res.json();
        setFaqs(arr);
      } catch (e: any) {
        setError('Gagal memuat data FAQ');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Form change
  const handleChange = (idx: number, field: keyof FAQItem, value: any) => {
    setFaqs(old =>
      old.map((faq, i) => (i === idx ? { ...faq, [field]: value } : faq))
    );
  };

  // Tambah FAQ lokal (belum terkirim ke backend)
  const addFAQ = () => {
    setFaqs(old => [...old, emptyFAQ()]);
  };

  // Delete FAQ: langsung dari backend jika sudah punya id
  const deleteFAQ = async (idx: number) => {
    const faq = faqs[idx];
    setDeleteIdx(null);
    setSaving(true);
    setError('');
    try {
      if (faq.id) {
        // delete di backend
        const res = await fetch('/api/auth-mp-secure-2024/faqs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: faq.id }),
        });
        if (!res.ok) throw new Error('Failed to delete');
      }
      // Setelah delete, refetch semua FAQ dari backend
      const res = await fetch('/api/auth-mp-secure-2024/faqs');
      const arr = await res.json();
      setFaqs(arr);
      setSuccess('FAQ berhasil dihapus!');
    } catch (e: any) {
      setError('Gagal menghapus FAQ');
    }
    setSaving(false);
  };

  // Save/Sync all changes to backend (add & update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // add new FAQ (id == 0)
      for (const faq of faqs) {
        if (!faq.question || !faq.answer) continue;
        if (!faq.id || faq.id === 0) {
          // POST
          const res = await fetch('/api/auth-mp-secure-2024/faqs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faq),
          });
          if (!res.ok) throw new Error('Failed to add FAQ');
        } else {
          // PUT
          const res = await fetch('/api/auth-mp-secure-2024/faqs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faq),
          });
          if (!res.ok) throw new Error('Failed to update FAQ');
        }
      }
      // Reload
      const res = await fetch('/api/auth-mp-secure-2024/faqs');
      const arr = await res.json();
      setFaqs(arr);
      setSuccess('FAQ berhasil disimpan!');
    } catch (e: any) {
      setError('Gagal menyimpan perubahan');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <p className="text-slate-600 text-lg font-medium">Memuat data FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Kelola FAQ Master Prima</h1>
              <p className="text-slate-600 mt-1">
                Tambah, edit, atau hapus pertanyaan umum (FAQ) yang tampil di website.
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex gap-3 items-center">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Action Bar */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-slate-600" />
                  <h2 className="text-xl font-semibold text-slate-800">Daftar FAQ</h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {faqs.length} item
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addFAQ}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  Tambah FAQ
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-700 min-w-[120px]">Kategori</th>
                    <th className="text-left p-4 font-semibold text-slate-700 min-w-[250px]">Pertanyaan</th>
                    <th className="text-left p-4 font-semibold text-slate-700 min-w-[350px]">Jawaban</th>
                    <th className="text-center p-4 font-semibold text-slate-700 w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-8 h-8 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-slate-500 text-lg font-medium">Belum ada FAQ</p>
                            <p className="text-slate-400 text-sm">Tambah pertanyaan pertama untuk memulai</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {faqs.map((item, idx) => (
                    <tr
                      key={item.id ? `faq-${item.id}` : `draft-${idx}`}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        deleteIdx === idx ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="Kategori"
                          value={item.category || ''}
                          onChange={e => handleChange(idx, 'category', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="Masukkan pertanyaan"
                          value={item.question}
                          onChange={e => handleChange(idx, 'question', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </td>
                      <td className="p-4">
                        <textarea
                          placeholder="Masukkan jawaban"
                          value={item.answer}
                          onChange={e => handleChange(idx, 'answer', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          rows={3}
                        />
                      </td>
                      <td className="p-4 text-center relative">
                        <button
                          type="button"
                          onClick={() => setDeleteIdx(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                          title="Hapus FAQ"
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {deleteIdx === idx && (
                          <div className="absolute z-10 right-0 top-full mt-2 bg-white border border-red-200 rounded-xl p-4 shadow-xl min-w-[200px]">
                            <p className="text-red-700 font-medium mb-3">Hapus FAQ ini?</p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                                onClick={() => deleteFAQ(idx)}
                                disabled={saving}
                              >
                                Ya, hapus
                              </button>
                              <button
                                type="button"
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors"
                                onClick={() => setDeleteIdx(null)}
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-slate-400 disabled:to-slate-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Semua Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}