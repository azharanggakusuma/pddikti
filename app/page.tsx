'use client';

import { useState } from 'react';

// Interface untuk data mahasiswa
interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
  nama_pt: string;
  nama_prodi: string;
}

// Komponen Ikon sederhana
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const UniversityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c1.255 0 2.443.29 3.5.804v10A7.969 7.969 0 0114.5 16c-1.255 0-2.443-.29-3.5-.804V4.804A7.968 7.968 0 0114.5 4z" />
    </svg>
)

// Komponen Loading Spinner
const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }
      
      if (Array.isArray(data) && data.length > 0) {
        setResults(data);
      } else {
        setResults([]);
      }

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <main className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center my-8">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-800 dark:text-white">
              Pencarian Data <span className="text-blue-600">PDDIKTI</span>
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              Temukan data mahasiswa dari seluruh perguruan tinggi di Indonesia.
            </p>
        </div>

        {/* Form Pencarian */}
        <form onSubmit={handleSearch} className="relative w-full mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketikkan nama mahasiswa..."
            className="search-input w-full px-5 py-4 pr-12 text-lg rounded-full shadow-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            aria-label="Cari"
          >
            <SearchIcon/>
          </button>
        </form>

        {/* Area Hasil */}
        <div className="w-full">
          {loading && <Spinner />}
          
          {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">Error: {error}</p>}
          
          {!loading && hasSearched && results.length === 0 && !error && (
             <p className="text-center text-gray-500 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg">Data tidak ditemukan.</p>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((mahasiswa, index) => (
                <div key={mahasiswa.id} className="fade-in bg-[var(--card-background)] rounded-xl shadow-lg p-6 border border-transparent hover:border-blue-500 transition-all duration-300" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <div>
                            <p className="font-bold text-xl text-gray-900 dark:text-white">{mahasiswa.nama}</p>
                            <p className="text-gray-500 dark:text-gray-400 font-mono">NIM: {mahasiswa.nim}</p>
                        </div>
                        <a href={`https://pddikti.kemdikbud.go.id/data_mahasiswa/${mahasiswa.id.replace(/=/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-3 sm:mt-0 px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors">
                            Lihat Detail →
                        </a>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 flex items-center"><BookOpenIcon/>{mahasiswa.nama_prodi}</p>
                        <p className="text-gray-700 dark:text-gray-300 flex items-center mt-1"><UniversityIcon/>{mahasiswa.nama_pt}</p>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="text-center mt-12 text-gray-500">
        <p>Dibuat dengan Next.js dan API PDDIKTI</p>
      </footer>
    </div>
  );
}