// app/(pages)/pt/PtPageClient.tsx
'use client';

import Link from "next/link";
import { PerguruanTinggi } from "@/lib/types";
import { PtCard } from "@/components/cards/PtCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useSearchPage } from "@/lib/hooks/useSearchPage";
import { SearchBar } from "@/components/search/SearchBar";
import { Pagination } from "@/components/search/Pagination";
import { NoResults } from "@/components/search/NoResults";
import { ErrorDisplay } from "@/components/search/ErrorDisplay"; // <-- Impor komponen baru
import {
    ArrowUp
} from "lucide-react";
import { motion } from "framer-motion";

const sortingFn = (a: PerguruanTinggi, b: PerguruanTinggi, sortBy: string) => {
    if (sortBy === 'nama-asc') return a.nama.localeCompare(b.nama);
    if (sortBy === 'nama-desc') return b.nama.localeCompare(a.nama);
    if (sortBy === 'kode-asc') return a.kode.localeCompare(b.kode);
    if (sortBy === 'kode-desc') return b.kode.localeCompare(a.kode);
    return 0;
};

export default function PtPageClient() {
    const hookProps = useSearchPage<PerguruanTinggi>({
        historyKey: "pddikti_pt_history",
        sortingFn,
    });

    const {
        query, loading, error, paginatedResults, totalPages, currentPage, setCurrentPage,
        sortBy, setSortBy, showBackToTop, allResults, processedResults
    } = hookProps;

    const breadcrumbItems = [{ label: "Perguruan Tinggi" }];

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
                            Pencarian <span className="text-blue-600">Perguruan Tinggi</span>
                        </h1>
                    </Link>
                    <p className="mt-4 text-base sm:text-lg text-gray-600">
                        Cari informasi perguruan tinggi di Indonesia menggunakan nama atau kodenya.
                    </p>
                </header>

                <SearchBar
                    {...hookProps}
                    placeholder="Ketik nama atau kode PT..."
                />

                {!loading && allResults.length > 0 && (
                     <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="text-sm text-gray-600 text-center sm:text-left">
                            Ditemukan <strong>{processedResults.length} hasil</strong> untuk <span className="font-semibold text-gray-800">"{query}"</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-semibold">
                                <option value="nama-asc">Nama (A-Z)</option>
                                <option value="nama-desc">Nama (Z-A)</option>
                                <option value="kode-asc">Kode (Asc)</option>
                                <option value="kode-desc">Kode (Desc)</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5">
                    {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}

                    {/* --- PERUBAHAN DI SINI --- */}
                    {!loading && error && <ErrorDisplay message={error} />}
                    
                    {!loading && !error && processedResults.length === 0 && (
                        <NoResults query={query} />
                    )}
                    {!loading && !error && paginatedResults.map((pt, index) => <PtCard key={(pt as any).id} pt={pt} index={index} />)}
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
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110" style={{ animation: 'fadeInUp 0.5s ease-out' }}><ArrowUp size={24} /></button>
            )}
        </motion.div>
    );
}