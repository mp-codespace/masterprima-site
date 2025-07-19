// src/app/detail-paket/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import LihatDetailPaket from '@/components/LihatDetailPaket';

// Hardcoded fallback program data
const hardcodedPrograms = [
  {
    id: 1,
    name: "Paket KEDINASAN JAMINAN",
    subtitle: "All In One",
    price: 15000000,
    features: [
      "Modul khusus SKD KEDINASAN, SKB, Psikotes",
      "Didampingi semua tahapan tes kedinasan",
      "Materi SKD, SKB, Psikotes, dan Wawancara",
      "Simulasi tes sampai/keseluruhan",
      "Bimbingan total sampai 50 kali TM @ 90 menit",
      "Tambahan belajar gratis (Unlimited Group)",
      "Simulasi CBT minimal 8 kali",
      "Pengajar terstandar kualitas 'A'",
      "Gratis software bank soal SKD",
      "Gratis eLearning SKD senilai 1 juta",
      "Ruangan belajar full AC",
      "Dilengkapi dengan perjanjian bermateri"
    ],
    badge: "ALL IN ONE",
    badgeColor: "bg-red-600",
    isPopular: true,
    maxStudents: "Max. 10 Siswa Per Kelas",
    description: "Paket lengkap dengan jaminan untuk semua tahapan tes kedinasan. Cocok untuk Anda yang ingin persiapan maksimal dengan pendampingan intensif.",
    duration: "6 Bulan",
    sessions: "50 Pertemuan",
    category: "Kedinasan"
  },
  {
    id: 2,
    name: "Paket CPNS PLATINUM",
    subtitle: "Investasi Sukses Jadi PNS",
    price: 8100000,
    features: [
      "Masuk 30 kali TM @90 menit",
      "Gratis pemantapan materi jelang ujian",
      "Garansi lulus SKD dengan perjanjian bermateri",
      "Gratis tambahan belajar unlimited group",
      "Panduan belajar SKD update",
      "Pengajar tersertifikasi kualitas 'A'",
      "Simulasi CAT SKD Standar BKN",
      "Success card lulus CPNS",
      "Gratis software bank soal SKD",
      "Gratis e-learning senilai 1 juta (khusus pembayaran lunas)",
      "Metode Evaluasi Full CAT Standar BKN"
    ],
    badge: "PLATINUM",
    badgeColor: "bg-red-500",
    isPopular: false,
    description: "Paket premium untuk persiapan CPNS dengan garansi lulus SKD. Dilengkapi dengan fasilitas terlengkap dan metode pembelajaran terkini.",
    duration: "4 Bulan",
    sessions: "30 Pertemuan",
    category: "CPNS"
  },
  {
    id: 3,
    name: "Paket SNBT PLATINUM",
    subtitle: "Program Bimbel Class UTBK/SNBT",
    price: 12600000,
    originalPrice: 14000000,
    features: [
      "2 TM Per minggu @90 menit sampai menjelang UTBK",
      "Jadwal bimbel flexibel (diambil dari Voting Class)",
      "Modul belajar terupdate",
      "Simulasi CAT",
      "Pengajar tersertifikasi kualitas 'A'",
      "Free konsultasi",
      "Ruangan belajar nyaman & berAC",
      "Biaya bimbel dapat diangsur maks. 3 kali",
      "Minimal 1 Siswa untuk kelas Platinum",
      "Fokus materi UTBK lengkap"
    ],
    badge: "PLATINUM",
    badgeColor: "bg-primary-orange",
    isPopular: false,
    description: "Paket khusus untuk persiapan UTBK/SNBT dengan metode pembelajaran yang fleksibel dan efektif. Cocok untuk siswa yang ingin masuk PTN impian.",
    duration: "6 Bulan",
    sessions: "48 Pertemuan",
    category: "UTBK/SNBT"
  }
];

async function getProgramData(slug: string) {
  try {
    if (slug.startsWith('program-')) {
      const programId = parseInt(slug.replace('program-', ''));
      const program = hardcodedPrograms.find(p => p.id === programId);
      return program ? { type: 'program', data: program } : null;
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/pricing/${slug}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const plan = await response.json();
    return { type: 'plan', data: plan };
  } catch (error) {
    console.error('Error fetching program data:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const result = await getProgramData(params.slug);
  if (!result) {
    return {
      title: 'Paket Tidak Ditemukan - Master Prima',
      description: 'Paket yang Anda cari tidak tersedia.',
    };
  }
  const { data } = result;
  const title = `${data.name} - Master Prima`;
  const description = data.description || `Detail lengkap paket ${data.name} di Master Prima. Fasilitas lengkap dengan harga terjangkau.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/detail-paket/${params.slug}`,
    },
    twitter: {
      title,
      description,
    },
    alternates: {
      canonical: `/detail-paket/${params.slug}`,
    },
  };
}

export default async function Page({
  params
}: {
  params: { slug: string }
}) {
  const result = await getProgramData(params.slug);

  if (!result) {
    notFound();
  }

  const { type, data } = result;

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Navbar />
      <div className="pt-20">
        <LihatDetailPaket 
          data={data}
          type={type as 'program' | 'plan'}
        />
      </div>
      <Footer />
    </main>
  );
}
