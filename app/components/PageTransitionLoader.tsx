'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, type Transition, easeInOut } from 'framer-motion';

// Variasi animasi untuk setiap titik
const dotVariants = {
  initial: { y: '0%' },
  animate: { y: '-100%' },
};

// Transisi yang akan digunakan oleh setiap titik, menciptakan efek berulang
// Penting: gunakan easing function (easeInOut) atau array cubic-bezier, bukan string.
const dotTransition: Transition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: 'reverse',
  ease: easeInOut, // ✅ perbaikan utama (bukan 'easeInOut' string)
};

export const PageTransitionLoader = () => {
  const [isLoading, setIsLoading] = useState(true); // Mulai dengan state loading
  const pathname = usePathname();

  // Efek ini menangani SEMUA kondisi (refresh dan pindah halaman)
  useEffect(() => {
    // Sembunyikan loader saat komponen pertama kali aktif di browser (setelah refresh)
    // atau saat navigasi ke halaman baru selesai.
    setIsLoading(false);

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href');

      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        href !== window.location.pathname
      ) {
        setIsLoading(true);
      }
    };

    const anchors = document.querySelectorAll('a');
    anchors.forEach((a) => a.addEventListener('click', handleAnchorClick));

    return () => {
      anchors.forEach((a) => a.removeEventListener('click', handleAnchorClick));
    };
  }, [pathname]); // 'pathname' menjadi pemicu utama

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <motion.div
            className="flex space-x-3"
            variants={{
              initial: { transition: { staggerChildren: 0.2 } },
              animate: { transition: { staggerChildren: 0.2 } },
            }}
            initial="initial"
            animate="animate"
          >
            {/* Titik 1 */}
            <motion.div
              className="h-4 w-4 bg-blue-600 rounded-full"
              variants={dotVariants}
              transition={dotTransition}
            />
            {/* Titik 2 */}
            <motion.div
              className="h-4 w-4 bg-blue-600 rounded-full"
              variants={dotVariants}
              transition={dotTransition}
            />
            {/* Titik 3 */}
            <motion.div
              className="h-4 w-4 bg-blue-600 rounded-full"
              variants={dotVariants}
              transition={dotTransition}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
