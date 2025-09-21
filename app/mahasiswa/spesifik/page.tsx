// app/mahasiswa/spesifik/page.tsx
"use client";

import { useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, AlertCircle, Hash, BookOpen, CheckCircle } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { motion } from "framer-motion";
import { ProdiSearchableSelect } from "@/app/components/ProdiSearchableSelect";
import { ProgramStudi } from "@/app/types";

// Helper component for the instruction steps
const InstructionStep = ({ icon, title, description }: { icon: ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-white text-blue-600 border border-gray-200 shadow-sm">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
    </div>
);

export default function SpesifikPage() {
  const [nim, setNim] = useState("");
  const [selectedProdi, setSelectedProdi] = useState<ProgramStudi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotFound(false);

    if (!nim.trim() || !selectedProdi) {
      setError("NIM dan Program Studi harus diisi.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        nim: nim.trim(),
        nama_prodi: selectedProdi.nama,
        nama_pt: selectedProdi.pt
      });
      
      const response = await fetch(`/api/mahasiswa/spesifik?${params.toString()}`);

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal terhubung ke server.");
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
      className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center antialiased bg-gray-50 text-gray-800"
    >
      <main className="w-full max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-4 bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-200/40 overflow-hidden">
          <div className="grid md:grid-cols-2">
            
            {/* Kolom Kiri - Informasi */}
            <div className="p-8 sm:p-10 bg-gray-50/70 border-b md:border-b-0 md:border-r border-gray-200/80">
                <div className="flex items-center gap-4">
                    <CheckCircle className="text-blue-600" size={32}/>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                           Pencarian Paling Akurat
                        </h1>
                        <p className="text-sm text-gray-500">Dapatkan hasil tunggal dan presisi.</p>
                    </div>
                </div>
                <p className="mt-6 text-base text-gray-600">
                    Gunakan pencarian ini untuk memastikan data yang ditemukan adalah milik mahasiswa yang dituju.
                </p>
                <div className="mt-8 pt-6 border-t border-gray-200/80 space-y-6">
                   <InstructionStep 
                        icon={<Hash size={20} />} 
                        title="1. Masukkan NIM"
                        description="Gunakan Nomor Induk Mahasiswa yang valid dan lengkap."
                   />
                    <InstructionStep 
                        icon={<BookOpen size={20} />} 
                        title="2. Pilih Program Studi"
                        description="Ketik untuk mencari Perguruan Tinggi dan Program Studi."
                   />
                     <InstructionStep 
                        icon={<Search size={20} />} 
                        title="3. Mulai Pencarian"
                        description="Klik tombol cari untuk melihat hasil spesifik."
                   />
                </div>
            </div>

            {/* Kolom Kanan - Form */}
            <div className="p-8 sm:p-10">
              <form onSubmit={handleSearch} className="flex flex-col h-full">
                <div className="flex-grow space-y-6">
                   <h2 className="text-lg font-semibold text-gray-800">Masukkan Detail Mahasiswa</h2>
                  <div className="space-y-2">
                    <label htmlFor="nim" className="text-sm font-semibold text-gray-700">
                      Nomor Induk Mahasiswa (NIM)
                    </label>
                    <input
                        id="nim"
                        type="text"
                        value={nim}
                        onChange={(e) => setNim(e.target.value)}
                        placeholder="Contoh: 11223344"
                        className="w-full h-12 px-4 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Perguruan Tinggi & Program Studi
                    </label>
                    <ProdiSearchableSelect
                        value={selectedProdi}
                        onChange={setSelectedProdi}
                        placeholder="Ketik nama prodi atau PT..."
                    />
                  </div>
                  
                  <div className="!mt-4 space-y-4">
                      {error && (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-center gap-3 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                            <AlertCircle className="flex-shrink-0" size={20} />
                            <span className="text-sm font-medium">{error}</span>
                        </motion.div>
                      )}
                      {notFound && (
                          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-center gap-3 text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <AlertCircle className="flex-shrink-0" size={20} />
                              <span className="text-sm font-medium">Mahasiswa tidak ditemukan. Periksa kembali data Anda.</span>
                          </motion.div>
                      )}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-5 h-12 text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed group"
                  >
                      {loading ? (
                          <Loader2 size={20} className="animate-spin" />
                      ) : (
                          <>
                          <Search size={18} className="mr-2" />
                          Cari Mahasiswa
                          </>
                      )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}