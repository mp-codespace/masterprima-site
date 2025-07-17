'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Clock, Users, Sparkles } from 'lucide-react';
import useSiteSettings from '@/lib/hooks/useSiteSettings'; // pastikan path sudah benar

interface StickyBannerProps {
  className?: string;
  autoCloseAfter?: number; // in seconds
  showCountdown?: boolean;
  showAutoCloseProgress?: boolean;
}

type CountdownKey = 'days' | 'hours' | 'minutes' | 'seconds';

const calculateDeadline = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 hari
  return deadline;
};

const StickyBanner: React.FC<StickyBannerProps> = ({
  className = '',
  autoCloseAfter = 3,
  showCountdown = true,
  showAutoCloseProgress = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<Record<CountdownKey, number>>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [autoCloseProgress, setAutoCloseProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // AMBIL DATA DARI ADMIN DASHBOARD (Supabase)
  const { settings } = useSiteSettings();

  useEffect(() => {
    setMounted(true);
    const deadline = calculateDeadline();
    const countdownTimer = setInterval(() => {
      const now = new Date();
      const distance = deadline.getTime() - now.getTime();
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(countdownTimer);
      }
    }, 1000);

    let closeTimer: NodeJS.Timeout | null = null;
    let progressInterval: NodeJS.Timeout | null = null;

    if (autoCloseAfter > 0) {
      const progressUpdateInterval = 100;
      const totalUpdates = (autoCloseAfter * 1000) / progressUpdateInterval;
      let currentUpdate = 0;

      progressInterval = setInterval(() => {
        if (!isHovered) {
          currentUpdate++;
          const progress = Math.max(0, 100 - (currentUpdate / totalUpdates) * 100);
          setAutoCloseProgress(progress);
          if (progress <= 0) {
            clearInterval(progressInterval!);
            handleClose();
          }
        }
      }, progressUpdateInterval);

      closeTimer = setTimeout(() => {
        if (!isHovered) {
          handleClose();
        }
      }, autoCloseAfter * 1000);
    }

    return () => {
      clearInterval(countdownTimer);
      if (closeTimer) clearTimeout(closeTimer);
      if (progressInterval) clearInterval(progressInterval);
    };
    // eslint-disable-next-line
  }, [autoCloseAfter, isHovered]);

  useEffect(() => {
    if (isHovered && autoCloseAfter > 0) {
      setAutoCloseProgress(100);
    }
  }, [isHovered, autoCloseAfter]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  // Ambil link WA dari settings. fallback default jika belum ada
  const waNumber = settings?.contact_whatsapp?.replace(/\D/g, '') || '6281234567890';
  const waLink = `https://wa.me/${waNumber}`;

  const handleCTA = () => {
    window.open(waLink, '_blank');
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  if (!mounted || !isVisible) return null;

  const countdownKeys: CountdownKey[] = ['days', 'hours', 'minutes', 'seconds'];

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[999] transform transition-all duration-300 ease-in-out ${isAnimating ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 shadow-lg relative overflow-hidden">
        {showAutoCloseProgress && autoCloseAfter > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div
              className="h-full bg-white/60 transition-all duration-100 ease-linear"
              style={{ width: `${autoCloseProgress}%` }}
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-white font-bold text-sm sm:text-base font-plus-jakarta">
                    🎯 Pendaftaran Bimbel Kedinasan 2025
                  </span>
                  <div className="hidden sm:flex items-center space-x-1 bg-yellow-400/20 backdrop-blur-sm rounded-full px-2 py-0.5 border border-yellow-300/30">
                    <Users className="w-3 h-3 text-yellow-300" />
                    <span className="text-yellow-100 text-xs font-semibold whitespace-nowrap">
                      Kuota Terbatas
                    </span>
                  </div>
                </div>
              </div>
              {showCountdown && (
                <div className="hidden lg:flex items-center space-x-2 bg-white/10 rounded-md px-3 py-1.5 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-yellow-300" />
                  <div className="flex items-center space-x-2 text-white">
                    {countdownKeys.map((key, index) => (
                      <React.Fragment key={key}>
                        {index > 0 && <div className="text-white/60 text-xs">:</div>}
                        <div className="text-center">
                          <div className="text-sm font-bold font-urbanist leading-none">
                            {String(timeLeft[key]).padStart(2, '0')}
                          </div>
                          <div className="text-xs text-white/80 leading-none">
                            {key.charAt(0)}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-3">
              {autoCloseAfter > 0 && isHovered && (
                <div className="hidden sm:flex items-center space-x-1 text-white/80 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Hover to pause</span>
                </div>
              )}

              <button
                onClick={handleCTA}
                className="bg-white text-red-600 hover:bg-yellow-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm font-plus-jakarta transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center space-x-1 group whitespace-nowrap"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all duration-200 flex-shrink-0"
                aria-label="Close banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-60"></div>
      </div>
    </div>
  );
};

export default StickyBanner;
