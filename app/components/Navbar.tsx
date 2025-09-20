// app/components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Beranda', exact: true },
  { href: '/mahasiswa', label: 'Mahasiswa' },
  { href: '/dosen', label: 'Dosen' },
  { href: '/prodi', label: 'Prodi' },
  { href: '/pt', label: 'Perguruan Tinggi' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const NavLink = ({
    href,
    children,
    exact = false,
  }: {
    href: string;
    children: React.ReactNode;
    exact?: boolean;
  }) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href) && href !== '/';

    return (
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className="relative py-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors duration-200"
      >
        <span className={isActive ? 'font-semibold text-blue-600' : ''}>{children}</span>
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            layoutId="underline"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* tarik sedikit ke kiri supaya logo sejajar tepi container */}
        <div className="flex items-center justify-between h-16 -ml-2 sm:-ml-4 lg:-ml-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              {/* Pakai ukuran eksplisit + flex align center (bukan fill) */}
              <Image
                src="/logo.png"
                alt="DataDikti Logo"
                width={160}
                height={40}
                // tinggi responsif: 32px di mobile, 40px di md+
                className="h-8 md:h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} exact={link.exact}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-800"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Buka menu utama</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden border-t border-gray-200 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                const active =
                  link.href === '/'
                    ? pathname === link.href
                    : pathname.startsWith(link.href) && link.href !== '/';
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-3 rounded-md text-base transition-colors ${
                      active
                        ? 'font-semibold text-blue-600 bg-blue-50'
                        : 'font-medium text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
