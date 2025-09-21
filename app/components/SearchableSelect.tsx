// app/components/SearchableSelect.tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, University, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  iconType: 'university' | 'prodi'; // menentukan ikon
}

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  disabled = false,
  iconType,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm]
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const Icon = iconType === 'university' ? University : BookOpen;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center w-full h-12 px-3 text-left bg-white border rounded-lg transition-all duration-200 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <Icon className={`${value !== 'Semua' ? 'text-blue-600' : 'text-gray-400'} flex-shrink-0`} size={20} />
          <div className="flex-grow min-w-0">
            {value !== 'Semua' ? (
              <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
            ) : (
              <p className="text-sm text-gray-500">{disabled ? 'Pilih Perguruan Tinggi terlebih dahulu' : placeholder}</p>
            )}
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 ml-2">
          <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: 'spring', stiffness: 400, damping: 25 } as const,
            }}
            exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.1 } }}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-2xl shadow-gray-200/60 z-50 max-h-60 flex flex-col"
            role="listbox"
          >
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-7 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Bersihkan pencarian"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <ul className="overflow-y-auto flex-grow">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option}
                    onMouseDown={() => handleSelect(option)} // mousedown agar tidak kehilangan focus sebelum klik selesai
                    className={`p-3 text-sm cursor-pointer hover:bg-blue-50 ${
                      value === option ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800'
                    }`}
                    role="option"
                    aria-selected={value === option}
                  >
                    {option}
                  </li>
                ))
              ) : (
                <li className="p-3 text-sm text-gray-500 text-center select-none">Tidak ada hasil</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
