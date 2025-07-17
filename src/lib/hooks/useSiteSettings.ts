// src/lib/hooks/useSiteSettings.ts

import { useEffect, useState } from 'react';

// --- Type Definitions ---

export type Location = {
  id: number;
  name: string;
  address: string;
  phone: string;
  isMain: boolean;
  hours: string;
  facilities: string[];
  mapsUrl?: string;
  mapsEmbedUrl?: string;
  area?: string;
};

export type TestimoniItem = {
  id: number;
  name: string;
  position: string;
  rating: number;
  review: string;
  institution: string;
  score?: string;
  year: string;
  verified: boolean;
};

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

export type ProgramItem = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  features: string[];
  icon?: string;
  isPopular?: boolean;
  active?: boolean;
};

export type SiteSettings = {
  stats_cpns_graduates: number;
  stats_success_rate: number;
  stats_active_students: number;
  stats_experience_years: number;
  stats_graduation_rate: number;
  vision: string;
  mission: string[];
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  locations: Location[];
  testimonials: TestimoniItem[];
  faqs: FaqItem[];
  programs: ProgramItem[];
};

// --- Dummy Fallbacks ---

const dummyTestimonials: TestimoniItem[] = [
  {
    id: 1,
    name: "Masterprima",
    position: "Admin",
    rating: 5,
    review: "Testimoni alumni akan tampil di sini jika sudah diisi admin. Semua testimoni alumni dapat dikelola langsung lewat dashboard.",
    institution: "Masterprima",
    year: "2024",
    verified: true
  }
];

const emptySettings: SiteSettings = {
  stats_cpns_graduates: 0,
  stats_success_rate: 0,
  stats_active_students: 0,
  stats_experience_years: 0,
  stats_graduation_rate: 0,
  vision: '',
  mission: [],
  contact_email: '',
  contact_phone: '',
  contact_whatsapp: '',
  locations: [],
  testimonials: [],
  faqs: [],
  programs: [],
};

// --- Main Hook ---

export default function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);

    fetch('/api/public/site-settings')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch site settings');
        const data = await res.json();

        // Normalisasi array agar tidak undefined/null
        const normalized: SiteSettings = {
          ...emptySettings,
          ...data,
          mission: Array.isArray(data.mission) ? data.mission : (data.mission ? [data.mission] : []),
          locations: Array.isArray(data.locations) ? data.locations : [],
          testimonials: Array.isArray(data.testimonials) && data.testimonials.length > 0
            ? data.testimonials
            : dummyTestimonials,
          faqs: Array.isArray(data.faqs) ? data.faqs : [],
          programs: Array.isArray(data.programs) ? data.programs : [],
        };

        if (!ignore) {
          setSettings(normalized);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to fetch');
          setIsLoading(false);
          // Optional: fallback ke dummy jika benar-benar error
          setSettings({
            ...emptySettings,
            testimonials: dummyTestimonials,
          });
        }
      });

    return () => { ignore = true; };
  }, []);

  return { settings, isLoading, error };
}
