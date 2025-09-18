// app/search/page.tsx
"use client";

import { useState, useEffect, useMemo, FormEvent, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Loader2, FileX, Search, ChevronLeft, ChevronRight,
  GraduationCap, User, School, BookOpen, History, X
} from 'lucide-react';
import { Mahasiswa, Dosen, PerguruanTinggi, ProgramStudi } from '@/app/types';
import { MahasiswaCard } from '@/app/components/MahasiswaCard';
import { DosenCard } from '@/app/components/DosenCard';
import { PtCard } from '@/app/components/PtCard';
import { ProdiCard } from '@/app/components/ProdiCard';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';
import { SkeletonCard } from '@/app/components/SkeletonCard';
import Link from 'next/link';

interface SearchResult {
    mahasiswa: Mahasiswa[];
    dosen: Dosen[];
    pt: PerguruanTinggi[];
    prodi: ProgramStudi[];
}

// Komponen Paginasi yang bisa digunakan kembali
const PaginationControls = ({ currentPage, totalPages, onPageChange, categoryName }: { currentPage: number, totalPages: number, onPageChange: (newPage: number) => void, categoryName: string }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-6 flex justify-between items-center">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-400 transition-colors"
                aria-label={`Halaman sebelumnya untuk ${categoryName}`}
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
                aria-label={`Halaman berikutnya untuk ${categoryName}`}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

const RESULTS_PER_PAGE = 5; // Batas item per kategori per halaman

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    // State untuk hasil
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State untuk UI dan filter
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [pageState, setPageState] = useState({
        mahasiswa: 1,
        dosen: 1,
        pt: 1,
        prodi: 1,
    });

    // State untuk search bar
    const [searchQuery, setSearchQuery] = useState(query);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    // --- Effects & Handlers untuk Search Bar ---
    useEffect(() => { setSearchQuery(query); }, [query]);
    useEffect(() => {
        const history = localStorage.getItem("pddikti_search_history");
        if (history) setSearchHistory(JSON.parse(history));
    }, []);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) setIsSearchFocused(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateSearchHistory = (newQuery: string) => {
        const updatedHistory = [newQuery, ...searchHistory.filter((q) => q !== newQuery)].slice(0, 5);
        setSearchHistory(updatedHistory);
        localStorage.setItem("pddikti_search_history", JSON.stringify(updatedHistory));
    };
    const handleNewSearch = (e?: FormEvent, historyQuery?: string) => {
        if (e) e.preventDefault();
        const finalQuery = historyQuery || searchQuery;
        if (!finalQuery.trim() || finalQuery === query) return;
        updateSearchHistory(finalQuery);
        setIsSearchFocused(false);
        router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
    };
    const handleDeleteHistory = (itemToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedHistory = searchHistory.filter((item) => item !== itemToDelete);
        setSearchHistory(updatedHistory);
        localStorage.setItem("pddikti_search_history", JSON.stringify(updatedHistory));
    };

    // --- Fetching Data ---
    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setLoading(false);
                setResults(null);
                return;
            }
            setLoading(true);
            setError(null);
            setPageState({ mahasiswa: 1, dosen: 1, pt: 1, prodi: 1 });
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Gagal terhubung ke server');
                setResults(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    // --- Data Processing ---
    const handlePageChange = (category: keyof typeof pageState, newPage: number) => {
        setPageState(prev => ({ ...prev, [category]: newPage }));
    };

    const paginatedData = useMemo(() => {
        const paginate = (items: any[] | undefined, page: number) => {
            if (!items || items.length === 0) return { data: [], totalPages: 0 };
            const totalPages = Math.ceil(items.length / RESULTS_PER_PAGE);
            const startIndex = (page - 1) * RESULTS_PER_PAGE;
            const data = items.slice(startIndex, startIndex + RESULTS_PER_PAGE);
            return { data, totalPages };
        };

        return {
            mahasiswa: paginate(results?.mahasiswa, pageState.mahasiswa),
            dosen: paginate(results?.dosen, pageState.dosen),
            pt: paginate(results?.pt, pageState.pt),
            prodi: paginate(results?.prodi, pageState.prodi),
        };
    }, [results, pageState]);
    
    const totalResultsCount = useMemo(() => {
        if (!results) return 0;
        const filterKey = activeFilter.toLowerCase().replace(' ', '_');
        switch (filterKey) {
            case 'mahasiswa': return results.mahasiswa?.length || 0;
            case 'dosen': return results.dosen?.length || 0;
            case 'perguruan_tinggi': return results.pt?.length || 0;
            case 'program_studi': return results.prodi?.length || 0;
            default: return Object.values(results).reduce((acc, val) => acc + (val?.length || 0), 0);
        }
    }, [results, activeFilter]);


    const hasAnyResults = results && Object.values(results).some(val => Array.isArray(val) && val.length > 0);
    const breadcrumbItems = [{ label: "Pencarian Umum" }];
    
    // --- Render ---
    return (
        <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800">
            <main className="w-full max-w-4xl mx-auto">
                <Breadcrumbs items={breadcrumbItems} />
                <header className="text-center mb-8 sm:mb-12">
                    <Link href="/">
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                            Pencarian <span className="text-blue-600">Umum</span>
                        </h1>
                    </Link>
                    <p className="mt-4 text-base sm:text-lg text-gray-600">
                        Hasil pencarian untuk semua kategori berdasarkan kata kunci yang Anda masukkan.
                    </p>
                </header>
                
                {/* Search Bar */}
                <div ref={searchWrapperRef} className="w-full mb-8 sticky top-4 sm:top-6 z-20">
                    <form onSubmit={handleNewSearch} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-gray-400"><Search size={20} /></div>
                        <input
                            ref={searchInputRef} type="text" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)}
                            placeholder="Ketik Nama, NIM, NIDN, Prodi, atau PT..."
                            className="w-full p-3 sm:p-4 pl-12 sm:pl-14 pr-24 sm:pr-32 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <button
                                type="submit" disabled={loading || !searchQuery.trim() || searchQuery === query}
                                className="px-4 sm:px-5 h-9 sm:h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                            >{loading ? <Loader2 size={20} className="animate-spin" /> : "Cari"}</button>
                        </div>
                    </form>
                    {isSearchFocused && searchHistory.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                            <p className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Riwayat Pencarian</p>
                            <ul className="max-h-80 overflow-y-auto">
                                {searchHistory.map((item) => (
                                    <li key={item} onClick={() => handleNewSearch(undefined, item)} className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors text-sm text-gray-600">
                                        <div className="flex items-center truncate"><History size={16} className="mr-3 text-gray-400 flex-shrink-0"/><span className="text-gray-800 truncate">{item}</span></div>
                                        <button onClick={(e) => handleDeleteHistory(item, e)} className="ml-4 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity flex-shrink-0" aria-label={`Hapus "${item}" dari riwayat`}><X size={16} className="text-gray-500"/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Filter and Info Section */}
                {!loading && hasAnyResults && (
                    <div className="mb-8 bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-600 text-center sm:text-left">
                                Ditemukan <strong>{totalResultsCount} hasil</strong> untuk <span className="font-semibold text-gray-800">"{query}"</span>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <label className="text-sm font-semibold text-gray-600 hidden sm:block">Kategori:</label>
                                 <select
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value)}
                                    className="w-full sm:w-56 p-2 pr-10 text-left bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                                >
                                    <option value="Semua">Semua</option>
                                    {results?.mahasiswa?.length > 0 && <option value="Mahasiswa">Mahasiswa</option>}
                                    {results?.dosen?.length > 0 && <option value="Dosen">Dosen</option>}
                                    {results?.pt?.length > 0 && <option value="Perguruan Tinggi">Perguruan Tinggi</option>}
                                    {results?.prodi?.length > 0 && <option value="Program Studi">Program Studi</option>}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Search Results */}
                <div className="space-y-16">
                    {loading && <div className="grid grid-cols-1 gap-5">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>}
                    {error && <p className="text-center text-red-500 p-4">{error}</p>}
                    
                    {!loading && !error && query && !hasAnyResults && (
                        <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-10 sm:p-16 rounded-xl flex flex-col items-center justify-center">
                            <FileX size={56} className="text-gray-300" />
                            <h3 className="mt-6 font-bold text-lg sm:text-xl text-gray-700">Tidak Ada Hasil Ditemukan</h3>
                            <p className="text-sm sm:text-base mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                        </div>
                    )}
                    
                    {!loading && hasAnyResults && (
                        <>
                            {(activeFilter === 'Semua' || activeFilter === 'Mahasiswa') && paginatedData.mahasiswa.data.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200 flex items-center gap-3"><GraduationCap className="text-blue-500" /> Mahasiswa ({results?.mahasiswa?.length})</h2>
                                    <div className="grid grid-cols-1 gap-5">
                                        {paginatedData.mahasiswa.data.map((mhs, index) => <MahasiswaCard key={mhs.id} mhs={mhs} index={index} />)}
                                    </div>
                                    <PaginationControls currentPage={pageState.mahasiswa} totalPages={paginatedData.mahasiswa.totalPages} onPageChange={(p) => handlePageChange('mahasiswa', p)} categoryName="Mahasiswa" />
                                </section>
                            )}
                             {(activeFilter === 'Semua' || activeFilter === 'Dosen') && paginatedData.dosen.data.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200 flex items-center gap-3"><User className="text-blue-500" /> Dosen ({results?.dosen?.length})</h2>
                                    <div className="grid grid-cols-1 gap-5">
                                        {paginatedData.dosen.data.map((dosen, index) => <DosenCard key={dosen.id} dosen={dosen} index={index} />)}
                                    </div>
                                     <PaginationControls currentPage={pageState.dosen} totalPages={paginatedData.dosen.totalPages} onPageChange={(p) => handlePageChange('dosen', p)} categoryName="Dosen" />
                                </section>
                            )}
                            {(activeFilter === 'Semua' || activeFilter === 'Perguruan Tinggi') && paginatedData.pt.data.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200 flex items-center gap-3"><School className="text-blue-500" /> Perguruan Tinggi ({results?.pt?.length})</h2>
                                    <div className="grid grid-cols-1 gap-5">
                                        {paginatedData.pt.data.map((pt, index) => <PtCard key={pt.id} pt={pt} index={index} />)}
                                    </div>
                                     <PaginationControls currentPage={pageState.pt} totalPages={paginatedData.pt.totalPages} onPageChange={(p) => handlePageChange('pt', p)} categoryName="Perguruan Tinggi" />
                                </section>
                            )}
                            {(activeFilter === 'Semua' || activeFilter === 'Program Studi') && paginatedData.prodi.data.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200 flex items-center gap-3"><BookOpen className="text-blue-500" /> Program Studi ({results?.prodi?.length})</h2>
                                    <div className="grid grid-cols-1 gap-5">
                                        {paginatedData.prodi.data.map((prodi, index) => <ProdiCard key={prodi.id} prodi={prodi} index={index} />)}
                                    </div>
                                     <PaginationControls currentPage={pageState.prodi} totalPages={paginatedData.prodi.totalPages} onPageChange={(p) => handlePageChange('prodi', p)} categoryName="Program Studi" />
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}