'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useApiStatus } from '@/app/context/StatusContext';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

export const StatusPopup = () => {
  const { status, isLoading } = useApiStatus();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (status && status.status !== 'online') {
      setIsOpen(true);
    }
  }, [status]);

  const shouldShow = !isLoading && status && status.status !== 'online' && isOpen;

  const statusConfig = {
    error: {
      bgColor: 'bg-amber-50',
      headerBgColor: 'bg-amber-100',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-500',
      title: 'Layanan Terganggu',
      message: "Kami mendeteksi adanya gangguan pada sistem. Hal ini dapat menyebabkan beberapa fitur pencarian tidak berfungsi untuk sementara waktu.",
    },
    offline: {
      bgColor: 'bg-rose-50',
      headerBgColor: 'bg-rose-100',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-900',
      iconColor: 'text-rose-500',
      title: 'Layanan Tidak Tersedia',
      message: "Layanan tidak dapat dijangkau saat ini. Hal ini bisa disebabkan oleh koneksi internet Anda atau server kami sedang offline. Silakan coba lagi nanti.",
    },
  };
  
  const config = shouldShow ? statusConfig[status.status as 'error' | 'offline'] : null;

  return (
    <AnimatePresence>
      {shouldShow && config && (
        <motion.div
          key="status-popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
          aria-labelledby="status-popup-title"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key="status-popup-content"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
            className={`relative w-full max-w-sm bg-white rounded-2xl border ${config.borderColor} shadow-2xl overflow-hidden`}
          >
            {/* Header dengan Ikon */}
            <div className={`p-6 text-center ${config.headerBgColor} border-b ${config.borderColor}`}>
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white ${config.iconColor}`}>
                    <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
            </div>

            {/* Konten Teks */}
            <div className="p-6 text-center">
              <h2 id="status-popup-title" className="text-xl font-bold text-gray-800">
                {config.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {config.message}
              </p>
            </div>
            
            {/* Tombol Aksi */}
            <div className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row-reverse sm:justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 h-10 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
              >
                Tutup
              </button>
              <Link
                href="/status"
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Lihat Halaman Status
              </Link>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};