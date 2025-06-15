// src\components\ProgramSection.tsx

'use client';

import React, { useState } from 'react';

interface ProgramCard {
  id: number;
  title: string;
  subtitle?: string;
  price: string;
  originalPrice?: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
  isPopular?: boolean;
  ctaText: string;
  detailsAvailable: boolean;
  maxStudents?: string;
}

const ProgramSection: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const programs: ProgramCard[] = [
    {
      id: 1,
      title: "Paket KEDINASAN JAMINAN",
      subtitle: "All In One",
      price: "Rp 15.000.000",
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
      title: "Paket CPNS PLATINUM",
      subtitle: "Investasi Sukses Jadi PNS",
      price: "Rp 8.100.000",
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
      title: "Paket SNBT PLATINUM",
      subtitle: "Program Bimbel Class UTBK/SNBT",
      price: "Rp 12.600.000",
      originalPrice: "Rp 14.000.000",
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

  const toggleExpanded = (cardId: number) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const formatPrice = (price: string) => {
    return price.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  const handleWhatsAppClick = (program?: ProgramCard) => {
    const phoneNumber = "6285646877888"; // Format internasional tanpa tanda +
    let message = "Halo, saya tertarik dengan paket bimbingan belajar di Master Prima. Mohon informasi lebih lanjut.";
    
    if (program) {
      message = `Halo, saya tertarik dengan *${program.title}${program.subtitle ? ` - ${program.subtitle}` : ''}* dengan harga ${program.price}. 

Bisa tolong berikan informasi lebih detail mengenai:
- Jadwal belajar
- Fasilitas yang didapat
- Proses pendaftaran
- Metode pembayaran

Terima kasih!`;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleConsultationClick = () => {
    window.open('https://heylink.me/masterprimasby', '_blank');
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
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
          {programs.map((program) => (
            <div
              key={program.id}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                program.isPopular ? 'ring-2 ring-red-500 scale-105' : ''
              }`}
            >
              {/* Badge */}
              {program.badge && (
                <div className={`absolute top-0 right-0 ${program.badgeColor} text-white px-4 py-2 rounded-bl-xl font-semibold text-xs z-10`}>
                  {program.badge}
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-subheading text-neutral-charcoal mb-2">
                    {program.title}
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

                {/* Features Preview */}
                <div className="mb-6">
                  <ul className="space-y-2">
                    {program.features.slice(0, expandedCard === program.id ? program.features.length : 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-body-small text-neutral-dark-gray">
                        <span className="text-primary-orange mt-1 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Show More/Less Button */}
                  {program.features.length > 4 && (
                    <button
                      onClick={() => toggleExpanded(program.id)}
                      className="mt-3 text-primary-orange hover:text-primary-red transition-colors text-sm font-medium"
                    >
                      {expandedCard === program.id ? 'Lihat Lebih Sedikit' : `Lihat ${program.features.length - 4} Fitur Lainnya`}
                    </button>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleWhatsAppClick(program)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      program.isPopular
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-primary-orange hover:bg-orange-600 text-white'
                    }`}>
                    {program.ctaText}
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
          ))}
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
              WhatsApp: +62 856-4687-7888
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