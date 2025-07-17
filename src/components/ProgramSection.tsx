/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ProgramSection.tsx

'use client';

import React, { useState } from 'react';
import useSiteSettings from '@/lib/hooks/useSiteSettings';

interface ProgramCard {
  id: number;
  name: string;
  subtitle?: string;
  price: number | string;
  originalPrice?: number | string;
  features: string[];
  badge?: string;
  badgeColor?: string;
  isPopular?: boolean;
  ctaText?: string;
  detailsAvailable?: boolean;
  maxStudents?: string;
}

const ProgramSection: React.FC = () => {
  const { settings } = useSiteSettings();
  // STATE: expand/collapse per card, by id
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Get program list from settings or fallback
  const programs: ProgramCard[] = settings?.programs?.length
    ? settings.programs.map((p: any) => ({
      ...p,
      ctaText: p.ctaText || 'Ambil Paket Ini',
    }))
    : [
      {
        id: 1,
        name: "Paket KEDINASAN JAMINAN",
        subtitle: "All In One",
        price: 15000000,
        features: [
          "Modul khusus SKD KEDINASAN, SKB, Psikotes",
          "Didampingi semua tahapan tes kedinasan",
          "Materi SKD, SKB, Psikotes, dan Wawancara",
          "Simulasi tes sampai/keseluruhan",
          "Bimbingan total sampai 50 kali TM @ 90 menit",
          "Tambahan belajar gratis (Unlimited Group)",
          "Simulasi CBT minimal 8 kali",
          "Pengajar terstandar kualitas 'A'",
          "Gratis software bank soal SKD",
          "Gratis eLearning SKD senilai 1 juta",
          "Ruangan belajar full AC",
          "Dilengkapi dengan perjanjian bermateri"
        ],
        badge: "ALL IN ONE",
        badgeColor: "bg-red-600",
        isPopular: true,
        ctaText: "Ambil Paket Jaminan",
        detailsAvailable: true,
        maxStudents: "Max. 10 Siswa Per Kelas"
      },
      {
        id: 2,
        name: "Paket CPNS PLATINUM",
        subtitle: "Investasi Sukses Jadi PNS",
        price: 8100000,
        features: [
          "Masuk 30 kali TM @90 menit",
          "Gratis pemantapan materi jelang ujian",
          "Garansi lulus SKD dengan perjanjian bermateri",
          "Gratis tambahan belajar unlimited group",
          "Panduan belajar SKD update",
          "Pengajar tersertifikasi kualitas 'A'",
          "Simulasi CAT SKD Standar BKN",
          "Success card lulus CPNS",
          "Gratis software bank soal SKD",
          "Gratis e-learning senilai 1 juta (khusus pembayaran lunas)",
          "Metode Evaluasi Full CAT Standar BKN"
        ],
        badge: "PLATINUM",
        badgeColor: "bg-red-500",
        ctaText: "Pilih CPNS Platinum",
        detailsAvailable: true
      },
      {
        id: 3,
        name: "Paket SNBT PLATINUM",
        subtitle: "Program Bimbel Class UTBK/SNBT",
        price: 12600000,
        originalPrice: 14000000,
        features: [
          "2 TM Per minggu @90 menit sampai menjelang UTBK",
          "Jadwal bimbel flexibel (diambil dari Voting Class)",
          "Modul belajar terupdate",
          "Simulasi CAT",
          "Pengajar tersertifikasi kualitas 'A'",
          "Free konsultasi",
          "Ruangan belajar nyaman & berAC",
          "Biaya bimbel dapat diangsur maks. 3 kali",
          "Minimal 1 Siswa untuk kelas Platinum",
          "Fokus materi UTBK lengkap"
        ],
        badge: "PLATINUM",
        badgeColor: "bg-primary-orange",
        ctaText: "Pilih SNBT Platinum",
        detailsAvailable: true
      }
    ];

  // WhatsApp admin number
  const wa = settings?.contact_whatsapp || '6285646877888';
  const waLink = (msg: string) =>
    `https://wa.me/${wa.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;

  const formatPrice = (price: number | string) => {
    const n = typeof price === 'number' ? price : parseInt(price.toString().replace(/\D/g, ''));
    return 'Rp ' + n.toLocaleString('id-ID');
  };

  const handleWhatsAppClick = (program?: ProgramCard) => {
    let message = "Halo, saya tertarik dengan paket bimbingan belajar di Master Prima. Mohon informasi lebih lanjut.";
    if (program) {
      message = `Halo, saya tertarik dengan *${program.name}${program.subtitle ? ` - ${program.subtitle}` : ''}* dengan harga ${formatPrice(program.price)}.
      
Bisa tolong berikan informasi lebih detail mengenai:
- Jadwal belajar
- Fasilitas yang didapat
- Proses pendaftaran
- Metode pembayaran

Terima kasih!`;
    }
    window.open(waLink(message), '_blank');
  };

  const handleConsultationClick = () => {
    window.open(waLink("Halo, saya ingin konsultasi memilih paket terbaik di Master Prima."), '_blank');
  };

  const toggleExpanded = (cardId: number) => {
    setExpanded(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br bg-neutral-cream">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-section-heading text-neutral-charcoal mb-4">
            Paket Unggulan Master Prima
          </h2>
          <p className="text-body-main text-neutral-dark-gray max-w-2xl mx-auto">
            Pilih paket bimbingan belajar terbaik yang sesuai dengan target ujian Anda.
            Semua paket dilengkapi dengan fasilitas terbaik dan pengajar berkualitas A.
          </p>
        </div>

        {/* Program Cards Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 items-start">
          {programs.map((program) => {
            const isExpanded = !!expanded[program.id];
            const shownFeatures = isExpanded ? program.features.length : 4;
            return (
              <div
                key={program.id}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${program.isPopular ? 'ring-2 ring-red-500 scale-105' : ''
                  }`}
                style={{ minHeight: 'fit-content' }}
              >
                {/* Badge */}
                {program.badge && (
                  <div className={`absolute top-0 right-0 ${program.badgeColor} text-white px-4 py-2 rounded-bl-xl font-semibold text-xs z-10`}>
                    {program.badge}
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-subheading text-neutral-charcoal mb-2">
                      {program.name}
                    </h3>
                    {program.subtitle && (
                      <p className="text-body-small text-neutral-dark-gray mb-4">
                        {program.subtitle}
                      </p>
                    )}
                    {/* Max Students Info */}
                    {program.maxStudents && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
                        <p className="text-xs text-red-600 font-medium text-center">
                          🎯 {program.maxStudents}
                        </p>
                      </div>
                    )}
                    {/* Price */}
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-bold text-primary-orange">
                        {formatPrice(program.price)}
                      </span>
                      {program.originalPrice && (
                        <span className="text-sm text-neutral-dark-gray line-through">
                          {formatPrice(program.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex-1 mb-6">
                    <div className="transition-all duration-300 ease-in-out">
                      <ul className="space-y-2">
                        {program.features.slice(0, shownFeatures).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 transition-all duration-200">
                            <span className="text-green-500 text-sm flex-shrink-0 mt-1">✓</span>
                            <span className="text-body-small text-neutral-dark-gray">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Show More/Less Button */}
                    {program.features.length > 4 && (
                      <button
                        onClick={() => toggleExpanded(program.id)}
                        className="mt-3 text-primary-orange hover:text-primary-red transition-colors text-sm font-medium"
                      >
                        {isExpanded ? 'Lihat Lebih Sedikit' : `Lihat ${program.features.length - 4} Fitur Lainnya`}
                      </button>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleWhatsAppClick(program)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${program.isPopular
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-primary-orange hover:bg-orange-600 text-white'
                        }`}>
                      {program.ctaText || 'Ambil Paket Ini'}
                    </button>

                    {program.detailsAvailable && (
                      <button className="w-full py-3 px-4 rounded-xl border-2 border-neutral-dark-gray text-neutral-dark-gray hover:bg-neutral-dark-gray hover:text-white transition-all duration-200 font-medium">
                        Lihat Detail Paket
                      </button>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-neutral-dark-gray text-center">
                      💰 Harga belum termasuk pendaftaran {program.id === 1 ? 'Rp 300.000' : 'Rp 200.000'}
                    </p>
                    <p className="text-xs text-neutral-dark-gray text-center mt-1">
                      📞 Konsultasi gratis untuk pemilihan paket terbaik
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-12 text-center bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-neutral-charcoal mb-4">
            Masih Bingung Memilih Paket?
          </h3>
          <p className="text-body-main text-neutral-dark-gray mb-6">
            Hubungi konsultan kami untuk mendapatkan rekomendasi paket yang tepat sesuai dengan target dan kemampuan Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleWhatsAppClick()}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>📱</span>
              WhatsApp: {wa.startsWith('62') ? `+${wa}` : wa}
            </button>
            <button
              onClick={handleConsultationClick}
              className="bg-primary-orange hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Konsultasi Gratis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;