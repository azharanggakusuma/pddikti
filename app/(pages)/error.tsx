// app/error.tsx
'use client'; 

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke sistem monitoring
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 bg-amber-100 text-amber-600 rounded-full mb-6">
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          Oops! Terjadi Masalah
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-lg mx-auto">
          Sepertinya terjadi kesalahan di sisi kami. Jangan khawatir, tim kami telah diberitahu dan sedang menanganinya.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button
            onClick={() => reset()}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw size={18} className="transition-transform duration-500 group-hover:rotate-180" />
            Coba Lagi
          </button>
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              Kembali ke Beranda
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}