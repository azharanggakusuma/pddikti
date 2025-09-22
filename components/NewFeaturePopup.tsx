// components/NewFeaturePopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Construction, CheckCircle } from 'lucide-react';

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
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header dengan Gradient */}
            <div className="relative p-5 text-white text-center bg-gradient-to-br from-blue-500 to-indigo-600">
                <div className="relative z-10">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 mb-2 border-2 border-white/50">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-shadow">Informasi Fitur</h2>
                    <p className="mt-1 text-xs opacity-90 text-shadow-sm">Pembaruan dan fitur yang perlu Anda ketahui.</p>
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
                {/* Bagian Fitur Tersedia */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2.5 mb-2 text-base">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Fitur yang Tersedia</span>
                  </h3>
                  <ul className="space-y-1.5 pl-4 text-sm text-gray-600">
                    <li className="relative before:content-['•'] before:absolute before:left-[-1em] before:text-blue-500">
                      <strong>Pencarian Mahasiswa:</strong> Termasuk detail dan fitur baru <strong>Pencarian Spesifik</strong>.
                    </li>
                    <li className="relative before:content-['•'] before:absolute before:left-[-1em] before:text-blue-500">
                      <strong>Pencarian Prodi & PT:</strong> Jelajahi data lengkap dengan halaman detail informatif.
                    </li>
                  </ul>
                </div>

                {/* Bagian Dalam Pengembangan */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2.5 mb-2 text-base">
                    <Construction size={16} className="text-amber-500" />
                    <span>Dalam Pengembangan</span>
                  </h3>
                  <p className="text-sm text-amber-800">
                    Fitur <strong>Pencarian Dosen</strong> sudah dapat digunakan, namun halaman <strong>detailnya masih dalam tahap pengembangan</strong>.
                  </p>
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="px-6 pb-6">
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