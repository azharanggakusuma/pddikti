// app/components/StatusPopup.tsx

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

  if (!shouldShow) {
    return null;
  }

  const statusConfig = {
    error: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-500',
      title: 'Layanan Terganggu',
      message: "Kami mendeteksi gangguan pada layanan pencarian. Anda mungkin masih bisa membuka aplikasi, tetapi pencarian tidak akan berfungsi dengan normal hingga koneksi pulih. Silakan coba kembali beberapa saat lagi.",
    },
    offline: {
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-900',
      iconColor: 'text-rose-500',
      title: 'Layanan Tidak Tersedia',
      message: "Layanan saat ini tidak dapat dijangkau. Hal ini bisa disebabkan oleh koneksi internet Anda atau server kami yang sedang tidak tersedia. Mohon maaf atas ketidaknyamanan ini, dan silakan coba kembali beberapa saat lagi.",
    },
  };

  // FIX: Assert the type of status.status to be either 'error' or 'offline'
  const config = statusConfig[status.status as 'error' | 'offline'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        aria-labelledby="status-popup-title"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`relative w-full max-w-md p-6 rounded-2xl border ${config.bgColor} ${config.borderColor} shadow-2xl`}
        >
          <div className="flex items-start">
            {/* Ikon */}
            <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${config.iconColor} bg-white mr-5`}>
              <AlertTriangle size={24} />
            </div>

            {/* Konten Teks */}
            <div className="flex-grow">
              <h2 id="status-popup-title" className={`text-lg font-bold ${config.textColor}`}>
                {config.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {config.message}
              </p>

              {/* Tombol Aksi */}
              <div className="mt-5 flex items-center gap-4">
                <Link
                  href="/status"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Lihat Status
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};