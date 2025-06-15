// src\components\Testimoni.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

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

const Testimoni: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(3);

  const allTestimoni: TestimoniItem[] = [
    {
      id: 1,
      name: "Kak Medina",
      position: "Dosen CPNS",
      rating: 5,
      review: "Alhamdulillah keterima CPNS dosen. Terima kasih banyak atas bimbingannya kemarin. Bimbingan di Masterprima sangat membantu dalam persiapan CPNS.",
      institution: "Instansi Pemerintah",
      year: "2024",
      verified: true
    },
    {
      id: 2,
      name: "Septi Cahyaning S",
      position: "Calon ASN",
      rating: 5,
      review: "Alhamdulillah lolos SKD CPNS 2024. Terima kasih Masterprima atas bimbingan dan persiapan yang sangat membantu. Mohon doanya untuk tahap selanjutnya.",
      institution: "CPNS 2024",
      year: "2024",
      verified: true
    },
    {
      id: 3,
      name: "Kak Maria",
      position: "Calon ASN",
      rating: 5,
      review: "Pujian Tuhan lulus SKD dengan skor 410. Formasi Pemkot Serang. Terima kasih Masterprima atas bimbingan dan dukungannya selama persiapan CPNS.",
      institution: "Pemkot Serang",
      score: "410",
      year: "2024",
      verified: true
    },
    {
      id: 4,
      name: "Kak Daffa",
      position: "Jasa Ahli Pertama",
      rating: 5,
      review: "Alhamdulillah lulus SKD dengan skor 345 formasi Kejaksaan. Terima kasih atas bimbingan Masterprima yang sangat membantu dalam persiapan ujian.",
      institution: "Kejaksaan RI",
      score: "345",
      year: "2024",
      verified: true
    },
    {
      id: 5,
      name: "Mas Abi",
      position: "ASN 2025",
      rating: 5,
      review: "Alhamdulillah lolos CPNS 2024. Terima kasih banyak sudah dibantu persiapan pada saat SKD. Bimbingan Masterprima sangat efektif dan membantu.",
      institution: "ASN 2025",
      year: "2024",
      verified: true
    },
    {
      id: 6,
      name: "Mas Galang",
      position: "Perencana Ahli Pertama",
      rating: 5,
      review: "Alhamdulillah diberikan kesempatan untuk pengisian DRH dengan status P/L di SKB. Terima kasih atas bimbingan dan petunjuk selama ini.",
      institution: "Dinas PUPR Pemkab Mahakam Ulu",
      year: "2024",
      verified: true
    },
    {
      id: 7,
      name: "Mas Dani",
      position: "Penata Kelola Sistem IT",
      rating: 5,
      review: "Alhamdulillah berhasil dengan score SKD 381 untuk formasi penata kelola sistem dan teknologi informasi. Terima kasih bimbingan Masterprima.",
      institution: "Pemkot Surabaya",
      score: "381",
      year: "2024",
      verified: true
    },
    {
      id: 8,
      name: "Mbak Medina",
      position: "Calon ASN Kemendikbud",
      rating: 5,
      review: "Alhamdulillah lolos tahap SKD di Kemendikbud dengan nilai 436. Terima kasih banyak atas bimbingan Masterprima. Sukses terus Masterprima!",
      institution: "Kemendikbud",
      score: "436",
      year: "2024",
      verified: true
    }
  ];

  // Update itemsPerView based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(3); // Desktop: 3 items
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Calculate max index correctly
  const maxIndex = Math.max(0, allTestimoni.length - itemsPerView);
  const totalSlides = maxIndex + 1;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0; // Reset to beginning
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    // Resume auto play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    // Resume auto play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    // Resume auto play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 xl:py-20 bg-secondary-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-urbanist text-neutral-charcoal mb-3 sm:mb-4">
            Testimoni Alumni Masterprima
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-plus-jakarta text-neutral-dark-gray max-w-3xl mx-auto leading-relaxed">
            Berikut adalah cerita sukses alumni Masterprima yang telah berhasil lulus seleksi CPNS dan meraih impian menjadi Aparatur Sipil Negara.
          </p>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 z-10 bg-primary-red hover:bg-red-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 z-10 bg-primary-red hover:bg-red-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Slider Container */}
          <div className="overflow-hidden mx-6 sm:mx-8 lg:mx-12">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {allTestimoni.map((item) => (
                <div 
                  key={item.id} 
                  className="flex-shrink-0 px-2 sm:px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    {/* Card Content with proper padding and flex layout */}
                    <div className="p-4 sm:p-5 lg:p-6 flex flex-col h-full">
                      {/* Header - Fixed height section */}
                      <div className="flex items-start space-x-3 mb-4 flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-xs sm:text-sm">
                            {getInitials(item.name)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-neutral-charcoal text-sm sm:text-base font-plus-jakarta truncate">
                              {item.name}
                            </h4>
                            {item.verified && (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-primary-red text-xs sm:text-sm font-plus-jakarta font-medium truncate">
                            {item.position}
                          </p>
                          <p className="text-neutral-dark-gray text-xs font-plus-jakarta truncate">
                            {item.institution}
                          </p>
                        </div>
                        <div className="px-2 py-1 bg-secondary-lemon text-primary-red rounded-full text-xs font-plus-jakarta font-medium flex-shrink-0">
                          {item.year}
                        </div>
                      </div>

                      {/* Rating - Fixed height section */}
                      <div className="flex items-center space-x-1 mb-4 flex-shrink-0">
                        {renderStars(item.rating)}
                      </div>

                      {/* Review - Flexible height section */}
                      <div className="mb-4 flex-grow">
                        <p className="text-neutral-dark-gray text-xs sm:text-sm font-plus-jakarta leading-relaxed italic relative pl-3 border-l-2 sm:border-l-3 border-red-200">
                          {item.review}
                        </p>
                      </div>

                      {/* Score - Fixed height section if exists */}
                      {item.score && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex-shrink-0 mt-auto">
                          <div className="flex items-center justify-between">
                            <span className="text-green-700 font-plus-jakarta text-xs sm:text-sm font-medium">
                              Skor SKD:
                            </span>
                            <span className="text-green-800 font-plus-jakarta text-lg sm:text-xl font-bold">
                              {item.score}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-6 sm:mt-8">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-200 ${
                currentIndex === index
                  ? 'bg-primary-red scale-110'
                  : 'bg-red-300 hover:bg-red-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 sm:mt-12 lg:mt-16 flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-2xl w-full">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-red-400 text-center shadow-lg">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-urbanist font-bold text-primary-red mb-2">
                500+
              </div>
              <div className="text-neutral-charcoal text-xs sm:text-sm lg:text-base font-plus-jakarta">
                Alumni Lulus CPNS
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-green-400 text-center shadow-lg">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-urbanist font-bold text-green-600 mb-2">
                98%
              </div>
              <div className="text-neutral-charcoal text-xs sm:text-sm lg:text-base font-plus-jakarta">
                Tingkat Keberhasilan
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimoni;