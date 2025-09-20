// app/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, SVGMotionProps } from 'framer-motion';

// --- DATA NAVIGASI ---
const navLinks = [
  { href: '/', label: 'Beranda', exact: true },
  { href: '/mahasiswa', label: 'Mahasiswa' },
  { href: '/dosen', label: 'Dosen' },
  { href: '/prodi', label: 'Prodi' },
  { href: '/pt', label: 'Perguruan Tinggi' },
];

// --- VARIAN ANIMASI (LEBIH CEPAT & RESPONSIF) ---
const overlayVariants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.3, // Animasi keluar lebih cepat
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1, // Tautan menghilang dari bawah ke atas
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3, // Animasi masuk lebih cepat
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

const linkVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.2 } // Animasi setiap tautan lebih cepat
  },
};

// --- KOMPONEN IKON HAMBURGER ANIMASI ---
const Path = (props: SVGMotionProps<SVGPathElement>) => (
  <motion.path
    fill="transparent"
    strokeWidth="2.5"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({ toggle, isOpen }: { toggle: () => void, isOpen: boolean }) => (
  <button
    onClick={toggle}
    className="relative z-50 w-8 h-8 focus:outline-none"
    aria-label={isOpen ? "Tutup menu" : "Buka menu"}
  >
    {/* Ganti warna ikon menjadi hitam saat menu terbuka agar kontras dengan navbar putih */}
    <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-600">
      <Path
        variants={{ closed: { d: "M 4 6 L 20 6" }, open: { d: "M 6 18 L 18 6" } }}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
      />
      <Path
        d="M 4 12 L 20 12"
        variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{ closed: { d: "M 4 18 L 20 18" }, open: { d: "M 6 6 L 18 18" } }}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
      />
    </svg>
  </button>
);

// --- KOMPONEN NAVBAR UTAMA ---
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Mengunci scroll body saat menu terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Image
                src="/logo.png"
                alt="DataDikti Logo"
                width={150}
                height={38}
                className="h-8 md:h-9 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href) && link.href !== '/';
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative py-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className={isActive ? 'font-semibold text-blue-600' : ''}>{link.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        layoutId="underline"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <MenuToggle toggle={() => setIsOpen(!isOpen)} isOpen={isOpen} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Fullscreen Overlay (Diperbarui) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            // --- PERUBAHAN LATAR BELAKANG ---
            className="fixed inset-0 z-30 bg-white/70 backdrop-blur-xl flex items-center justify-center"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              className="flex flex-col space-y-6 text-center"
            >
              {navLinks.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href) && link.href !== '/';
                return (
                  <motion.div key={link.href} variants={linkVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      // --- PERUBAHAN Tampilan Tautan ---
                      className={`text-3xl font-semibold transition-colors duration-300 ${
                        isActive
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};