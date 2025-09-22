// components/search/Pagination.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex justify-between items-center">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-400 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-gray-600 text-sm">
        Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-400 transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};