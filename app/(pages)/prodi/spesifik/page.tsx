// app/(pages)/prodi/spesifik/page.tsx
"use client";

import { useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  AlertCircle,
  University,
  X,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { motion, AnimatePresence } from "framer-motion";
import { PtSearchableSelect } from "@/components/search/PtSearchableSelect";
import { ProdiByPtSearchableSelect } from "@/components/search/ProdiByPtSearchableSelect";
import { PerguruanTinggi, ProgramStudi } from "@/lib/types";

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
            icon={<University size={18} />}
            title="1. Pilih Perguruan Tinggi"
            description="Ketik nama perguruan tinggi untuk memfilter pilihan."
          />
          <InstructionStep
            icon={<BookOpen size={18} />}
            title="2. Pilih Program Studi"
            description="Setelah memilih PT, pilih program studi yang tersedia."
          />
        </ul>
      </div>
    </motion.div>
  </motion.div>
);

export default function SpesifikPage() {
  const [selectedPt, setSelectedPt] = useState<PerguruanTinggi | null>(null);
  const [selectedProdi, setSelectedProdi] = useState<ProgramStudi | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPt || !selectedProdi) {
      setError("Semua field harus diisi.");
      return;
    }

    // Tidak perlu async/await; langsung navigasi lalu reset state submit
    setSubmitting(true);
    router.push(`/prodi/detail/${encodeURIComponent(selectedProdi.id)}`);
    // opsional: jika ingin menjaga UX saat transisi lambat:
    setTimeout(() => setSubmitting(false), 1200);
  };

  const breadcrumbItems = [
    { label: "Program Studi", href: "/prodi" },
    { label: "Pencarian Spesifik" },
  ];

  return (
    <>
      <AnimatePresence>
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

          {/* Header: dibiarkan apa adanya (style tidak diubah) */}
          <header className="text-center my-8 sm:my-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Pencarian <span className="text-blue-600">Spesifik</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Gunakan pencarian ini untuk memastikan data yang ditemukan adalah
              milik program studi yang dituju demi hasil yang akurat.
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
                    Masukkan Detail Program Studi
                  </h2>
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

                {/* Prodi */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Program Studi
                  </label>
                  <ProdiByPtSearchableSelect
                    value={selectedProdi}
                    onChange={setSelectedProdi}
                    selectedPt={selectedPt}
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
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Search size={18} />
                        <span>Cari Program Studi</span>
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
