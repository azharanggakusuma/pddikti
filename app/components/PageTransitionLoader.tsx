'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

// Variabel global sederhana untuk melacak muatan halaman awal
let isInitialLoad = true;

export const PageTransitionLoader = () => {
  const [isLoading, setIsLoading] = useState(isInitialLoad);
  const pathname = usePathname();

  // Efek ini akan berjalan setiap kali ada perubahan halaman
  useEffect(() => {
    // Tandai bahwa muatan halaman awal telah selesai setelah render pertama
    if (isInitialLoad) {
      isInitialLoad = false;
    }
    
    // Sembunyikan loader saat navigasi selesai
    setIsLoading(false);

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href');
      
      // Cek untuk navigasi internal, bukan halaman yang sama, dan bukan link hash
      if (href && href.startsWith('/') && !href.startsWith('/#') && href !== window.location.pathname) {
        setIsLoading(true);
      }
    };

    const anchors = document.querySelectorAll('a');
    anchors.forEach(a => a.addEventListener('click', handleAnchorClick));

    return () => {
      anchors.forEach(a => a.removeEventListener('click', handleAnchorClick));
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 1.2,
              ease: 'easeInOut',
            }}
          >
            <GraduationCap className="h-16 w-16 text-blue-600" />
          </motion.div>
          <p className="mt-4 text-sm font-semibold text-gray-600">
            Memuat halaman...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};