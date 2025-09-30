// app/(pages)/dosen/spesifik/page.tsx
"use client";

import { useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  AlertCircle,
  Hash,
  BookOpen,
  CheckCircle,
  University,
  X,
  User,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { motion, AnimatePresence } from "framer-motion";
import { PtSearchableSelect } from "@/components/search/PtSearchableSelect";
import { PerguruanTinggi, Dosen } from "@/lib/types";

/* ===========================
   Result Popup (rapi)
   =========================== */
const ResultPopup = ({
  dosen,
  onConfirm,
  onCancel,
  isLoading,
}: {
  dosen: Dosen;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 p-4"
    aria-modal="true"
    role="dialog"
  >
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.98, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
    >
      {/* Header */}
      <div className="relative p-6 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700" />
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
            <CheckCircle size={30} />
          </div>
          <h2 className="text-xl font-semibold">Data Ditemukan</h2>
          <p className="mt-1 text-sm text-white/90">
            Informasi dosen yang cocok telah ditemukan.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <ul className="grid gap-3">
          <li className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500">Nama Dosen</p>
              <p className="text-sm font-semibold text-gray-900">{dosen.nama}</p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500">NIDN</p>
              <p className="text-sm font-semibold text-gray-900">{dosen.nidn}</p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <University className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500">Perguruan Tinggi</p>
              <p className="text-sm font-semibold text-gray-900">{dosen.nama_pt}</p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500">Program Studi</p>
              <p className="text-sm font-semibold text-gray-900">{dosen.nama_prodi}</p>
            </div>
          </li>
        </ul>

        <div className="mt-6">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-wait disabled:bg-blue-400"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Lihat Detail Lengkap</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

/* ===========================
   Instruction Modal (rapi)
   =========================== */
const InstructionStep = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <li className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="mt-0.5 text-sm text-gray-600">{description}</p>
    </div>
  </li>
);

const InstructionModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[50] flex items-center justify-center bg-gray-900/50 p-4"
    onClick={onClose}
    aria-modal="true"
    role="dialog"
  >
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.98, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="text-base font-bold text-gray-900">Cara Penggunaan</h3>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-5">
        <ul className="grid gap-3">
          <InstructionStep
            icon={<Hash size={18} />}
            title="1. Masukkan NIDN"
            description="Isi Nomor Induk Dosen Nasional yang akan dicari."
          />
          <InstructionStep
            icon={<University size={18} />}
            title="2. Pilih Perguruan Tinggi"
            description="Ketik nama perguruan tinggi untuk memfilter pilihan."
          />
        </ul>
      </div>
    </motion.div>
  </motion.div>
);

export default function SpesifikPage() {
  const [nidn, setNidn] = useState("");
  const [selectedPt, setSelectedPt] = useState<PerguruanTinggi | null>(null); // ✅ tipe benar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searchResult, setSearchResult] = useState<Dosen | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotFound(false);
    setSearchResult(null);

    if (!nidn.trim() || !selectedPt) {
      setError("Semua field harus diisi.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        nidn: nidn.trim(),
        nama_pt: selectedPt.nama,
      });

      const response = await fetch(`/api/dosen/spesifik?${params.toString()}`);

      if (response.status === 404) {
        setNotFound(true);
      } else if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Gagal terhubung ke server.");
      } else {
        const data = await response.json();
        if (data && data.id) setSearchResult(data);
        else setNotFound(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dosen", href: "/dosen" },
    { label: "Pencarian Spesifik" },
  ];

  return (
    <>
      <AnimatePresence>
        {searchResult && (
          <ResultPopup
            dosen={searchResult}
            isLoading={isRedirecting}
            onConfirm={() => {
              setIsRedirecting(true);
              router.push(`/dosen/detail/${encodeURIComponent(searchResult.id)}`);
            }}
            onCancel={() => setSearchResult(null)}
          />
        )}
        {isInstructionModalOpen && (
          <InstructionModal onClose={() => setIsInstructionModalOpen(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="relative min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-8"
      >
        {/* Subtle top gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-blue-100/50 to-transparent" />

        <main className="mx-auto w-full max-w-2xl">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Header: stylenya dibiarkan sama */}
          <header className="text-center my-8 sm:my-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Pencarian <span className="text-blue-600">Spesifik</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Gunakan pencarian ini untuk memastikan data yang ditemukan adalah milik dosen yang dituju demi hasil yang akurat.
            </p>
          </header>

          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => setIsInstructionModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:px-4 sm:text-sm"
            >
              <HelpCircle size={16} />
              Lihat Cara Penggunaan
            </button>
          </div>

          <motion.section
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="p-5 sm:p-7">
              <form onSubmit={handleSearch} className="grid gap-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Masukkan Detail Dosen
                  </h2>
                </div>

                {/* NIDN */}
                <div className="grid gap-2">
                  <label htmlFor="nidn" className="text-sm font-medium text-gray-700">
                    Nomor Induk Dosen Nasional (NIDN)
                  </label>
                  <div className="relative">
                    <Hash
                      size={18}
                      className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                        nidn.trim() ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <input
                      id="nidn"
                      type="text"
                      value={nidn}
                      onChange={(e) => setNidn(e.target.value)}
                      placeholder="Contoh: 0012345678"
                      className="h-11 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:h-12 sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* PT */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Perguruan Tinggi
                  </label>
                  <PtSearchableSelect
                    value={selectedPt}
                    onChange={setSelectedPt}
                    placeholder="Ketik untuk mencari PT..."
                  />
                </div>

                {/* Alerts */}
                <div className="grid gap-3">
                  {error && (
                    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}
                  {notFound && (
                    <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">
                        Dosen tidak ditemukan. Periksa kembali data Anda.
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Search size={18} />
                        <span>Cari Dosen</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        </main>
      </motion.div>
    </>
  );
}
