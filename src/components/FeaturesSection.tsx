// src\components\FeaturesSection.tsx

'use client';
import { Building2, Monitor, User } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Building2,
      title: "Belajarlah dengan Ahlinya",
      description: "Masterprima bimbingan belajar khusus persiapan masuk Sekolah Kedinasan dengan pengalaman lebih dari 11 tahun berhasil membantu mengantar ratusan siswa kuliah langsung ikatan dinas menjadi CPNS."
    },
    {
      icon: Monitor,
      title: "Biaya Terjangkau",
      description: "Dapatkan solusi belajar berkualitas premium tanpa menguras anggaran Anda. Pilihan rencana belajar yang fleksibel dan hemat biaya, dirancang untuk kebutuhan Anda."
    },
    {
      icon: User,
      title: "Rencana Belajar yang Disesuaikan",
      description: "Nikmati rencana belajar yang dirancang khusus sesuai dengan gaya, kebutuhan, dan tujuan Anda untuk hasil yang optimal."
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-secondary-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Kenapa Memilih{' '}
            <span className="text-orange-500">Masterprima</span>?
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                {/* Icon Container */}
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base max-w-sm mx-auto">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;