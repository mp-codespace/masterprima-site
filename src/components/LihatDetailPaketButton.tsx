// src/components/LihatDetailPaketButton.tsx

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Eye } from 'lucide-react';

interface LihatDetailPaketButtonProps {
  planId?: string;
  programId?: number;
  isPopular?: boolean;
  className?: string;
}

const LihatDetailPaketButton: React.FC<LihatDetailPaketButtonProps> = ({
  planId,
  programId,
  isPopular = false,
  className = ""
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    // Untuk data dari database (price page)
    if (planId) {
      router.push(`/detail-paket/${planId}`);
    }
    // Untuk data hardcoded (program section)
    else if (programId) {
      router.push(`/detail-paket/program-${programId}`);
    }
  };

  // Check if we're on the price page
  const isPricePage = pathname === '/price';

  // Style for price page
  if (isPricePage) {
    return (
      <button
        onClick={handleClick}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          isPopular
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        } ${className}`}
      >
        <Eye className="w-4 h-4" />
        Lihat Detail Paket
      </button>
    );
  }

  // Style for program section 
  return (
    <button
      onClick={handleClick}
      className={`w-full py-3 px-4 rounded-xl border-2 border-neutral-dark-gray text-neutral-dark-gray hover:bg-neutral-dark-gray hover:text-white transition-all duration-200 font-medium flex items-center justify-center gap-2 ${className}`}
    >
      <Eye className="w-4 h-4" />
      Lihat Detail Paket
    </button>
  );
};

export default LihatDetailPaketButton;