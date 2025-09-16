'use client';

import { useState, useEffect, FormEvent, useRef, useCallback } from 'react';

// --- Tipe Data ---
interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
  nama_pt: string;
  nama_prodi: string;
}

// --- Ikon SVG ---
const SearchIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const UniversityIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5" /></svg>;
const BookOpenIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ArrowUpIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>;
const FilterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const MoonIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>;
const SunIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const HistoryIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7 8.586V13h1.5V9.414l1.293-1.293z" clipRule="evenodd" /></svg>;
const EmptyIcon = () => <svg className="w-20 h-20 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;


// --- Komponen-Komponen Kecil ---
const Kbd = ({ children }: { children: React.ReactNode }) => <kbd className="px-2 py-1.5 text-xs font-mono font-medium text-[var(--subtle-foreground)] bg-[var(--kbd-background)] border border-[var(--kbd-border)] rounded-lg">{children}</kbd>;

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

// --- Komponen Skeleton ---
const SkeletonCard = () => (
  <div className="skeleton-pulse bg-[var(--card-background)] rounded-lg p-5 border border-[var(--border-color)] space-y-4">
    <div className="flex items-center space-x-4"><div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div><div className="flex-1 space-y-2"><div className="h-5 w-4/5 bg-gray-300 dark:bg-gray-700 rounded-md"></div><div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md"></div></div></div>
    <div className="flex space-x-2"><div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div><div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div></div>
    <div className="pt-4 border-t border-[var(--border-color)] space-y-3"><div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div><div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded"></div></div>
  </div>
);

// --- Komponen Halaman Utama ---
export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Efek untuk Command+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Efek untuk memuat riwayat pencarian
  useEffect(() => {
    const history = localStorage.getItem('pddikti_search_history');
    if (history) setSearchHistory(JSON.parse(history));
  }, []);
  
  // Efek untuk tombol back-to-top
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Klik di luar untuk menutup riwayat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
            setIsSearchFocused(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const updateSearchHistory = (newQuery: string) => {
    const updatedHistory = [newQuery, ...searchHistory.filter(q => q !== newQuery)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('pddikti_search_history', JSON.stringify(updatedHistory));
  };

  const handleSearch = async (e?: FormEvent, historyQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = historyQuery || query;
    if (!finalQuery.trim()) return;

    setQuery(finalQuery);
    setIsSearchFocused(false);
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]);
    updateSearchHistory(finalQuery);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(finalQuery)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal terhubung ke server');
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="absolute top-6 right-6 z-20"> <ThemeToggle/> </div>
      <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased">
        <main className="w-full max-w-3xl mx-auto">
          <header className="text-center my-20">
             <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Pencarian PDDIKTI</h1>
            <p className="mt-5 text-lg text-[var(--subtle-foreground)] max-w-xl mx-auto">
              Antarmuka modern untuk menelusuri Pangkalan Data Pendidikan Tinggi dengan mudah.
            </p>
          </header>

          <div ref={searchWrapperRef} className="w-full mb-12 sticky top-6 z-10">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[var(--subtle-foreground)]"><SearchIcon /></div>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Cari mahasiswa, NIM, atau perguruan tinggi..."
                className="w-full p-5 pl-14 pr-36 bg-[var(--card-background)] border-2 border-[var(--border-color)] rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-[var(--primary-accent)]/20 transition-all duration-300"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <Kbd>Ctrl+K</Kbd>
              </div>
            </form>

            {isSearchFocused && searchHistory.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-[var(--card-background)] border-2 border-[var(--border-color)] rounded-xl shadow-2xl fade-in-up" style={{ animationDuration: '300ms' }}>
                <p className="p-4 text-sm font-semibold text-[var(--subtle-foreground)] border-b-2 border-[var(--border-color)]">Riwayat Pencarian</p>
                <ul>
                  {searchHistory.map(item => (
                    <li key={item} onClick={() => handleSearch(undefined, item)} className="flex items-center p-4 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors text-base text-[var(--subtle-foreground)]">
                      <HistoryIcon/> <span className="ml-4 text-[var(--foreground)]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="w-full space-y-5">
            {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            {error && <p className="text-center text-red-500 p-4">{error}</p>}
            
            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="text-center text-[var(--subtle-foreground)] border-2 border-dashed border-[var(--border-color)] p-16 rounded-xl flex flex-col items-center justify-center">
                <EmptyIcon/>
                <h3 className="mt-6 font-bold text-xl text-[var(--foreground)]">Tidak Ada Hasil Ditemukan</h3>
                <p className="text-base mt-1">Coba periksa kembali kata kunci pencarian Anda.</p>
              </div>
            )}

            {!loading && results.length > 0 && results.map((mhs, index) => (
              <div key={mhs.id} className="fade-in-up bg-[var(--card-background)] rounded-xl p-6 border-2 border-[var(--border-color)] hover:border-[var(--primary-accent)] hover:shadow-2xl hover:shadow-[var(--primary-accent)]/10 hover:-translate-y-1.5 transition-all duration-300 group" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start space-x-5">
                  <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center font-bold text-2xl text-[var(--primary-accent)]">
                    {mhs.nama_pt.substring(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-bold text-xl truncate" title={mhs.nama}>{mhs.nama}</h2>
                        <p className="text-[var(--subtle-foreground)] font-mono text-base">NIM: {mhs.nim}</p>
                      </div>
                      <a href={`https://pddikti.kemdikbud.go.id/data_mahasiswa/${mhs.id.replace(/=/g, '')}`} target="_blank" rel="noopener noreferrer" 
                         className="px-4 py-2 text-sm font-semibold bg-[var(--primary-accent)] text-[var(--primary-accent-foreground)] rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all whitespace-nowrap shadow-lg shadow-[var(--primary-accent)]/30 hover:bg-[var(--primary-accent-hover)]">
                          Lihat Detail
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t-2 border-dashed border-[var(--border-color)] text-base text-[var(--subtle-foreground)] space-y-3">
                  <p className="flex items-center"><BookOpenIcon/> {mhs.nama_prodi}</p>
                  <p className="flex items-center"><UniversityIcon/> {mhs.nama_pt}</p>
                </div>
              </div>
            ))}
          </div>
        </main>

        {showBackToTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="fade-in-up fixed bottom-8 right-8 bg-[var(--primary-accent)] text-[var(--primary-accent-foreground)] p-4 rounded-full shadow-2xl shadow-[var(--primary-accent)]/40 hover:bg-[var(--primary-accent-hover)] transition-all duration-300 transform hover:scale-110">
            <ArrowUpIcon />
          </button>
        )}
        
        <footer className="text-center mt-28 mb-8 text-sm text-[var(--subtle-foreground)]/80">
          <p>Didesain ulang oleh Gemini untuk pengalaman yang lebih baik.</p>
        </footer>
      </div>
    </>
  );
}