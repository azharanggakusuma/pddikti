// app/components/StatusPopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, WifiOff, X } from 'lucide-react';
import { useApiStatus } from '@/app/context/StatusContext';
import { AnimatePresence, motion } from 'framer-motion';

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
      icon: <AlertTriangle size={32} strokeWidth={2.5} />,
      iconContainerColor: 'bg-amber-100 text-amber-500',
      title: 'Layanan Terganggu',
      message: "Kami mendeteksi adanya gangguan pada sistem. Hal ini dapat menyebabkan beberapa fitur pencarian tidak berfungsi untuk sementara waktu.",
      buttonColor: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
    },
    offline: {
      icon: <WifiOff size={32} strokeWidth={2.5} />,
      iconContainerColor: 'bg-rose-100 text-rose-500',
      title: 'Layanan Tidak Tersedia',
      message: "Layanan tidak dapat dijangkau saat ini. Hal ini bisa disebabkan oleh koneksi internet Anda atau server kami sedang offline. Silakan coba lagi nanti.",
      buttonColor: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-400',
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
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-gray-500/20 p-8 text-center"
          >
            {/* Ikon Status */}
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${config.iconContainerColor} mb-6`}>
              {config.icon}
            </div>

            {/* Konten Teks */}
            <h2 id="status-popup-title" className="text-2xl font-bold text-gray-800">
              {config.title}
            </h2>
            <p className="mt-3 text-base text-gray-600 leading-relaxed">
              {config.message}
            </p>
            
            {/* Tombol Aksi */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`w-full px-6 h-12 text-base font-semibold text-white ${config.buttonColor} rounded-xl focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105`}
              >
                Mengerti
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};