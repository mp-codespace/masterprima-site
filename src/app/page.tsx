// src/app/page.tsx

import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import ProgramSection from '@/components/ProgramSection';
import Testimoni from '@/components/Testimoni';
import StickyBanner from '@/components/StickyBanner';
import FAQ from '@/components/FAQ';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';


export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <StickyBanner />
      <Navbar />
      <Hero />
      <FeaturesSection />
      <ProgramSection />
      <Testimoni />
      <FAQ />
      <MapSection />
      <Footer />
    </main>
  );
}
