// app/prodi/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { useMemo } from "react";
import Link from "next/link";
import { ProgramStudi } from "@/lib/types";
import { ProdiCard } from "@/components/ProdiCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useSearchPage } from "@/lib/hooks/useSearchPage";
import {
    FileX, ArrowUp, ChevronLeft, ChevronRight, Search, History,
    Loader2, X, SlidersHorizontal, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

const sortingFn = (a: ProgramStudi, b: ProgramStudi, sortBy: string) => {
    if (sortBy === "nama-asc") return a.nama.localeCompare(b.nama);
    if (sortBy === "nama-desc") return b.nama.localeCompare(a.nama);
    return 0;
};

export default function ProdiPage() {
    const {
        query, loading, error, paginatedResults, totalPages, currentPage, setCurrentPage, showFilters, setShowFilters,
        sortBy, setSortBy, filterPT, setFilterPT, filterJenjang, setFilterJenjang, searchQuery, setSearchQuery,
        handleNewSearch, searchHistory, isSearchFocused, setIsSearchFocused, searchInputRef, searchWrapperRef, handleDeleteHistory,
        showBackToTop, allResults, processedResults
    } = useSearchPage<ProgramStudi>({
        historyKey: "pddikti_prodi_history",
        sortingFn,
    });

    const uniquePT = useMemo(() => ["Semua", ...new Set(allResults.map((prodi) => prodi.pt))], [allResults]);
    const uniqueJenjang = useMemo(() => ["Semua", ...new Set(allResults.map((prodi) => prodi.jenjang))], [allResults]);
    const breadcrumbItems = [{ label: "Program Studi" }];
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800"
        >
            <main className="w-full max-w-4xl mx-auto">
                <Breadcrumbs items={breadcrumbItems} />
                <header className="text-center mb-8 sm:mb-12">
                    <Link href="/">
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                            Pencarian <span className="text-blue-600">Program Studi</span>
                        </h1>
                    </Link>
                    <p className="mt-4 text-base sm:text-lg text-gray-600">
                        Jelajahi program studi di seluruh Indonesia berdasarkan nama atau kampusnya.
                    </p>
                </header>

                <div ref={searchWrapperRef} className="w-full mb-8 sticky top-4 sm:top-6 z-20">
                  <form onSubmit={handleNewSearch} className="w-full bg-white rounded-xl shadow-sm border border-gray-200/80 transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 overflow-hidden">
                    <div className="flex items-center w-full">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          placeholder="Ketik nama prodi atau PT..."
                          className="w-full pl-5 pr-2 py-4 bg-transparent focus:outline-none text-base text-gray-800 placeholder-gray-500 truncate"
                        />
                        <button
                          type="submit"
                          disabled={
                            loading || !searchQuery.trim() || searchQuery === query
                          }
                          className="mr-2 ml-1 px-4 sm:px-5 h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
                          aria-label="Cari"
                        >
                          {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <>
                              <Search size={20} className="sm:mr-2"/>
                              <span className="hidden sm:inline font-semibold">Cari</span>
                            </>
                          )}
                        </button>
                    </div>
                  </form>
                  {isSearchFocused && searchHistory.length > 0 && (
                    <div
                      className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20"
                      style={{ animation: "fadeInUp 0.3s ease-out" }}
                    >
                      <p className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">
                        Riwayat Pencarian
                      </p>
                      <ul className="max-h-80 overflow-y-auto">
                        {searchHistory.map((item) => (
                          <li
                            key={item}
                            onClick={() => handleNewSearch(undefined, item)}
                            className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors text-sm text-gray-600"
                          >
                            <div className="flex items-center truncate">
                              <History
                                size={16}
                                className="mr-3 text-gray-400 flex-shrink-0"
                              />
                              <span className="text-gray-800 truncate">{item}</span>
                            </div>
                            <button
                              onClick={(e) => handleDeleteHistory(item, e)}
                              className="ml-4 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity flex-shrink-0"
                              aria-label={`Hapus "${item}" dari riwayat`}
                            >
                              <X size={16} className="text-gray-500" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {!loading && allResults.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                      <div className="text-sm text-gray-600 text-center sm:text-left">
                        Ditemukan <strong>{processedResults.length} hasil</strong> untuk{" "}
                        <span className="font-semibold text-gray-800">"{query}"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold border rounded-lg transition-colors ${
                            showFilters
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <SlidersHorizontal size={16} />
                          Filter
                        </button>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-semibold"
                        >
                          <option value="nama-asc">Nama (A-Z)</option>
                          <option value="nama-desc">Nama (Z-A)</option>
                        </select>
                      </div>
                    </div>

                    {showFilters && (
                      <div
                        className="bg-white p-4 rounded-xl border border-gray-200 mb-4"
                        style={{ animation: "fadeInUp 0.3s ease-out" }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500">
                              Perguruan Tinggi
                            </label>
                            <div className="mt-1">
                              <SearchableSelect
                                iconType="university"
                                options={uniquePT}
                                value={filterPT}
                                onChange={(value) => {
                                  setFilterPT(value);
                                  setCurrentPage(1);
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500">
                              Jenjang
                            </label>
                            <div className="mt-1">
                              <SearchableSelect
                                iconType="prodi"
                                options={uniqueJenjang}
                                value={filterJenjang}
                                onChange={(value) => {
                                  setFilterJenjang(value);
                                  setCurrentPage(1);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5">
                  {loading &&
                    Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                  {error && <p className="text-center text-red-500 p-4">{error}</p>}

                  {!loading && !error && !query && (
                    <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-10 sm:p-16 rounded-xl flex flex-col items-center justify-center">
                      <BookOpen size={56} className="text-gray-300" />
                      <h3 className="mt-6 font-bold text-lg sm:text-xl text-gray-700">
                        Mulai Pencarian Prodi
                      </h3>
                      <p className="text-sm sm:text-base mt-1">Gunakan kotak pencarian di atas.</p>
                    </div>
                  )}
                  {!loading && !error && query && processedResults.length === 0 && (
                    <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-10 sm:p-16 rounded-xl flex flex-col items-center justify-center">
                      <FileX size={56} className="text-gray-300" />
                      <h3 className="mt-6 font-bold text-lg sm:text-xl text-gray-700">
                        Tidak Ada Hasil Ditemukan
                      </h3>
                      <p className="text-sm sm:text-base mt-1">
                        Coba sesuaikan filter atau kata kunci pencarian Anda.
                      </p>
                    </div>
                  )}
                  {!loading &&
                    paginatedResults.map((prodi, index) => (
                      <ProdiCard key={(prodi as any).id} prodi={prodi} index={index} />
                    ))}
                </div>
                
                {!loading && totalPages > 1 && (
                     <div className="mt-8 flex justify-between items-center">
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-400 transition-colors"><ChevronLeft size={20} /></button>
                        <span className="text-gray-600 text-sm">Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong></span>
                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-400 transition-colors"><ChevronRight size={20} /></button>
                    </div>
                )}
            </main>

            {showBackToTop && (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
                  style={{ animation: "fadeInUp 0.5s ease-out" }}
                >
                    <ArrowUp size={24} />
                </button>
            )}
        </motion.div>
    );
}