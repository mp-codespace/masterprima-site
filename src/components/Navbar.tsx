// src\components\Navbar.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

// Translation dictionary
const translations = {
  en: {
    price: 'Price',
    blog: 'Blog',
    about: 'About',
  },
  id: {
    price: 'Harga',
    blog: 'Blog',
    about: 'Tentang',
  },
} as const;

type Language = keyof typeof translations;
type TranslationKey = keyof typeof translations.en;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // Detect browser language on mount
  useEffect(() => {
    const storedLang = localStorage.getItem('lang') as Language | null;
    if (storedLang && ['en', 'id'].includes(storedLang)) {
      setLanguage(storedLang);
    } else {
      const browserLang =
        (typeof navigator !== 'undefined' && navigator.language.toLowerCase()) || 'en';
      const detectedLang = browserLang.startsWith('id') ? 'id' : 'en';
      setLanguage(detectedLang);
      localStorage.setItem('lang', detectedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] ?? translations.en[key];
  };

  const navLinks = useMemo(
    () => [
      { href: '/price', label: t('price') },
      { href: '/blog', label: t('blog') },
      { href: '/about', label: t('about') },
    ],
    [language]
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-cream dark:bg-[#0a0a0a] border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-masterprima.svg"
                alt="Masterprima Logo"
                width={150}
                height={40}
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-body-main hover:text-primary-orange transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Language Selector (Desktop) */}
          <div className="hidden md:flex items-center justify-end w-[150px]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-sm"
            >
              <option value="en">EN</option>
              <option value="id">ID</option>
            </select>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-charcoal dark:text-neutral-cream hover:text-primary-orange"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-body-main hover:text-primary-orange transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}

              {/* Language Selector (Mobile) */}
              <div className="px-3 py-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-sm w-full"
                >
                  <option value="en">English</option>
                  <option value="id">Bahasa Indonesia</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
