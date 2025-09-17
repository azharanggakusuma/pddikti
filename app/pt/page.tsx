'use client';

import Link from 'next/link';
import { School } from 'lucide-react';

export default function PtPage() {
  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center antialiased bg-gray-50 text-gray-800">
      <div className="text-center">
        <School size={64} className="mx-auto text-gray-300" />
        <h1 className="mt-6 text-2xl font-bold text-gray-800">Pencarian Perguruan Tinggi</h1>
        <p className="mt-2 text-gray-600">Halaman ini sedang dalam tahap pengembangan.</p>
        <Link href="/" className="mt-8 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}