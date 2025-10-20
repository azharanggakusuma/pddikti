// components/popups/NewFeaturePopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';

export const NewFeaturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Key yang diperbarui untuk memastikan desain baru ini muncul
    const hasSeenPopup = sessionStorage.getItem('hasSeenV4_DesignUpdate');
    if (!hasSeenPopup) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenV4_DesignUpdate', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200/50"
          >
            {/* Header dengan Ikon Gradien */}
            <div className="relative p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 mb-4">
                    <Sparkles size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Fitur Baru Telah Tiba!
                </h2>
                <p className="mt-1 text-base text-gray-500">
                  Pencarian kini lebih pintar dan akurat.
                </p>

                {/* Tombol Close */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
                    aria-label="Tutup"
                >
                    <X size={24} />
                </button>
            </div>
            
            <div className="px-6 pb-6 pt-2">
              {/* Deskripsi Fitur */}
              <div className="text-center bg-gray-50 p-4 rounded-xl border">
                  <p className="text-sm text-gray-700 leading-relaxed">
                      Sekarang Anda bisa melakukan pencarian spesifik untuk <strong className="text-indigo-600">Mahasiswa</strong>, <strong className="text-indigo-600">Dosen</strong>, dan <strong className="text-indigo-600">Prodi</strong> untuk hasil yang lebih presisi.
                  </p>
              </div>
              
              {/* Tombol Aksi */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="group flex items-center justify-center w-full px-6 h-12 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400 shadow-lg shadow-blue-500/30"
                >
                  Siap, Jelajahi Sekarang
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};