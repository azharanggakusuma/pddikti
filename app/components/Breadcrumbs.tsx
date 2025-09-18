'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

// Tipe untuk setiap item breadcrumb
interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Tipe untuk props komponen Breadcrumbs
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {/* Tautan Home selalu ada */}
        <li className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <Home size={16} className="mr-2" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </li>

        {/* Memetakan item breadcrumb lainnya */}
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight size={16} className="text-gray-400" />
              {item.href && index < items.length - 1 ? (
                // Item yang bisa diklik (bukan yang terakhir)
                <Link href={item.href} className="ms-1 md:ms-2 font-medium text-gray-600 hover:text-blue-600 transition-colors truncate max-w-[100px] sm:max-w-none">
                  {item.label}
                </Link>
              ) : (
                // Item terakhir (halaman saat ini), tidak bisa diklik
                <span className="ms-1 md:ms-2 font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-none" aria-current="page">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};