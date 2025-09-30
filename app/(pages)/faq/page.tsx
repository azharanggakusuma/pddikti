// app/(pages)/faq/page.tsx
"use client";

import { useId, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { motion, AnimatePresence } from "framer-motion";

const faqItems = [
  {
    question: "Apakah data di situs ini akurat dan resmi?",
    answer:
      "Data kami bersumber langsung dari API publik yang mengambil informasi dari PDDikti. Meskipun kami berusaha menyajikan data seakurat mungkin, situs resmi PDDikti tetap menjadi satu-satunya sumber kebenaran. Situs ini bersifat sebagai alat bantu pencarian alternatif.",
  },
  {
    question: "Seberapa sering data diperbarui?",
    answer:
      "Pembaruan data bergantung sepenuhnya pada API publik yang kami gunakan dan sinkronisasinya dengan database PDDikti. Kami tidak melakukan pembaruan data secara manual.",
  },
  {
    question: "Mengapa saya tidak bisa menemukan data mahasiswa/dosen yang saya cari?",
    answer:
      "Ada beberapa kemungkinan: (1) Kata kunci yang Anda masukkan kurang spesifik. Coba gunakan nama lengkap atau NIDN/NIM. (2) Data tersebut mungkin belum terdaftar atau disinkronkan di PDDikti. (3) Terjadi gangguan sementara pada API. Silakan coba beberapa saat lagi.",
  },
  {
    question: "Apakah situs ini berafiliasi dengan Kemdikbudristek?",
    answer:
      "Tidak. Situs ini adalah proyek independen yang dikembangkan oleh perorangan dan tidak memiliki afiliasi resmi dengan Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemdikbudristek) atau lembaga pemerintah lainnya.",
  },
  {
    question: "Bagaimana cara melakukan pencarian yang lebih akurat?",
    answer:
      "Untuk pencarian mahasiswa, kami sangat merekomendasikan penggunaan fitur 'Pencarian Spesifik'. Dengan memasukkan NIM, Program Studi, dan Perguruan Tinggi, Anda akan mendapatkan hasil yang jauh lebih akurat dan terjamin.",
  },
];

type FaqItemProps = {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
};

const FaqItem = ({ id, question, answer, isOpen, onToggle }: FaqItemProps) => {
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  return (
    <div className="border-b border-gray-200 py-4 sm:py-6">
      <button
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-base font-semibold text-gray-900 sm:text-lg">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          } text-gray-500 group-hover:text-gray-700`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="leading-relaxed text-gray-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const breadcrumbItems = [{ label: "Pusat Bantuan" }];
  const baseId = useId();

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 antialiased sm:p-8">
      {/* Subtle top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-blue-100/50 to-transparent" />

      <main className="mx-auto max-w-4xl">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <header className="my-8 text-center sm:my-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Pusat Bantuan
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            Temukan jawaban untuk pertanyaan yang sering diajukan mengenai situs kami.
          </p>
        </header>

        {/* FAQ List */}
        <section
          aria-label="Pertanyaan yang sering diajukan"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8"
        >
          {faqItems.map((item, index) => (
            <FaqItem
              key={index}
              id={`${baseId}-${index}`}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
