// lib/hooks/useSearchPage.ts
import { useState, useEffect, useMemo, FormEvent, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const RESULTS_PER_PAGE = 10;

interface UseSearchPageOptions<T> {
  historyKey: string;
  sortingFn: (a: T, b: T, sortBy: string) => number; 
}

export function useSearchPage<T>({ historyKey, sortingFn }: UseSearchPageOptions<T>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchKey = searchParams.get("key");

  const [query, setQuery] = useState<string>("");
  const [allResults, setAllResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(!!searchKey);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  
  const [filterPT, setFilterPT] = useState("Semua");
  const [filterProdi, setFilterProdi] = useState("Semua");
  const [filterJenjang, setFilterJenjang] = useState("Semua");
  const [sortBy, setSortBy] = useState("nama-asc");

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    const history = localStorage.getItem(historyKey);
    if (history) setSearchHistory(JSON.parse(history));
  }, [historyKey]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    const updatedHistory = [newQuery, ...searchHistory.filter((q) => q !== newQuery)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  const handleNewSearch = async (e?: FormEvent, historyQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = historyQuery || searchQuery;
    if (!finalQuery.trim()) return;

    updateSearchHistory(finalQuery);
    setIsSearchFocused(false);
    
    try {
      const response = await fetch('/api/search/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery }),
      });

      if (!response.ok) {
        throw new Error('Gagal memulai sesi pencarian.');
      }

      const { key, query: returnedQuery } = await response.json();

      sessionStorage.setItem(`search_query_${key}`, returnedQuery);

      const basePath = window.location.pathname;
      router.push(`${basePath}?key=${key}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    }
  };
  
  const handleDeleteHistory = (itemToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = searchHistory.filter((item) => item !== itemToDelete);
    setSearchHistory(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchKey) {
        setLoading(false);
        setAllResults([]);
        return;
      }

      // --- LOGIKA CACHE BARU (UNTUK REFRESH CEPAT) ---
      const cacheKey = `search_results_${searchKey}`;
      const cachedResults = sessionStorage.getItem(cacheKey);

      if (cachedResults) {
        const { data, query: cachedQuery } = JSON.parse(cachedResults);
        setAllResults(data);
        setQuery(cachedQuery);
        setLoading(false);
        return; // Hentikan eksekusi jika data dari cache ditemukan
      }
      // --- AKHIR LOGIKA CACHE ---

      setLoading(true);
      setError(null);
      setSuggestion(null);
      setFilterPT("Semua");
      setFilterProdi("Semua");
      setFilterJenjang("Semua");
      setCurrentPage(1);

      try {
        const path = window.location.pathname.split('/').pop() || 'search';
        
        const fallbackQuery = sessionStorage.getItem(`search_query_${searchKey}`);
        const url = `/api/${path}?key=${searchKey}${fallbackQuery ? `&fallback_q=${encodeURIComponent(fallbackQuery)}` : ''}`;

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Gagal terhubung ke server");

        const resultsData = Array.isArray(result.data) ? result.data : [];
        
        setAllResults(resultsData);
        setQuery(result.query);

        // --- SIMPAN HASIL KE CACHE SETELAH FETCH BERHASIL ---
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: resultsData, query: result.query }));

        if (fallbackQuery) {
          sessionStorage.removeItem(`search_query_${searchKey}`);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchKey]);

  // ... (sisa kode di hook ini tetap sama)
  const processedResults = useMemo(() => {
    return allResults
      .filter((item: any) => filterPT === "Semua" || item.nama_pt === filterPT || item.pt === filterPT)
      .filter((item: any) => filterProdi === "Semua" || item.nama_prodi === filterProdi)
      .filter((item: any) => filterJenjang === "Semua" || item.jenjang === filterJenjang)
      .sort((a, b) => sortingFn(a, b, sortBy));
  }, [allResults, filterPT, filterProdi, filterJenjang, sortBy, sortingFn]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    return processedResults.slice(startIndex, startIndex + RESULTS_PER_PAGE);
  }, [processedResults, currentPage]);
  
  const totalPages = Math.ceil(processedResults.length / RESULTS_PER_PAGE);

  return {
    query,
    loading,
    error,
    allResults,
    processedResults,
    paginatedResults,
    totalPages,
    currentPage,
    setCurrentPage,
    showFilters,
    setShowFilters,
    sortBy,
    setSortBy,
    filterPT,
    setFilterPT,
    filterProdi,
    setFilterProdi,
    filterJenjang,
    setFilterJenjang,
    searchQuery,
    setSearchQuery,
    handleNewSearch,
    searchHistory,
    isSearchFocused,
    setIsSearchFocused,
    searchInputRef,
    searchWrapperRef,
    handleDeleteHistory,
    showBackToTop,
    suggestion
  };
}