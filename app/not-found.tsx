// app/not-found.tsx
'use client';

import Link from 'next/link';
import { FileX, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-full mb-6">
          <FileX size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          404 - Halaman Tidak Ditemukan
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-lg mx-auto">
          Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin URL-nya salah ketik atau halaman tersebut telah dipindahkan.
        </p>
        <div className="mt-10">
          <Link href="/">
            <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
                Kembali ke Beranda
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}