// src\components\Hero.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const slides = [
    {
      id: 1,
      image: '/image/hero1.png',
      alt: 'Hero Image 1',
    },
    {
      id: 2,
      image: '/image/hero2.jpg',
      alt: 'Hero Image 2',
    },
    {
      id: 3,
      image: '/image/hero3.jpg',
      alt: 'Hero Image 3',
    },
  ];

  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, slides.length]);

  const handleImageError = (slideId: number) => {
    console.error(`Failed to load image for slide ${slideId}`);
    setImageErrors(prev => ({ ...prev, [slideId]: true }));
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleGoToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section
      className="relative w-full bg-white overflow-hidden mt-16"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Main Carousel Container */}
      <div className="relative w-full">
        {/* Mobile View - object-contain to prevent cropping */}
        <div className="block lg:hidden">
          <div className="relative w-full h-[250px] xs:h-[280px] sm:h-[350px] md:h-[400px]">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {!imageErrors[slide.id] ? (
                  <div className="relative w-full h-full bg-gray-50">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      className="object-contain"
                      priority={index === 0}
                      onError={() => handleImageError(slide.id)}
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw"
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'center center'
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <div className="text-white text-center px-4">
                      <div className="text-4xl sm:text-6xl mb-4">🖼️</div>
                      <p className="text-lg sm:text-xl">Image not found</p>
                      <p className="text-xs sm:text-sm opacity-75">{slide.alt}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View - object-cover for full coverage */}
        <div className="hidden lg:block">
          <div className="relative w-full h-[450px] xl:h-[500px]">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {!imageErrors[slide.id] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      onError={() => handleImageError(slide.id)}
                      sizes="100vw"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center center'
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <div className="text-white text-center px-4">
                      <div className="text-6xl mb-4">🖼️</div>
                      <p className="text-xl">Image not found</p>
                      <p className="text-sm opacity-75">{slide.alt}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={handlePrevious}
            className="bg-white/80 hover:bg-white rounded-full p-2 sm:p-3 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-gray-700" />
          </button>
        </div>

        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={handleNext}
            className="bg-white/80 hover:bg-white rounded-full p-2 sm:p-3 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-gray-700" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleGoToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;