// components/NewFeaturePopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Layers, Search } from 'lucide-react';

export const NewFeaturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenNewFeaturePopup');
    if (!hasSeenPopup) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenNewFeaturePopup', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-5 text-white text-center bg-gradient-to-br from-blue-500 to-indigo-600">
                <div className="relative z-10">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 mb-2 border-2 border-white/50">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-shadow">Informasi Pembaruan</h2>
                </div>
                 <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors z-20"
                    aria-label="Tutup"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                    <Layers size={20} className="flex-shrink-0 text-blue-500 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-gray-800">Fitur Utama</h3>
                        <p className="text-sm text-gray-600">
                            Pencarian dan detail untuk <strong>Mahasiswa, Dosen, Prodi, & PT</strong> sudah berfungsi sepenuhnya.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Search size={20} className="flex-shrink-0 text-blue-500 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-gray-800">Fitur Baru: Pencarian Spesifik</h3>
                        <p className="text-sm text-gray-600">
                            Temukan mahasiswa dengan hasil lebih akurat. Fitur ini tersedia di halaman <strong>Pencarian Mahasiswa</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="px-6 pb-6 pt-1">
              <button
                onClick={handleClose}
                className="w-full px-6 h-11 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400 shadow-lg hover:shadow-blue-500/50 transform hover:scale-[1.02]"
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