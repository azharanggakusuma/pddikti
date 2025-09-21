// app/mahasiswa/spesifik/page.tsx
"use client";

import { useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, AlertCircle, Hash, BookOpen, CheckCircle, University, X, User, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { motion, AnimatePresence } from "framer-motion";
import { PtSearchableSelect } from "@/app/components/PtSearchableSelect";
import { ProdiByPtSearchableSelect } from "@/app/components/ProdiByPtSearchableSelect";
import { ProgramStudi, PerguruanTinggi, Mahasiswa } from "@/app/types";

// --- POPUP COMPONENT (REDESIGNED) ---
const ResultPopup = ({ mahasiswa, onConfirm, onCancel }: { mahasiswa: Mahasiswa, onConfirm: () => void, onCancel: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
            {/* --- Header with Gradient --- */}
            <div className="relative p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-center">
                 <button
                  type="button"
                  onClick={onCancel}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                  aria-label="Tutup"
                >
                  <X size={24} />
                </button>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 border-2 border-white/50 mb-4"
                >
                    <CheckCircle size={40} strokeWidth={2.5} />
                </motion.div>
                <h2 className="text-3xl font-bold">
                  Data Ditemukan
                </h2>
                <p className="mt-1 opacity-80">Informasi mahasiswa yang cocok telah ditemukan.</p>
            </div>
            
            <div className="p-8">
                {/* --- INFORMASI MAHASISWA --- */}
                <div className="space-y-4 text-left">
                    <div className="flex items-start gap-4">
                        <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-500">Nama Mahasiswa</p>
                            <p className="font-semibold text-gray-800 text-lg">{mahasiswa.nama}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Hash className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-500">NIM</p>
                            <p className="font-semibold text-gray-800 text-lg">{mahasiswa.nim}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <University className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-500">Perguruan Tinggi</p>
                            <p className="font-semibold text-gray-800 text-lg">{mahasiswa.nama_pt}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <BookOpen className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-500">Program Studi</p>
                            <p className="font-semibold text-gray-800 text-lg">{mahasiswa.nama_prodi}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full group px-6 h-14 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <span>Lihat Detail Lengkap</span>
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={20} />
                  </button>
                </div>
            </div>
        </motion.div>
    </motion.div>
);


// Helper component for the instruction steps
const InstructionStep = ({ icon, title, description }: { icon: ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-gray-200/80">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
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
  const [selectedPt, setSelectedPt] = useState<PerguruanTinggi | null>(null);
  const [selectedProdi, setSelectedProdi] = useState<ProgramStudi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searchResult, setSearchResult] = useState<Mahasiswa | null>(null);
  const router = useRouter();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotFound(false);
    setSearchResult(null);

    if (!nim.trim() || !selectedProdi || !selectedPt) {
      setError("Semua field harus diisi.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        nim: nim.trim(),
        nama_prodi: selectedProdi.nama,
        nama_pt: selectedPt.nama
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
        setSearchResult(data);
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
    <>
      <AnimatePresence>
        {searchResult && (
          <ResultPopup 
            mahasiswa={searchResult}
            onConfirm={() => router.push(`/mahasiswa/detail/${encodeURIComponent(searchResult.id)}`)}
            onCancel={() => setSearchResult(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800 overflow-hidden"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] bg-gradient-to-tr from-blue-200/40 via-cyan-100/40 to-sky-200/40 rounded-full blur-3xl -z-10"
        ></div>

        <main className="w-full max-w-2xl mx-auto z-10">
          <Breadcrumbs items={breadcrumbItems} />
          
          <header className="text-center my-8 sm:my-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Pencarian <span className="text-blue-600">Spesifik</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              Gunakan pencarian ini untuk memastikan data yang ditemukan adalah milik mahasiswa yang dituju demi hasil yang akurat.
            </p>
          </header>

          <div className="mb-8 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 text-center">Cara Penggunaan</h3>
              <InstructionStep icon={<Hash size={20} />} title="1. Masukkan NIM" description="Isi Nomor Induk Mahasiswa yang akan dicari." />
              <InstructionStep icon={<University size={20} />} title="2. Pilih Perguruan Tinggi" description="Ketik nama perguruan tinggi untuk memfilter pilihan." />
              <InstructionStep icon={<BookOpen size={20} />} title="3. Pilih Program Studi" description="Setelah memilih PT, program studi yang tersedia akan muncul." />
            </div>

          <motion.div 
              className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-300/30 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-8 sm:p-10">
                <form onSubmit={handleSearch} className="flex flex-col h-full">
                  <div className="flex-grow space-y-6">
                     <h2 className="text-xl font-bold text-gray-800">Masukkan Detail Mahasiswa</h2>
                     <div className="space-y-4">
                         <div className="space-y-2">
                              <label htmlFor="nim" className="text-sm font-semibold text-gray-700">
                                Nomor Induk Mahasiswa (NIM)
                              </label>
                              <div className="relative">
                                  <Hash size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${nim.trim() ? 'text-blue-600' : 'text-gray-400'}`} />
                                  <input
                                      id="nim"
                                      type="text"
                                      value={nim}
                                      onChange={(e) => setNim(e.target.value)}
                                      placeholder="Contoh: A11.2020.12345"
                                      className="w-full h-12 pl-11 pr-4 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                                      required
                                  />
                              </div>
                          </div>
                         <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                              Perguruan Tinggi
                              </label>
                              <PtSearchableSelect
                                  value={selectedPt}
                                  onChange={setSelectedPt}
                                  placeholder="Ketik untuk mencari PT..."
                              />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Program Studi
                          </label>
                          <ProdiByPtSearchableSelect
                              value={selectedProdi}
                              onChange={setSelectedProdi}
                              selectedPt={selectedPt}
                          />
                        </div>
                     </div>
                    
                    <div className="!mt-6 space-y-4">
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
                        className="w-full px-5 h-12 text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                               <Search size={18} />
                               <span>Cari Mahasiswa</span>
                            </div>
                        )}
                    </button>
                  </div>
                </form>
              </div>
          </motion.div>
        </main>
      </motion.div>
    </>
  );
}