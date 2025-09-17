'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { Search, History, X } from 'lucide-react';
import { useRouter } from 'next/navigation';


const Kbd = ({ children }: { children: React.ReactNode }) => <kbd className="px-2 py-1.5 text-xs font-mono font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg">{children}</kbd>;

export default function Home() {
    const [query, setQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

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

        updateSearchHistory(finalQuery);
        router.push(`/mahasiswa?q=${encodeURIComponent(finalQuery)}`);
    };
    
    const handleDeleteHistory = (itemToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation(); 
        const updatedHistory = searchHistory.filter(item => item !== itemToDelete);
        setSearchHistory(updatedHistory);
        localStorage.setItem('pddikti_search_history', JSON.stringify(updatedHistory));
    };

    return (
        <>
            <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800">
                <main className="w-full max-w-3xl mx-auto">
                    <header className="text-center my-20">
                        {/* Menggunakan text-blue-500 untuk warna yang lebih soft */}
                        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-gray-900">Pangkalan Data <span className="text-blue-500">Pendidikan Tinggi</span></h1>
                        <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto">
                            Akses cepat dan mudah ke data mahasiswa, dosen, dan perguruan tinggi di seluruh Indonesia.
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
                            <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                <p className="p-4 text-sm font-semibold text-gray-500 border-b-2 border-gray-200">Riwayat Pencarian</p>
                                <ul className="max-h-80 overflow-y-auto">
                                {searchHistory.map(item => (
                                    <li key={item} onClick={() => handleSearch(undefined, item)} className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors text-base text-gray-600">
                                        <div className="flex items-center truncate">
                                            <History size={18} className="mr-4 flex-shrink-0"/>
                                            <span className="text-gray-800 truncate">{item}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteHistory(item, e)}
                                            className="ml-4 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity flex-shrink-0"
                                            aria-label={`Hapus "${item}" dari riwayat`}
                                        >
                                            <X size={16} className="text-gray-500"/>
                                        </button>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="text-center mt-28 mb-8 text-sm text-gray-500/80">
                    <p>Sebuah proyek independen untuk memudahkan akses data PDDIKTI Kemdiktisaintek.</p>
                </footer>
            </div>
        </>
    );
}