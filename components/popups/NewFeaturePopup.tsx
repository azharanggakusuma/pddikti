// components/NewFeaturePopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';

export const NewFeaturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Menggunakan key yang unik untuk memastikan popup ini muncul bagi semua pengguna
    const hasSeenPopup = sessionStorage.getItem('hasSeenV2SpesifikUpdate');
    if (!hasSeenPopup) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenV2SpesifikUpdate', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 text-center border-b border-gray-200/80">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-5">
                    <Megaphone size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Ada yang Baru!
                </h2>
                <p className="mt-1 text-base text-gray-600">
                  Kami telah menyempurnakan fitur pencarian.
                </p>

                {/* Tombol Close */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
                    aria-label="Tutup"
                >
                    <X size={24} />
                </button>
            </div>
            
            <div className="p-6">
              {/* Deskripsi Fitur */}
              <div className="text-left p-4 bg-blue-50 rounded-xl border border-blue-200/80">
                  <h3 className="font-semibold text-blue-900">Pencarian Spesifik Kini Lebih Lengkap</h3>
                  <p className="text-sm text-blue-800/90 mt-1 leading-relaxed">
                      Fitur pencarian akurat kini juga tersedia untuk <strong>Dosen</strong> dan <strong>Prodi</strong>, memberikan Anda hasil yang lebih presisi.
                  </p>
              </div>
              
              {/* Tombol Aksi */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full px-6 h-12 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-[1.02]"
                >
                  Jelajahi Sekarang
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};