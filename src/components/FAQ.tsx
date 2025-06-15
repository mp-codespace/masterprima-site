// src\components\FAQ.tsx

'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    category?: string;
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "Apa keunggulan program bimbingan di Master Prima?",
        answer: "Master Prima menawarkan program bimbingan yang komprehensif dengan metode pembelajaran yang terbukti efektif. Kami memiliki tenaga pengajar berpengalaman, materi pembelajaran yang up-to-date, sistem evaluasi berkala, dan pendampingan intensif untuk memastikan siswa mencapai target akademiknya.",
        category: "Program"
    },
    {
        id: 2,
        question: "Di mana lokasi bimbel Master Prima?",
        answer: "Master Prima memiliki beberapa cabang yang tersebar di kota-kota besar. Untuk informasi lokasi lengkap, Anda dapat menghubungi customer service kami atau mengunjungi website resmi untuk melihat daftar cabang terdekat dengan lokasi Anda.",
        category: "Lokasi"
    },
    {
        id: 3,
        question: "Berapa lama durasi bimbingan?",
        answer: "Durasi bimbingan bervariasi tergantung program yang dipilih. Program reguler berlangsung 6-12 bulan, program intensif 3-6 bulan, dan program super intensif 1-3 bulan. Setiap sesi pembelajaran berlangsung 90-120 menit dengan frekuensi 2-3 kali per minggu.",
        category: "Program"
    },
    {
        id: 4,
        question: "Bagaimana cara mendaftar di Master Prima?",
        answer: "Proses pendaftaran sangat mudah. Anda dapat mendaftar melalui website resmi, datang langsung ke cabang terdekat, atau menghubungi customer service. Setelah mendaftar, siswa akan mengikuti tes penempatan untuk menentukan kelas yang sesuai.",
        category: "Pendaftaran"
    },
    {
        id: 5,
        question: "Apakah tersedia program online?",
        answer: "Ya, kami menyediakan program belajar online dengan teknologi terdepan. Program online dilengkapi dengan video pembelajaran interaktif, sesi live dengan pengajar, dan sistem tracking progress yang komprehensif.",
        category: "Program"
    },
    {
        id: 6,
        question: "Bagaimana sistem pembayaran di Master Prima?",
        answer: "Kami menyediakan berbagai opsi pembayaran yang fleksibel termasuk pembayaran tunai, transfer bank, cicilan 0%, dan pembayaran digital. Tim admin akan membantu Anda memilih metode pembayaran yang paling sesuai.",
        category: "Pembayaran"
    }
];

const FAQ: React.FC = () => {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set([1]));

    const toggleItem = (id: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
    };

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
                            <div className="text-3xl font-bold text-primary-red mb-2 font-urbanist">{faqData.length}+</div>
                            <div className="text-neutral-dark-gray font-medium font-plus-jakarta">Pertanyaan Umum</div>
                            <div className="text-gray-500 text-sm mt-1 font-plus-jakarta">Jawaban lengkap dan terverifikasi</div>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="text-3xl font-bold text-primary-red mb-2 font-urbanist">24/7</div>
                            <div className="text-neutral-dark-gray font-medium font-plus-jakarta">Customer Support</div>
                            <div className="text-gray-500 text-sm mt-1 font-plus-jakarta">Siap membantu kapan saja</div>
                        </div>
                        {/* <div className="bg-gradient-to-r from-primary-red to-primary-red rounded-3xl p-8 text-white">
                            <h3 className="text-xl font-bold mb-4 font-urbanist">Butuh bantuan lebih?</h3>
                            <p className="text-red-100 mb-6 text-sm leading-relaxed font-plus-jakarta">
                                Tim ahli kami siap membantu menjawab pertanyaan spesifik Anda
                            </p>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center gap-3 bg-white text-primary-red py-3 px-4 rounded-xl font-semibold hover:bg-red-50 transition-colors font-plus-jakarta">
                                    <Phone className="w-5 h-5" />
                                    Hubungi Kami
                                </button>
                            </div>
                        </div> */}
                    </div>

                    {/* FAQ Items - Right Side */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {faqData.map((item) => {
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
                                                        <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${isOpen 
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
                                                className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
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
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;