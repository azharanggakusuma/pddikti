'use client';

import { useState, useEffect, useMemo, FormEvent, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileX, ArrowUp, ChevronLeft, ChevronRight, Search, History, Loader2, X, SlidersHorizontal } from 'lucide-react';
import { Mahasiswa } from '@/app/types';
import { MahasiswaCard } from '@/app/components/MahasiswaCard';
import { SkeletonCard } from '@/app/components/SkeletonCard';
import Link from 'next/link';

const RESULTS_PER_PAGE = 10;

export default function MahasiswaPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    // State hooks
    const [allResults, setAllResults] = useState<Mahasiswa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    const [filterPT, setFilterPT] = useState('Semua');
    const [filterProdi, setFilterProdi] = useState('Semua');
    const [sortBy, setSortBy] = useState('nama-asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false); // State untuk menampilkan/menyembunyikan filter

    const [searchQuery, setSearchQuery] = useState(query);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    // Effect hooks dan functions (tidak ada perubahan di sini)
    useEffect(() => {
        setSearchQuery(query);
    }, [query]);

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

    const handleNewSearch = (e?: FormEvent, historyQuery?: string) => {
        if (e) e.preventDefault();
        const finalQuery = historyQuery || searchQuery;
        if (!finalQuery.trim() || finalQuery === query) return;

        updateSearchHistory(finalQuery);
        setIsSearchFocused(false);
        router.push(`/mahasiswa?q=${encodeURIComponent(finalQuery)}`);
    };

    const handleDeleteHistory = (itemToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedHistory = searchHistory.filter(item => item !== itemToDelete);
        setSearchHistory(updatedHistory);
        localStorage.setItem('pddikti_search_history', JSON.stringify(updatedHistory));
    };

    const generateSuggestion = (text: string) => {
        if (text.toLowerCase().includes('muhamad')) return text.replace(/muhamad/i, 'Muhammad');
        if (text.toLowerCase().includes('univ')) return text.replace(/univ/i, 'Universitas');
        return null;
    }

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setLoading(false);
                setAllResults([]);
                return;
            };

            setLoading(true);
            setError(null);
            setSuggestion(null);
            setFilterPT('Semua');
            setFilterProdi('Semua');
            setCurrentPage(1);

            try {
                const response = await fetch(`/api/mahasiswa?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Gagal terhubung ke server');
                
                const resultsData = Array.isArray(data) ? data : [];
                setAllResults(resultsData);
                if(resultsData.length === 0) {
                    setSuggestion(generateSuggestion(query));
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);
    
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
        <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800">
            <main className="w-full max-w-4xl mx-auto">
                <header className="text-center my-12">
                    <Link href="/">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                            Pencarian <span className="text-blue-600">Mahasiswa</span>
                        </h1>
                    </Link>
                    <p className="mt-4 text-lg text-gray-600">
                        Masukkan nama, NIM, atau perguruan tinggi untuk memulai.
                    </p>
                </header>
                
                {/* Search Bar */}
                <div ref={searchWrapperRef} className="w-full mb-8 sticky top-6 z-20">
                    <form onSubmit={handleNewSearch} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400"><Search size={20} /></div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder="Cari mahasiswa..."
                            className="w-full p-4 pl-14 pr-32 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <button 
                                type="submit"
                                disabled={loading || !searchQuery.trim() || searchQuery === query}
                                className="px-5 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Cari'}
                            </button>
                        </div>
                    </form>
                    {/* Riwayat Pencarian */}
                    {isSearchFocused && searchHistory.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                            <p className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Riwayat Pencarian</p>
                            <ul className="max-h-80 overflow-y-auto">
                                {searchHistory.map(item => (
                                    <li key={item} onClick={() => handleNewSearch(undefined, item)} className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors text-sm text-gray-600">
                                        <div className="flex items-center truncate"><History size={16} className="mr-3 text-gray-400 flex-shrink-0"/><span className="text-gray-800 truncate">{item}</span></div>
                                        <button onClick={(e) => handleDeleteHistory(item, e)} className="ml-4 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity flex-shrink-0" aria-label={`Hapus "${item}" dari riwayat`}><X size={16} className="text-gray-500"/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* --- BAGIAN FILTER DAN INFO HASIL YANG DIPERBARUI --- */}
                {!loading && allResults.length > 0 && (
                    <div className="mb-6">
                        {/* Baris Info Hasil dan Opsi Urutkan/Filter */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                            <div className="text-sm text-gray-600">
                                Ditemukan <strong>{processedResults.length} hasil</strong> untuk <span className="font-semibold text-gray-800">"{query}"</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <SlidersHorizontal size={16} />
                                    Filter
                                </button>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-semibold">
                                    <option value="nama-asc">Nama (A-Z)</option>
                                    <option value="nama-desc">Nama (Z-A)</option>
                                    <option value="nim-asc">NIM (Asc)</option>
                                    <option value="nim-desc">NIM (Desc)</option>
                                </select>
                            </div>
                        </div>

                        {/* Panel Filter yang Bisa Dibuka/Tutup */}
                        {showFilters && (
                            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4 animate-fadeIn" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Perguruan Tinggi</label>
                                        <select value={filterPT} onChange={e => { setFilterPT(e.target.value); setCurrentPage(1); }} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                                            {uniquePT.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Program Studi</label>
                                        <select value={filterProdi} onChange={e => { setFilterProdi(e.target.value); setCurrentPage(1); }} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                                            {uniqueProdi.map(prodi => <option key={prodi} value={prodi}>{prodi}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Hasil Pencarian */}
                <div className="grid grid-cols-1 gap-5">
                    {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                    {error && <p className="text-center text-red-500 p-4">{error}</p>}

                    {!loading && !error && !query && (
                        <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-16 rounded-xl flex flex-col items-center justify-center">
                            <Search size={56} className="text-gray-300"/><h3 className="mt-6 font-bold text-xl text-gray-700">Mulai Pencarian Anda</h3><p className="text-base mt-1">Gunakan kotak pencarian di atas untuk menemukan data mahasiswa.</p>
                        </div>
                    )}
                    {!loading && !error && query && processedResults.length === 0 && (
                        <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-16 rounded-xl flex flex-col items-center justify-center">
                            <FileX size={56} className="text-gray-300"/><h3 className="mt-6 font-bold text-xl text-gray-700">Tidak Ada Hasil Ditemukan</h3><p className="text-base mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                            {suggestion && <p className="text-base mt-4">Mungkin maksud Anda: <button onClick={() => handleNewSearch(undefined, suggestion)} className="text-blue-600 hover:underline font-semibold">{suggestion}</button></p>}
                        </div>
                    )}
                    {!loading && paginatedResults.map((mhs, index) => <MahasiswaCard key={mhs.id} mhs={mhs} index={index} />)}
                </div>

                {/* Paginasi */}
                {!loading && totalPages > 1 && (
                    <div className="mt-8 flex justify-between items-center">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-400 transition-colors"><ChevronLeft size={20} /></button>
                        <span className="text-gray-600 text-sm">Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong></span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-400 transition-colors"><ChevronRight size={20} /></button>
                    </div>
                )}

            </main>

            {/* Tombol Back to Top */}
            {showBackToTop && (
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110" style={{ animation: 'fadeInUp 0.5s ease-out' }}><ArrowUp size={24} /></button>
            )}
        </div>
    );
}