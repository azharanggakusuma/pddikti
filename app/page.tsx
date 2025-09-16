'use client';

import { useState, useEffect } from 'react';

// Interfaces & Ikon
interface Mahasiswa {
  id: string; nama: string; nim: string; nama_pt: string; nama_prodi: string;
}

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const UniversityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2.5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2.5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c1.255 0 2.443.29 3.5.804v10A7.969 7.969 0 0114.5 16c-1.255 0-2.443-.29-3.5-.804V4.804A7.968 7.968 0 0114.5 4z" /></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;

// Komponen Skeleton untuk Loading State
const SkeletonCard = () => (
    <div className="skeleton-pulse bg-[var(--card-background)] rounded-2xl shadow-md p-6 border border-[var(--border-color)]">
        <div className="flex justify-between items-center">
            <div>
                <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
            </div>
            <div className="h-9 w-28 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]/50 space-y-3">
            <div className="h-5 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
    </div>
);

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true); setError(null); setHasSearched(true);
    try {
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Network response was not ok');
      if (Array.isArray(data)) setResults(data); else setResults([]);
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <main className="w-full max-w-3xl mx-auto">
        <header className="text-center my-12 sm:my-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Pencarian Cerdas <span className="text-blue-500">PDDIKTI</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Antarmuka modern untuk menjelajahi Pangkalan Data Pendidikan Tinggi Indonesia.
            </p>
        </header>

        <form onSubmit={handleSearch} className="w-full mb-10 sticky top-4 z-10">
            <div className="gradient-border-container shadow-lg">
                <div className="relative flex items-center bg-[var(--card-background)] rounded-full">
                    <div className="pl-5 text-gray-400"><SearchIcon/></div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ketik nama mahasiswa..."
                        className="w-full p-4 pl-3 bg-transparent text-lg focus:outline-none"
                    />
                    <button type="submit" disabled={loading} className="mr-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100">
                        {loading ? '...' : 'Cari'}
                    </button>
                </div>
            </div>
        </form>

        <div className="w-full">
          {loading && <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}
          {error && <p className="text-center text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30 p-4 rounded-xl">Error: {error}</p>}
          {!loading && hasSearched && results.length === 0 && !error && (
             <p className="text-center text-gray-500 bg-gray-100 dark:bg-gray-900/50 p-6 rounded-xl">Tidak ada data mahasiswa yang cocok dengan pencarian Anda.</p>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Menampilkan {results.length} hasil.</p>
              <div className="space-y-4">
                {results.map((mahasiswa, index) => (
                  <div key={mahasiswa.id} className="fade-in-up bg-[var(--card-background)] rounded-2xl shadow-md p-6 border border-[var(--border-color)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                          <div className="flex-1">
                              <p className="font-bold text-xl text-gray-900 dark:text-white">{mahasiswa.nama}</p>
                              <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">NIM: {mahasiswa.nim}</p>
                          </div>
                          <a href={`https://pddikti.kemdikbud.go.id/data_mahasiswa/${mahasiswa.id.replace(/=/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors whitespace-nowrap self-start sm:self-center">
                              Lihat Detail
                          </a>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[var(--border-color)]/50 space-y-2 text-sm">
                          <p className="text-gray-700 dark:text-gray-300 flex items-center"><BookOpenIcon/> {mahasiswa.nama_prodi}</p>
                          <p className="text-gray-700 dark:text-gray-300 flex items-center"><UniversityIcon/> {mahasiswa.nama_pt}</p>
                      </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {showBackToTop && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110">
          <ArrowUpIcon />
        </button>
      )}

      <footer className="text-center mt-16 text-sm text-gray-500">
        <p>UI Didesain Ulang oleh Gemini</p>
      </footer>
    </div>
  );
}