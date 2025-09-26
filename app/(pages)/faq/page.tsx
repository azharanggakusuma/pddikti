// app/(pages)/faq/page.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';

const faqItems = [
    {
        question: "Apakah data di situs ini akurat dan resmi?",
        answer: "Data kami bersumber langsung dari API publik yang mengambil informasi dari PDDikti. Meskipun kami berusaha menyajikan data seakurat mungkin, situs resmi PDDikti tetap menjadi satu-satunya sumber kebenaran. Situs ini bersifat sebagai alat bantu pencarian alternatif."
    },
    {
        question: "Seberapa sering data diperbarui?",
        answer: "Pembaruan data bergantung sepenuhnya pada API publik yang kami gunakan dan sinkronisasinya dengan database PDDikti. Kami tidak melakukan pembaruan data secara manual."
    },
    {
        question: "Mengapa saya tidak bisa menemukan data mahasiswa/dosen yang saya cari?",
        answer: "Ada beberapa kemungkinan: (1) Kata kunci yang Anda masukkan kurang spesifik. Coba gunakan nama lengkap atau NIDN/NIM. (2) Data tersebut mungkin belum terdaftar atau disinkronkan di PDDikti. (3) Terjadi gangguan sementara pada API. Silakan coba beberapa saat lagi."
    },
    {
        question: "Apakah situs ini berafiliasi dengan Kemdikbudristek?",
        answer: "Tidak. Situs ini adalah proyek independen yang dikembangkan oleh perorangan dan tidak memiliki afiliasi resmi dengan Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemdikbudristek) atau lembaga pemerintah lainnya."
    },
    {
        question: "Bagaimana cara melakukan pencarian yang lebih akurat?",
        answer: "Untuk pencarian mahasiswa, kami sangat merekomendasikan penggunaan fitur 'Pencarian Spesifik'. Dengan memasukkan NIM, Program Studi, dan Perguruan Tinggi, Anda akan mendapatkan hasil yang jauh lebih akurat dan terjamin."
    }
];

const FaqItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-gray-200 py-6">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800"
            >
                <span>{question}</span>
                <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="text-gray-600 leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default function FaqPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const breadcrumbItems = [{ label: "Pusat Bantuan" }];

    return (
         <div className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
            <main className="max-w-4xl mx-auto">
                <Breadcrumbs items={breadcrumbItems} />
                 <header className="text-center my-8 sm:my-12">
                     <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl mb-6">
                        <HelpCircle size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                        Pusat Bantuan
                    </h1>
                    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                        Temukan jawaban untuk pertanyaan yang sering diajukan mengenai situs kami.
                    </p>
                </header>

                <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-200">
                     {faqItems.map((item, index) => (
                        <FaqItem
                            key={index}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}