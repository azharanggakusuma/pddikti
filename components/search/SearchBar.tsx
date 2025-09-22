// components/search/SearchBar.tsx
'use client';

import { FormEvent, RefObject } from 'react';
import { Search, Loader2, History, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  handleNewSearch: (e?: FormEvent, historyQuery?: string) => void;
  loading: boolean;
  query: string;
  placeholder: string;
  searchInputRef: RefObject<HTMLInputElement | null>; 
  isSearchFocused: boolean;
  setIsSearchFocused: (isFocused: boolean) => void;
  searchHistory: string[];
  handleDeleteHistory: (item: string, e: React.MouseEvent) => void;
  // Perubahan di baris berikut
  searchWrapperRef: RefObject<HTMLDivElement | null>;
}

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  handleNewSearch,
  loading,
  query,
  placeholder,
  searchInputRef,
  isSearchFocused,
  setIsSearchFocused,
  searchHistory,
  handleDeleteHistory,
  searchWrapperRef,
}: SearchBarProps) => {
  return (
    <div ref={searchWrapperRef} className="w-full mb-4 sticky top-4 sm:top-6 z-20">
      <form onSubmit={handleNewSearch} className="w-full bg-white rounded-xl shadow-sm border border-gray-200/80 transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 overflow-hidden">
        <div className="flex items-center w-full">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={placeholder}
            className="w-full pl-5 pr-2 py-4 bg-transparent focus:outline-none text-base text-gray-800 placeholder-gray-500 truncate"
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim() || searchQuery === query}
            className="mr-2 ml-1 px-4 sm:px-5 h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
            aria-label="Cari"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Search size={20} className="sm:mr-2" />
                <span className="hidden sm:inline font-semibold">Cari</span>
              </>
            )}
          </button>
        </div>
      </form>
      {isSearchFocused && searchHistory.length > 0 && (
        <div
          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20"
          style={{ animation: 'fadeInUp 0.3s ease-out' }}
        >
          <p className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">
            Riwayat Pencarian
          </p>
          <ul className="max-h-80 overflow-y-auto">
            {searchHistory.map((item) => (
              <li
                key={item}
                onClick={() => handleNewSearch(undefined, item)}
                className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors text-sm text-gray-600"
              >
                <div className="flex items-center truncate">
                  <History size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-800 truncate">{item}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteHistory(item, e)}
                  className="ml-4 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity flex-shrink-0"
                  aria-label={`Hapus "${item}" dari riwayat`}
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};