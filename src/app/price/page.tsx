// src/app/price/page.tsx

import { Metadata } from 'next';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import StickyBanner from '@/components/StickyBanner';
import { Check, Star, Crown, Award } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/admin'; 

export const metadata: Metadata = {
  title: 'Harga & Paket Bimbel MasterPrima',
  description: 'Pilih paket bimbingan belajar terbaik untuk persiapan CPNS, Kedinasan, dan UTBK di Surabaya. Harga terjangkau dengan fasilitas lengkap dan jaminan kualitas.',
  openGraph: {
    title: 'Harga & Paket Bimbel MasterPrima',
    description: 'Temukan paket bimbel terbaik untuk kesuksesanmu di Surabaya.',
    url: '/price',
  },
  twitter: {
    title: 'Harga & Paket Bimbel MasterPrima',
    description: 'Temukan paket bimbel terbaik untuk kesuksesanmu di Surabaya.',
  },
  alternates: {
    canonical: '/price',
  },
};

type Category = {
  category_id: string;
  key: string;
  title: string;
  subtitle: string;
};

type Plan = {
  plan_id: string;
  category_id: string;
  name: string;
  price: number;
  original_price?: number | null;
  features: string[];
  icon: string;
  popular: boolean;
  is_active: boolean;
};

// Fallback data dalam case database tidak tersedia
const fallbackCategories: Category[] = [
  {
    category_id: 'tni-polri',
    key: 'tniPolri',
    title: 'TNI & POLRI',
    subtitle: 'Persiapan tes masuk TNI dan POLRI terlengkap'
  },
  {
    category_id: 'utbk-snbt',
    key: 'utbkSnbt',
    title: 'UTBK SNBT',
    subtitle: 'Persiapan UTBK SNBT untuk masuk PTN impian'
  },
  {
    category_id: 'cpns',
    key: 'cpns',
    title: 'CPNS',
    subtitle: 'Persiapan CPNS dengan materi terkini'
  }
];

const fallbackPlans: Plan[] = [
  {
    plan_id: 'basic-1',
    category_id: 'tni-polri',
    name: 'Basic',
    price: 750000,
    original_price: 900000,
    features: [
      'Modul belajar terupdate',
      'Simulasi CAT',
      'Pengajar tersertifikasi',
      'Free konsultasi',
      'Ruangan belajar nyaman & berAC'
    ],
    icon: 'star',
    popular: false,
    is_active: true
  },
  {
    plan_id: 'premium-1',
    category_id: 'tni-polri',
    name: 'Premium',
    price: 1200000,
    original_price: 1500000,
    features: [
      'Semua fitur Basic',
      'Bimbingan intensif',
      'Try out unlimited',
      'Konsultasi private',
      'Modul eksklusif'
    ],
    icon: 'crown',
    popular: true,
    is_active: true
  }
];

async function getPricingData() {
  try {
    // Tambahkan logging untuk debugging
    console.log('Fetching pricing data from Supabase...');
    
    // Pastikan supabaseAdmin ter-configure dengan benar
    if (!supabaseAdmin) {
      console.error('Supabase admin client not configured');
      return { categories: fallbackCategories, plans: fallbackPlans };
    }

    // Test koneksi ke Supabase
    const { error: testError } = await supabaseAdmin
      .from('pricing_categories')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      return { categories: fallbackCategories, plans: fallbackPlans };
    }

    // Fetch data categories dan plans
    const [categoriesResult, plansResult] = await Promise.allSettled([
      supabaseAdmin
        .from('pricing_categories')
        .select('*')
        .order('created_at', { ascending: true }),
      supabaseAdmin
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })
    ]);

    let categories: Category[] = [];
    let plans: Plan[] = [];

    // Handle categories result
    if (categoriesResult.status === 'fulfilled' && !categoriesResult.value.error) {
      categories = categoriesResult.value.data || [];
      console.log(`Fetched ${categories.length} categories`);
    } else {
      console.error('Failed to fetch categories:', categoriesResult.status === 'fulfilled' ? categoriesResult.value.error : categoriesResult.reason);
      categories = fallbackCategories;
    }

    // Handle plans result
    if (plansResult.status === 'fulfilled' && !plansResult.value.error) {
      plans = plansResult.value.data || [];
      console.log(`Fetched ${plans.length} plans`);
    } else {
      console.error('Failed to fetch plans:', plansResult.status === 'fulfilled' ? plansResult.value.error : plansResult.reason);
      plans = fallbackPlans;
    }

    return { categories, plans };

  } catch (error) {
    console.error("Error in getPricingData:", error);
    // Return fallback data instead of empty arrays
    return { categories: fallbackCategories, plans: fallbackPlans };
  }
}

const categoryOrder = [
  'tniPolri',
  'utbkSnbt',
  'cpns',
  'pknStan',
  'kedinasan',
];

const getIcon = (icon: string) => {
  switch (icon) {
    case 'star':
      return <Star className="w-5 h-5" />;
    case 'crown':
      return <Crown className="w-5 h-5" />;
    case 'award':
      return <Award className="w-5 h-5" />;
    default:
      return <Award className="w-5 h-5" />;
  }
};

const commonFeatures = [
  "Modul belajar terupdate",
  "Simulasi CAT",
  "Pengajar tersertifikasi kualitas 'A'",
  "Free konsultasi",
  "Ruangan belajar nyaman & berAC"
];

export default async function PricePage() {
  const { categories, plans } = await getPricingData();

  // Pastikan ada data untuk ditampilkan
  if (!categories || categories.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <StickyBanner />
        <Navbar />
        
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
              Pilih Paket <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Terbaik</span> Untuk Masa Depanmu
            </h1>
            <div className="text-center py-20 text-gray-500">
              <h3 className="text-2xl font-semibold mb-4">Paket Sedang Dimuat</h3>
              <p>Silakan refresh halaman atau hubungi kami untuk informasi lebih lanjut.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <a
                  href="https://wa.me/6281232420044"
                  className="inline-flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  WhatsApp Admin 1
                </a>
                <a
                  href="https://wa.me/6285646877888"
                  className="inline-flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  WhatsApp Admin 2
                </a>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    );
  }

  const orderedCategories = categoryOrder
    .map((key) => categories.find((c: Category) => c.key === key))
    .filter(Boolean) as Category[];

  // Jika tidak ada kategori yang sesuai dengan order, gunakan semua kategori
  const displayCategories = orderedCategories.length > 0 ? orderedCategories : categories;

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <StickyBanner />
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full text-sm font-medium text-orange-700 mb-6">
            Paket Terlengkap & Terpercaya
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Pilih Paket <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Terbaik</span> Untuk Masa Depanmu
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Dapatkan bimbingan terbaik dengan fasilitas lengkap dan pengajar berpengalaman. Investasi terbaik untuk kesuksesan karir impianmu.
          </p>
        </div>
      </section>

      {/* Pricing Categories */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 space-y-20">
          {displayCategories.map((category) => {
            const categoryPlans = plans.filter((p: Plan) => p.category_id === category.category_id);
            
            return (
              <div key={category.category_id} id={category.key} className="space-y-8 scroll-mt-20">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                    {category.title}
                  </h2>
                  <p className="text-xl text-neutral-600">
                    {category.subtitle}
                  </p>
                </div>
                
                {categoryPlans.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Paket untuk kategori ini sedang disiapkan. Hubungi kami untuk informasi lebih lanjut.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryPlans.map((pkg: Plan) => (
                      <div
                        key={pkg.plan_id}
                        className={`relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                          pkg.popular
                            ? 'border-orange-200 shadow-lg ring-4 ring-orange-100'
                            : 'border-gray-100 hover:border-orange-100'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                              🔥 Paling Populer
                            </div>
                          </div>
                        )}
                        <div className="p-8">
                          <div className="text-center mb-8">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                              pkg.popular
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getIcon(pkg.icon)}
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                              Paket {pkg.name}
                            </h3>
                            <div className="space-y-2">
                              {pkg.original_price && pkg.original_price > pkg.price && (
                                <p className="text-sm text-gray-500 line-through">
                                  Rp {pkg.original_price.toLocaleString('id-ID')}
                                </p>
                              )}
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-sm text-gray-600">Rp</span>
                                <span className="text-3xl font-bold text-neutral-900">
                                  {pkg.price.toLocaleString('id-ID')}
                                </span>
                              </div>
                              {pkg.original_price && pkg.original_price > pkg.price && (
                                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                  <span>Hemat Rp {(pkg.original_price - pkg.price).toLocaleString('id-ID')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4 mb-8">
                            {(pkg.features && pkg.features.length > 0 ? pkg.features : commonFeatures).map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                  <Check className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-700 leading-relaxed">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                            pkg.popular
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}>
                            Pilih Paket Ini
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Fasilitas Eksklusif */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
            Fasilitas Eksklusif di Setiap Paket
          </h2>
          <p className="text-lg text-neutral-600 mb-12">
            Semua paket dilengkapi dengan fasilitas premium untuk mendukung kesuksesan belajarmu
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Masih Bingung Pilih Paket yang Tepat?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Konsultasi gratis dengan tim ahli kami untuk mendapatkan rekomendasi paket terbaik sesuai kebutuhanmu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/6281232420044"
                className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                WhatsApp Admin 1
              </a>
              <a
                href="https://wa.me/6285646877888"
                className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                WhatsApp Admin 2
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex items-center justify-center gap-2 text-white/80">
                <span className="text-sm">
                  Jl. Gubernur Suryo No. 3 (Komplek SMA Trimurti Surabaya)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}