/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/LihatDetailPaket.tsx

'use client';

import React from 'react';
import { ArrowLeft, Check, Clock, Users, BookOpen, Star, Shield, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useSiteSettings from '@/lib/hooks/useSiteSettings';

interface LihatDetailPaketProps {
  data: any;
  type: 'program' | 'plan';
}

const LihatDetailPaket: React.FC<LihatDetailPaketProps> = ({ data }) => {
  const router = useRouter();
  const { settings } = useSiteSettings();

  // Get contact info from settings
  const wa = settings?.contact_whatsapp || '6285646877888';
  const phone = settings?.contact_phone || '085646877888';
  const email = settings?.contact_email || 'masterprimasurabaya@gmail.com';

  const formatPrice = (price: number | string) => {
    const n = typeof price === 'number' ? price : parseInt(price.toString().replace(/\D/g, ''));
    return 'Rp ' + n.toLocaleString('id-ID');
  };

  const handleWhatsAppReservation = () => {
    const message = `Halo, saya tertarik untuk melakukan reservasi paket *${data.name}${data.subtitle ? ` - ${data.subtitle}` : ''}* dengan harga ${formatPrice(data.price)}.

Mohon informasi lebih lanjut mengenai:
- Jadwal belajar yang tersedia
- Proses pendaftaran
- Metode pembayaran
- Persyaratan yang dibutuhkan

Terima kasih!`;

    const waLink = `https://wa.me/${wa.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  const handlePhoneCall = () => {
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_blank');
  };

  const handleEmailContact = () => {
    const subject = `Reservasi ${data.name}`;
    const body = `Halo, saya tertarik untuk melakukan reservasi paket ${data.name}. Mohon informasi lebih lanjut.`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-dark-gray hover:text-primary-orange transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-charcoal mb-2">
                    {data.name}
                  </h1>
                  {data.subtitle && (
                    <p className="text-lg text-neutral-dark-gray mb-4">
                      {data.subtitle}
                    </p>
                  )}
                  {data.category && (
                    <span className="inline-block bg-primary-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                      {data.category}
                    </span>
                  )}
                </div>
                {data.badge && (
                  <div className={`${data.badgeColor} text-white px-4 py-2 rounded-xl font-semibold text-sm`}>
                    {data.badge}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-primary-orange">
                  {formatPrice(data.price)}
                </span>
                {data.originalPrice && (
                  <span className="text-lg text-neutral-dark-gray line-through">
                    {formatPrice(data.originalPrice)}
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {data.duration && (
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <Clock className="w-6 h-6 text-primary-orange mx-auto mb-2" />
                    <p className="text-sm text-neutral-dark-gray">Durasi</p>
                    <p className="font-semibold text-neutral-charcoal">{data.duration}</p>
                  </div>
                )}
                {data.sessions && (
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <BookOpen className="w-6 h-6 text-primary-orange mx-auto mb-2" />
                    <p className="text-sm text-neutral-dark-gray">Pertemuan</p>
                    <p className="font-semibold text-neutral-charcoal">{data.sessions}</p>
                  </div>
                )}
                {data.maxStudents && (
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <Users className="w-6 h-6 text-primary-orange mx-auto mb-2" />
                    <p className="text-sm text-neutral-dark-gray">Kapasitas</p>
                    <p className="font-semibold text-neutral-charcoal">{data.maxStudents}</p>
                  </div>
                )}
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <Star className="w-6 h-6 text-primary-orange mx-auto mb-2" />
                  <p className="text-sm text-neutral-dark-gray">Rating</p>
                  <p className="font-semibold text-neutral-charcoal">4.9/5</p>
                </div>
              </div>

              {/* Description */}
              {data.description && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-neutral-charcoal mb-4">
                    Deskripsi Paket
                  </h3>
                  <p className="text-neutral-dark-gray leading-relaxed">
                    {data.description}
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-neutral-charcoal mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary-orange" />
                Fasilitas & Benefit
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {data.features?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-neutral-dark-gray leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-neutral-charcoal mb-6">
                Informasi Tambahan
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-neutral-charcoal mb-3">Biaya Pendaftaran</h4>
                  <p className="text-neutral-dark-gray text-sm mb-4">
                    {data.id === 1 ? 'Rp 300.000' : 'Rp 200.000'} (belum termasuk dalam harga paket)
                  </p>
                  
                  <h4 className="font-semibold text-neutral-charcoal mb-3">Metode Pembayaran</h4>
                  <ul className="text-neutral-dark-gray text-sm space-y-1">
                    <li>• Transfer Bank</li>
                    <li>• Cash</li>
                    <li>• Cicilan (maksimal 3x)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-neutral-charcoal mb-3">Syarat & Ketentuan</h4>
                  <ul className="text-neutral-dark-gray text-sm space-y-1">
                    <li>• Minimal usia 17 tahun</li>
                    <li>• Mengisi formulir pendaftaran</li>
                    <li>• Menyerahkan fotokopi KTP</li>
                    <li>• Mengikuti placement test</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Reservation Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-neutral-charcoal mb-4">
                  Reservasi Sekarang
                </h3>
                <p className="text-neutral-dark-gray text-sm mb-6">
                  Dapatkan slot terbatas dengan konsultasi gratis untuk memilih jadwal yang sesuai dengan Anda.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppReservation}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </button>
                  
                  <button
                    onClick={handlePhoneCall}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Telepon
                  </button>
                  
                  <button
                    onClick={handleEmailContact}
                    className="w-full bg-primary-orange hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Email
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-charcoal mb-4">
                  Kontak Kami
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-neutral-dark-gray">WhatsApp:</p>
                    <p className="font-medium text-neutral-charcoal">
                      {wa.startsWith('62') ? `+${wa}` : wa}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-dark-gray">Telepon:</p>
                    <p className="font-medium text-neutral-charcoal">
                      {phone.startsWith('+') ? phone : `+62 ${phone.replace(/^0/, '')}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-dark-gray">Email:</p>
                    <p className="font-medium text-neutral-charcoal">{email}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-charcoal mb-4">
                  Lokasi
                </h3>
                <p className="text-sm text-neutral-dark-gray">
                  Jl. Gubernur Suryo No. 3<br />
                  Komplek SMA Trimurti<br />
                  Surabaya, Jawa Timur
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LihatDetailPaket;