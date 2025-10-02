// app/(pages)/prodi/ProdiPageClient.tsx
'use client';

import { useMemo } from "react";
import Link from "next/link";
import { ProgramStudi } from "@/lib/types";
import { ProdiCard } from "@/components/cards/ProdiCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { SearchableSelect } from "@/components/search/SearchableSelect";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useSearchPage } from "@/lib/hooks/useSearchPage";
import { SearchBar } from "@/components/search/SearchBar";
import { Pagination } from "@/components/search/Pagination";
import { NoResults } from "@/components/search/NoResults";
import { ErrorDisplay } from "@/components/search/ErrorDisplay"; // <-- Impor komponen baru
import {
    ArrowUp, SlidersHorizontal, UserCheck
} from "lucide-react";
import { motion } from "framer-motion";

const sortingFn = (a: ProgramStudi, b: ProgramStudi, sortBy: string) => {
    if (sortBy === "nama-asc") return a.nama.localeCompare(b.nama);
    if (sortBy === "nama-desc") return b.nama.localeCompare(a.nama);
    return 0;
};

export default function ProdiPageClient() {
    const hookProps = useSearchPage<ProgramStudi>({
        historyKey: "pddikti_prodi_history",
        sortingFn,
    });

    const {
        query, loading, error, paginatedResults, totalPages, currentPage, setCurrentPage, showFilters, setShowFilters,
        sortBy, setSortBy, filterPT, setFilterPT, filterJenjang, setFilterJenjang,
        handleNewSearch, showBackToTop, allResults, processedResults
    } = hookProps;

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

                <SearchBar
                    {...hookProps}
                    placeholder="Ketik nama prodi atau PT..."
                />
                
                <div className="text-center mb-8">
                    <Link href="/prodi/spesifik" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 group transition-colors">
                        <UserCheck size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span>Butuh hasil lebih akurat? Coba <strong>Pencarian Spesifik</strong></span>
                    </Link>
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
                    {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                    
                    {/* --- PERUBAHAN DI SINI --- */}
                    {!loading && error && <ErrorDisplay message={error} />}

                    {!loading && !error && processedResults.length === 0 && (
                        <NoResults query={query} />
                    )}
                    {!loading && !error &&
                        paginatedResults.map((prodi, index) => (
                            <ProdiCard key={(prodi as any).id} prodi={prodi} index={index} />
                        ))}
                </div>

                {!loading && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
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