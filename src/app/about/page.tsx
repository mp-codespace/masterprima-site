// src/app/about/page.tsx

'use client';

import useSiteSettings from '@/lib/hooks/useSiteSettings';
import { MapPin, Phone, Clock, Users, Award, Target } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import StickyBanner from '@/components/StickyBanner';

export default function AboutPage() {
    const { settings, isLoading } = useSiteSettings();
    if (isLoading) {
        return (
            <main className="min-h-screen bg-neutral-cream flex items-center justify-center">
                <div className="text-lg text-gray-400 animate-pulse">Loading...</div>
            </main>
        );
    }

    // Fallback
    const locations = settings?.locations?.length ? settings.locations : [
        {
            id: 1,
            name: "Cabang Ini - Gubernur Suryo",
            address: "Jl. Gubernur Suryo 3 Surabaya (Komplek SMA Trimurti)",
            phone: "(031) 123-4567",
            isMain: true,
            hours: "Senin - Sabtu: 08:00 - 20:00",
            facilities: ["Ruang AC", "Perpustakaan", "Lab Komputer", "Kantin"]
        }
    ];

    const stats = [
        {
            icon: Users,
            number: settings?.stats_active_students ? `${settings.stats_active_students}+` : "500+",
            label: "Siswa Aktif",
            description: "Siswa yang telah bergabung"
        },
        {
            icon: Award,
            number: settings?.stats_experience_years ? `${settings.stats_experience_years}+` : "15+",
            label: "Tahun Pengalaman",
            description: "Melayani pendidikan Surabaya"
        },
        {
            icon: Target,
            number: settings?.stats_success_rate ? `${settings.stats_success_rate}%` : "98%",
            label: "Tingkat Kelulusan",
            description: "Siswa diterima di sekolah favorit"
        }
    ];

    const vision = settings?.vision || "Menjadi lembaga bimbingan belajar terdepan di Surabaya yang menghasilkan generasi cerdas, berkarakter, dan berprestasi untuk masa depan Indonesia yang gemilang.";

    const mission = settings?.mission?.length
        ? settings.mission
        : [
            "Memberikan pendidikan berkualitas tinggi dengan metode pembelajaran inovatif",
            "Mengembangkan potensi akademik dan karakter siswa secara optimal",
            "Menyediakan fasilitas pembelajaran yang nyaman dan modern"
        ];

    return (
        <main className="min-h-screen bg-neutral-cream">
            <StickyBanner />
            <Navbar />

            {/* Hero Section */}
            <section className="bg-secondary-sand text-neutral-charcoal py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-charcoal">
                            Tentang MasterPrima
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-dark-gray max-w-3xl mx-auto leading-relaxed">
                            Lembaga bimbingan belajar terpercaya di Surabaya dengan komitmen mengantarkan
                            siswa meraih prestasi terbaik sejak 2009
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-orange/10 rounded-full mb-4">
                                    <stat.icon className="h-8 w-8 text-primary-orange" />
                                </div>
                                <div className="text-3xl font-bold text-neutral-charcoal mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-lg font-semibold text-neutral-charcoal mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-sm text-neutral-dark-gray">
                                    {stat.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-16 bg-secondary-sand">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-neutral-charcoal mb-6">
                                Visi Kami
                            </h2>
                            <p className="text-neutral-dark-gray leading-relaxed">
                                {vision}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-neutral-charcoal mb-6">
                                Misi Kami
                            </h2>
                            <ul className="space-y-3 text-neutral-dark-gray">
                                {mission.map((m, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <div className="w-2 h-2 bg-primary-orange rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        {m}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Locations Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-charcoal mb-4">
                            Lokasi Cabang Kami
                        </h2>
                        <p className="text-lg text-neutral-dark-gray max-w-2xl mx-auto">
                            Master Prima hadir di berbagai lokasi strategis di Surabaya untuk kemudahan akses belajar Anda
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {locations.map((location) => (
                            <div
                                key={location.id}
                                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${location.isMain
                                    ? 'ring-2 ring-primary-orange ring-offset-4 ring-offset-white'
                                    : 'border border-gray-100'
                                    }`}
                            >
                                {location.isMain && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-orange to-primary-red text-white px-4 py-2 rounded-bl-lg">
                                        <span className="text-sm font-semibold">Cabang Ini</span>
                                    </div>
                                )}

                                <div className="p-6">
                                    <h3 className={`text-xl font-bold mb-3 ${location.isMain ? 'text-primary-orange' : 'text-neutral-charcoal'
                                        }`}>
                                        {location.name}
                                    </h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-neutral-dark-gray mt-0.5 flex-shrink-0" />
                                            <span className="text-neutral-dark-gray text-sm leading-relaxed">
                                                {location.address}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-neutral-dark-gray flex-shrink-0" />
                                            <span className="text-neutral-dark-gray text-sm">
                                                {location.phone}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Clock className="h-5 w-5 text-neutral-dark-gray flex-shrink-0" />
                                            <span className="text-neutral-dark-gray text-sm">
                                                {location.hours}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-semibold text-neutral-charcoal mb-2">
                                            Fasilitas:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {location.facilities?.map((facility: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="inline-block bg-secondary-sand text-primary-orange px-2 py-1 rounded-md text-xs font-medium"
                                                >
                                                    {facility}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
