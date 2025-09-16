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
const HistoryIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7 8.586V13h1.5V9.414l1.293-1.293z" clipRule="evenodd" /></svg>;
const EmptyIcon = () => <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;

// --- Komponen-Kecil ---
const Kbd = ({ children }: { children: React.ReactNode }) => <kbd className="px-2 py-1.5 text-xs font-mono font-medium text-[var(--subtle-foreground)] bg-[var(--kbd-background)] border border-[var(--kbd-border)] rounded-lg">{children}</kbd>;

// --- Komponen Skeleton ---
const SkeletonCard = () => (
  <div className="skeleton-pulse bg-white rounded-lg p-5 border border-gray-200 space-y-4">
    <div className="flex items-center space-x-4"><div className="flex-1 space-y-2"><div className="h-5 w-4/5 bg-gray-300 rounded-md"></div><div className="h-4 w-1/2 bg-gray-300 rounded-md"></div></div></div>
    <div className="pt-4 border-t border-gray-200 space-y-3"><div className="h-4 w-full bg-gray-300 rounded"></div><div className="h-4 w-5/6 bg-gray-300 rounded"></div></div>
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
      <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased">
        <main className="w-full max-w-3xl mx-auto">
          <header className="text-center my-20">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-gray-900">Pencarian PDDIKTI</h1>
            <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto">
              Antarmuka modern untuk menelusuri Pangkalan Data Pendidikan Tinggi dengan mudah.
            </p>
          </header>

          <div ref={searchWrapperRef} className="w-full mb-12 sticky top-6 z-10">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500"><SearchIcon /></div>
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
              <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl fade-in-up" style={{ animationDuration: '300ms' }}>
                <p className="p-4 text-sm font-semibold text-gray-500 border-b-2 border-gray-200">Riwayat Pencarian</p>
                <ul>
                  {searchHistory.map(item => (
                    <li key={item} onClick={() => handleSearch(undefined, item)} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors text-base text-gray-500">
                      <HistoryIcon/> <span className="ml-4 text-gray-800">{item}</span>
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
              <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-16 rounded-xl flex flex-col items-center justify-center">
                <EmptyIcon/>
                <h3 className="mt-6 font-bold text-xl text-gray-800">Tidak Ada Hasil Ditemukan</h3>
                <p className="text-base mt-1">Coba periksa kembali kata kunci pencarian Anda.</p>
              </div>
            )}

            {!loading && results.length > 0 && results.map((mhs, index) => (
              <div key={mhs.id} className="fade-in-up bg-[var(--card-background)] rounded-xl p-6 border-2 border-[var(--border-color)] hover:border-[var(--primary-accent)] hover:shadow-2xl hover:shadow-[var(--primary-accent)]/10 hover:-translate-y-1.5 transition-all duration-300 group" style={{ animationDelay: `${index * 100}ms` }}>
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
        
        <footer className="text-center mt-28 mb-8 text-sm text-gray-500/80">
          <p>Didesain ulang oleh Gemini untuk pengalaman yang lebih baik.</p>
        </footer>
      </div>
    </>
  );
}