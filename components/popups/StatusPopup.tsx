// components/popups/StatusPopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, WifiOff, X } from 'lucide-react';
import { useApiStatus } from '@/lib/context/StatusContext';
import { AnimatePresence, motion } from 'framer-motion';

export const StatusPopup = () => {
  const { status: apiStatus, isLoading } = useApiStatus();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Tampilkan popup jika status BUKAN 'online'
    if (apiStatus && apiStatus.status !== 'online') {
      setIsOpen(true);
    }
  }, [apiStatus]);

  // --- PERBAIKAN DI SINI ---
  // Kondisi diubah dari 'normal' menjadi 'online' agar sesuai dengan tipe data
  const shouldShow = !isLoading && apiStatus && apiStatus.status !== 'online' && isOpen;

  const statusConfig = {
    error: { // 'error' cocok untuk gangguan sebagian
      icon: <AlertTriangle size={32} strokeWidth={2.5} />,
      iconContainerColor: 'bg-amber-100 text-amber-500',
      title: 'Layanan Terganggu',
      message: "Terjadi gangguan pada sistem yang dapat memengaruhi beberapa fitur pencarian untuk sementara waktu.",
      buttonColor: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
    },
    offline: { // 'offline' cocok untuk gangguan total
      icon: <WifiOff size={32} strokeWidth={2.5} />,
      iconContainerColor: 'bg-rose-100 text-rose-500',
      title: 'Layanan Tidak Tersedia',
      message: "Tidak dapat terhubung ke layanan saat ini. Ini mungkin karena koneksi internet Anda atau server kami sedang offline.",
      buttonColor: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-400',
    },
  };

  const config = shouldShow ? statusConfig[apiStatus.status as 'error' | 'offline'] : null;

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
            {/* Tombol Close */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Tutup"
            >
              <X size={24} />
            </button>
            
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
                Saya Mengerti
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};