'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileX, ArrowUp, Search, History, Loader2, X, BookOpen } from 'lucide-react';
import { ProgramStudi } from '@/app/types';
import { ProdiCard } from '@/app/components/ProdiCard';
import { SkeletonCard } from '@/app/components/SkeletonCard';
import Link from 'next/link';

export default function ProdiPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<ProgramStudi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState(query);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchQuery(query);
    }, [query]);

    useEffect(() => {
        const history = localStorage.getItem('pddikti_prodi_history');
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
        localStorage.setItem('pddikti_prodi_history', JSON.stringify(updatedHistory));
    };

    const handleNewSearch = (e?: FormEvent, historyQuery?: string) => {
        if (e) e.preventDefault();
        const finalQuery = historyQuery || searchQuery;
        if (!finalQuery.trim() || finalQuery === query) return;

        updateSearchHistory(finalQuery);
        setIsSearchFocused(false);
        router.push(`/prodi?q=${encodeURIComponent(finalQuery)}`);
    };

    const handleDeleteHistory = (itemToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedHistory = searchHistory.filter(item => item !== itemToDelete);
        setSearchHistory(updatedHistory);
        localStorage.setItem('pddikti_prodi_history', JSON.stringify(updatedHistory));
    };

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setLoading(false);
                setResults([]);
                return;
            };

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/prodi?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Gagal terhubung ke server');
                
                setResults(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);
    
    return (
        <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800">
            <main className="w-full max-w-4xl mx-auto">
                <header className="text-center my-12">
                    <Link href="/">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                            Pencarian <span className="text-blue-600">Program Studi</span>
                        </h1>
                    </Link>
                    <p className="mt-4 text-lg text-gray-600">
                        Masukkan nama program studi untuk memulai.
                    </p>
                </header>
                
                <div ref={searchWrapperRef} className="w-full mb-8 sticky top-6 z-20">
                    <form onSubmit={handleNewSearch} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400"><Search size={20} /></div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder="Cari program studi..."
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
                {!loading && results.length > 0 && (
                    <div className="text-sm text-gray-600 mb-4">
                        Ditemukan <strong>{results.length} hasil</strong> untuk <span className="font-semibold text-gray-800">"{query}"</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5">
                    {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                    {error && <p className="text-center text-red-500 p-4">{error}</p>}

                    {!loading && !error && !query && (
                        <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-16 rounded-xl flex flex-col items-center justify-center">
                            <BookOpen size={56} className="text-gray-300"/><h3 className="mt-6 font-bold text-xl text-gray-700">Mulai Pencarian Prodi</h3><p className="text-base mt-1">Gunakan kotak pencarian di atas.</p>
                        </div>
                    )}
                    {!loading && !error && query && results.length === 0 && (
                        <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-16 rounded-xl flex flex-col items-center justify-center">
                            <FileX size={56} className="text-gray-300"/><h3 className="mt-6 font-bold text-xl text-gray-700">Tidak Ada Hasil Ditemukan</h3><p className="text-base mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                        </div>
                    )}
                    {!loading && results.map((prodi, index) => <ProdiCard key={prodi.id} prodi={prodi} index={index} />)}
                </div>

            </main>

            {showBackToTop && (
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110" style={{ animation: 'fadeInUp 0.5s ease-out' }}><ArrowUp size={24} /></button>
            )}
        </div>
    );
}