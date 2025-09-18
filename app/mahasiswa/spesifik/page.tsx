// app/mahasiswa/spesifik/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProdiSearchableSelect } from "@/app/components/ProdiSearchableSelect";
import { ProgramStudi } from "@/app/types";

export default function SpesifikPage() {
  const [nim, setNim] = useState("");
  const [selectedProdi, setSelectedProdi] = useState<ProgramStudi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!nim.trim() || !selectedProdi) {
      setError("NIM dan Perguruan Tinggi/Prodi harus diisi.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const params = new URLSearchParams({
        nim: nim,
        nama_prodi: selectedProdi.nama,
        nama_pt: selectedProdi.pt
      });
      
      const response = await fetch(`/api/mahasiswa/spesifik?${params.toString()}`);

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal terhubung ke server.");
      }
      
      const data = await response.json();

      if (data && data.id) {
        router.push(`/mahasiswa/detail/${encodeURIComponent(data.id)}`);
      } else {
        setNotFound(true);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };
  
  const breadcrumbItems = [
    { label: "Mahasiswa", href: "/mahasiswa" },
    { label: "Pencarian Spesifik" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800"
    >
      <main className="w-full max-w-xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="text-center mb-8 sm:mb-12">
          <Link href="/">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Pencarian <span className="text-blue-600">Spesifik</span>
            </h1>
          </Link>
          <p className="mt-4 text-base sm:text-lg text-gray-600">
            Temukan data mahasiswa secara akurat menggunakan NIM dan Perguruan Tinggi.
          </p>
        </header>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="nim" className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor Induk Mahasiswa (NIM)
              </label>
              <input
                id="nim"
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Masukkan NIM..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Perguruan Tinggi & Program Studi
              </label>
              <ProdiSearchableSelect
                value={selectedProdi}
                onChange={setSelectedProdi}
                placeholder="Cari & pilih prodi..."
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            
            {notFound && (
                <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">Mahasiswa tidak ditemukan. Pastikan NIM dan Prodi sudah benar.</span>
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Search size={20} className="mr-2" />
                  <span className="font-semibold">Cari Mahasiswa</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </motion.div>
  );
}