// src/components/FAQ.tsx

'use client';

import { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

const FAQ: React.FC = () => {
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Fetch FAQ data dari Supabase (public API)
    setLoading(true);
    fetch('/api/public/faqs')
      .then((res) => res.json())
      .then((data) => {
        setFaqData(Array.isArray(data) ? data : []);
        // Buka satu pertanyaan pertama kalau ada
        if (Array.isArray(data) && data.length > 0) {
          setOpenItems(new Set([data[0].id]));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleItem = (id: number) => {
    setOpenItems((prev) => {
      const newOpen = new Set(prev);
      if (newOpen.has(id)) {
        newOpen.delete(id);
      } else {
        newOpen.add(id);
      }
      return newOpen;
    });
  };

  if (loading) {
      return (
        <section className="py-16">
          <div className="text-center text-gray-400 text-lg">Memuat FAQ...</div>
        </section>
      );
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-neutral-cream to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <span className="bg-secondary-lemon text-primary-red px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block font-plus-jakarta">
              Bantuan & Dukungan
            </span>
          </div>
          <h1 className="text-hero mb-6 font-urbanist">
            <span className="text-neutral-charcoal">Frequently</span>
            <br />
            <span className="bg-gradient-to-r from-primary-red to-primary-red bg-clip-text text-transparent">
              asked questions
            </span>
          </h1>
          <p className="text-xl text-neutral-dark-gray max-w-3xl mx-auto leading-relaxed font-plus-jakarta">
            Temukan jawaban untuk pertanyaan umum tentang program bimbingan Master Prima
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Stats/Info Cards - Left Side */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-primary-red mb-2 font-urbanist">
                {loading ? '...' : faqData.length}+
              </div>
              <div className="text-neutral-dark-gray font-medium font-plus-jakarta">Pertanyaan Umum</div>
              <div className="text-gray-500 text-sm mt-1 font-plus-jakarta">Jawaban lengkap dan terverifikasi</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-primary-red mb-2 font-urbanist">24/7</div>
              <div className="text-neutral-dark-gray font-medium font-plus-jakarta">Customer Support</div>
              <div className="text-gray-500 text-sm mt-1 font-plus-jakarta">Siap membantu kapan saja</div>
            </div>
          </div>

          {/* FAQ Items - Right Side */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="text-center py-12 text-neutral-dark-gray">Memuat data FAQ...</div>
                ) : faqData.length === 0 ? (
                  <div className="text-center py-12 text-neutral-dark-gray">Belum ada data FAQ.</div>
                ) : (
                  faqData.map((item) => {
                    const isOpen = openItems.has(item.id);
                    return (
                      <div key={item.id} className="group">
                        {/* Question Header */}
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full px-8 py-6 text-left focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors duration-200"
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-4">
                              {item.category && (
                                <span className="inline-block bg-gray-100 text-neutral-dark-gray px-3 py-1 rounded-full text-xs font-medium mb-2 font-plus-jakarta">
                                  {item.category}
                                </span>
                              )}
                              <h3 className="text-lg font-semibold text-neutral-charcoal leading-relaxed group-hover:text-primary-red transition-colors font-urbanist">
                                {item.question}
                              </h3>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                                isOpen
                                  ? 'bg-primary-red text-white'
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-primary-red'
                                }`}>
                                {isOpen ? (
                                  <Minus className="w-5 h-5" />
                                ) : (
                                  <Plus className="w-5 h-5" />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                        {/* Answer Content */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-out ${
                            isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-8 pb-6 pt-6">
                            <div className="bg-gray-50 rounded-2xl p-6">
                              <p className="text-neutral-dark-gray leading-relaxed font-plus-jakarta">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
