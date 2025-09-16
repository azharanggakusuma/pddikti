'use client';

import { useState, useEffect, FormEvent } from 'react';

// --- Ikon SVG ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const UniversityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c1.255 0 2.443.29 3.5.804v10A7.969 7.969 0 0114.5 16c-1.255 0-2.443-.29-3.5-.804V4.804A7.968 7.968 0 0114.5 4z" /></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Interface ---
interface Mahasiswa {
  id: string; nama: string; nim: string; nama_pt: string; nama_prodi: string;
}

// --- Komponen Skeleton ---
const SkeletonCard = () => (
    <div className="skeleton-pulse bg-[var(--card-background)] rounded-xl shadow-sm p-6 border border-[var(--border-color)]">
        <div className="flex justify-between items-start">
            <div className="w-3/4">
                <div className="h-6 w-4/5 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md mt-3"></div>
            </div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="mt-5 pt-4 border-t border-[var(--border-color)]/50 space-y-3">
            <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded-full mr-2"></div>
                <div className="h-5 w-full bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            </div>
            <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded-full mr-2"></div>
                <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            </div>
        </div>
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

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(null); setHasSearched(true); setResults([]);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
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
    <div className="font-sans min-h-screen p-4 sm:p-6 flex flex-col items-center">
      <main className="w-full max-w-2xl mx-auto">
        <header className="text-center my-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter">
              <span className="gradient-text">Pencarian PDDIKTI</span>
            </h1>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Antarmuka modern untuk menelusuri Pangkalan Data Pendidikan Tinggi.
            </p>
        </header>

        <form onSubmit={handleSearch} className="w-full mb-8 sticky top-4 z-10">
            <div className="relative shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <SearchIcon/>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ketik nama atau NIM mahasiswa..."
                    className="w-full p-4 pl-11 pr-32 bg-[var(--card-background)] border border-[var(--border-color)] rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
                />
                <button type="submit" disabled={loading} className="absolute inset-y-0 right-0 m-1.5 px-6 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100">
                    {loading ? 'Mencari...' : 'Cari'}
                </button>
            </div>
        </form>

        <div className="w-full space-y-4">
          {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {error && <div className="text-center text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/20 p-4 rounded-xl flex items-center justify-center"><InfoIcon/> {error}</div>}
          
          {!loading && hasSearched && results.length === 0 && !error && (
             <div className="text-center text-gray-500 bg-gray-50 dark:bg-gray-900/20 p-6 rounded-xl flex items-center justify-center">
                <InfoIcon/> Tidak ada data yang cocok.
             </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 pb-2">
                Menampilkan <strong>{results.length}</strong> hasil pencarian.
              </p>
              {results.map((mhs, index) => (
                <div 
                  key={mhs.id} 
                  className="fade-in-up bg-[var(--card-background)] rounded-xl shadow-sm p-5 border border-[var(--border-color)] hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300" 
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div className="flex-1">
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">{mhs.nama}</p>
                            <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">NIM: {mhs.nim}</p>
                        </div>
                        <a 
                          href={`https://pddikti.kemdikbud.go.id/data_mahasiswa/${mhs.id.replace(/=/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors whitespace-nowrap self-start sm:self-center"
                        >
                            Lihat Detail
                        </a>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--border-color)]/60 space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300 flex items-center"><BookOpenIcon/> {mhs.nama_prodi}</p>
                        <p className="text-gray-700 dark:text-gray-300 flex items-center"><UniversityIcon/> {mhs.nama_pt}</p>
                    </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      {showBackToTop && (
        <button onClick={scrollToTop} className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <ArrowUpIcon />
        </button>
      )}

      <footer className="text-center mt-16 text-xs text-gray-500">
        <p>UI didesain ulang oleh Gemini</p>
      </footer>
    </div>
  );
}