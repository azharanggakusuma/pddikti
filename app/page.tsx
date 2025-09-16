'use client';

import { useState, useEffect, FormEvent, useRef, useMemo } from 'react';
import {
    Search,
    University,
    BookOpen,
    ArrowUp,
    History,
    FileX,
    Clipboard,
    ClipboardCheck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';


// --- Tipe Data ---
interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
  nama_pt: string;
  nama_prodi: string;
}

// --- Komponen-Kecil ---
const Kbd = ({ children }: { children: React.ReactNode }) => <kbd className="px-2 py-1.5 text-xs font-mono font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg">{children}</kbd>;

// --- Komponen Skeleton ---
const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-lg p-5 border border-gray-200 space-y-4">
        <div className="flex items-center space-x-4"><div className="flex-1 space-y-2"><div className="h-5 w-4/5 bg-gray-300 rounded-md"></div><div className="h-4 w-1/2 bg-gray-300 rounded-md"></div></div></div>
        <div className="pt-4 border-t border-gray-200 space-y-3"><div className="h-4 w-full bg-gray-300 rounded"></div><div className="h-4 w-5/6 bg-gray-300 rounded"></div></div>
    </div>
);

const RESULTS_PER_PAGE = 10;

// --- Komponen Halaman Utama ---
export default function Home() {
    const [query, setQuery] = useState('');
    const [allResults, setAllResults] = useState<Mahasiswa[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    
    // State baru
    const [filterPT, setFilterPT] = useState('Semua');
    const [filterProdi, setFilterProdi] = useState('Semua');
    const [sortBy, setSortBy] = useState('nama-asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [copiedNim, setCopiedNim] = useState<string | null>(null);

    // ... (Hooks useEffect tetap sama) ...
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
    useEffect(() => {
        const history = localStorage.getItem('pddikti_search_history');
        if (history) setSearchHistory(JSON.parse(history));
    }, []);
    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 500);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
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

    // Fungsi untuk membuat saran sederhana
    const generateSuggestion = (text: string) => {
        if (text.toLowerCase().includes('muhamad')) return text.replace(/muhamad/i, 'Muhammad');
        if (text.toLowerCase().includes('univ')) return text.replace(/univ/i, 'Universitas');
        return null;
    }

    const handleSearch = async (e?: FormEvent, historyQuery?: string) => {
        if (e) e.preventDefault();
        const finalQuery = historyQuery || query;
        if (!finalQuery.trim()) return;

        setQuery(finalQuery);
        setIsSearchFocused(false);
        setLoading(true);
        setError(null);
        setHasSearched(true);
        setAllResults([]);
        setSuggestion(null);
        setFilterPT('Semua');
        setFilterProdi('Semua');
        setCurrentPage(1);
        updateSearchHistory(finalQuery);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(finalQuery)}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Gagal terhubung ke server');
            
            const resultsData = Array.isArray(data) ? data : [];
            setAllResults(resultsData);
            if(resultsData.length === 0) {
                setSuggestion(generateSuggestion(finalQuery));
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menyalin NIM
    const handleCopyNim = (nim: string) => {
        navigator.clipboard.writeText(nim);
        setCopiedNim(nim);
        setTimeout(() => setCopiedNim(null), 2000);
    };
    
    const processedResults = useMemo(() => {
        return allResults
            .filter(mhs => (filterPT === 'Semua' || mhs.nama_pt === filterPT))
            .filter(mhs => (filterProdi === 'Semua' || mhs.nama_prodi === filterProdi))
            .sort((a, b) => {
                if (sortBy === 'nama-asc') return a.nama.localeCompare(b.nama);
                if (sortBy === 'nama-desc') return b.nama.localeCompare(a.nama);
                if (sortBy === 'nim-asc') return a.nim.localeCompare(b.nim);
                if (sortBy === 'nim-desc') return b.nim.localeCompare(a.nim);
                return 0;
            });
    }, [allResults, filterPT, filterProdi, sortBy]);

    const paginatedResults = useMemo(() => {
        const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
        return processedResults.slice(startIndex, startIndex + RESULTS_PER_PAGE);
    }, [processedResults, currentPage]);
    
    const totalPages = Math.ceil(processedResults.length / RESULTS_PER_PAGE);
    
    const uniquePT = useMemo(() => ['Semua', ...new Set(allResults.map(mhs => mhs.nama_pt))], [allResults]);
    const uniqueProdi = useMemo(() => ['Semua', ...new Set(allResults.map(mhs => mhs.nama_prodi))], [allResults]);

    return (
        <>
            <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800">
                <main className="w-full max-w-3xl mx-auto">
                    <header className="text-center my-20">
                        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-gray-900">Pencarian PDDIKTI</h1>
                        <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto">
                            Antarmuka modern untuk menelusuri Pangkalan Data Pendidikan Tinggi dengan mudah.
                        </p>
                    </header>
                    
                    <div ref={searchWrapperRef} className="w-full mb-8 sticky top-6 z-10">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500"><Search size={20} /></div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                placeholder="Cari mahasiswa, NIM, atau perguruan tinggi..."
                                className="w-full p-5 pl-14 pr-36 bg-white border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <Kbd>Ctrl+K</Kbd>
                            </div>
                        </form>

                        {isSearchFocused && searchHistory.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                <p className="p-4 text-sm font-semibold text-gray-500 border-b-2 border-gray-200">Riwayat Pencarian</p>
                                <ul>
                                {searchHistory.map(item => (
                                    <li key={item} onClick={() => handleSearch(undefined, item)} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors text-base text-gray-600">
                                    <History size={18} className="mr-4"/> <span className="text-gray-800">{item}</span>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {hasSearched && !loading && allResults.length > 0 && (
                        <div className="mb-6 space-y-4">
                            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Perguruan Tinggi</label>
                                        <select value={filterPT} onChange={e => { setFilterPT(e.target.value); setCurrentPage(1); }} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            {uniquePT.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Program Studi</label>
                                        <select value={filterProdi} onChange={e => { setFilterProdi(e.target.value); setCurrentPage(1); }} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            {uniqueProdi.map(prodi => <option key={prodi} value={prodi}>{prodi}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Urutkan</label>
                                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="nama-asc">Nama (A-Z)</option>
                                            <option value="nama-desc">Nama (Z-A)</option>
                                            <option value="nim-asc">NIM (Terkecil)</option>
                                            <option value="nim-desc">NIM (Terbesar)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center text-sm text-gray-600">
                                Menampilkan <strong>{paginatedResults.length}</strong> dari <strong>{processedResults.length}</strong> hasil
                            </div>
                        </div>
                    )}
                    
                    <div className="w-full space-y-5">
                        {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                        {error && <p className="text-center text-red-500 p-4">{error}</p>}
                        
                        {!loading && hasSearched && paginatedResults.length === 0 && (
                            <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-16 rounded-xl flex flex-col items-center justify-center">
                                <FileX size={64} className="text-gray-300"/>
                                <h3 className="mt-6 font-bold text-xl text-gray-800">Tidak Ada Hasil Ditemukan</h3>
                                <p className="text-base mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                                {suggestion && (
                                    <p className="text-base mt-4">
                                        Mungkin maksud Anda: <button onClick={() => handleSearch(undefined, suggestion)} className="text-blue-600 hover:underline font-semibold">{suggestion}</button>
                                    </p>
                                )}
                            </div>
                        )}

                        {!loading && paginatedResults.map((mhs, index) => (
                           <div key={mhs.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 group" style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${index * 80}ms` }}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="font-bold text-xl truncate" title={mhs.nama}>{mhs.nama}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-gray-500 font-mono text-base">NIM: {mhs.nim}</p>
                                            <button onClick={() => handleCopyNim(mhs.nim)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Salin NIM">
                                                {copiedNim === mhs.nim ? <ClipboardCheck size={16} className="text-blue-600" /> : <Clipboard size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <a href={`https://pddikti.kemdikbud.go.id/data_mahasiswa/${mhs.id.replace(/=/g, '')}`} target="_blank" rel="noopener noreferrer" 
                                        className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all whitespace-nowrap shadow-lg shadow-blue-500/30 hover:bg-blue-700">
                                        Lihat Detail
                                    </a>
                                </div>
                                <div className="mt-5 pt-5 border-t-2 border-dashed border-gray-200 text-base text-gray-600 space-y-3">
                                    <p className="flex items-center"><BookOpen size={18} className="mr-3"/> {mhs.nama_prodi}</p>
                                    <p className="flex items-center"><University size={18} className="mr-3"/> {mhs.nama_pt}</p>
                                </div>
                           </div>
                        ))}
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="mt-8 flex justify-between items-center">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-500 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-gray-600">
                                Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                            </span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-500 transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </main>

                {showBackToTop && (
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all duration-300 transform hover:scale-110" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                        <ArrowUp size={24} />
                    </button>
                )}
                
                <footer className="text-center mt-28 mb-8 text-sm text-gray-500/80">
                    <p>Didesain ulang oleh Gemini untuk pengalaman yang lebih baik.</p>
                </footer>
            </div>
        </>
    );
}