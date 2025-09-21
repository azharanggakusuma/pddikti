// app/dosen/detail/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { University, BookOpen, User, ArrowLeft, Loader2, Hash, ShieldCheck, Briefcase } from 'lucide-react';
import Link from 'next/link';
import type { Dosen, DosenDetail } from '@/app/types';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';
import { motion } from 'framer-motion';

const InfoItem = ({ label, value, icon }: { label: string, value: string | React.ReactNode, icon: React.ReactNode }) => (
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50/70 border border-gray-200/60">
        <div className="flex-shrink-0 h-10 w-10 bg-white rounded-lg flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 text-base break-words">{value || '-'}</p>
        </div>
    </div>
);


export default function DosenDetailPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    // Ambil nama dosen dari query parameter URL
    const namaDosen = searchParams.get('nama'); 
    
    const [dosen, setDosen] = useState<DosenDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Gunakan 'use' hook untuk mendapatkan ID dari params
    const { id: encodedId } = use(params);

    useEffect(() => {
        // Pastikan ID dan nama dosen tersedia
        if (!encodedId || !namaDosen) {
            setError("Informasi tidak lengkap untuk memuat data dosen.");
            setLoading(false);
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                // Gunakan rute pencarian dosen yang sudah ada
                const response = await fetch(`/api/dosen?q=${encodeURIComponent(namaDosen)}`);
                if (!response.ok) {
                    throw new Error('Gagal melakukan pencarian data dosen.');
                }
                const data: Dosen[] = await response.json();

                // Cari dosen yang spesifik dari hasil pencarian berdasarkan ID
                const decodedId = decodeURIComponent(encodedId);
                const foundDosen = data.find(d => d.id === decodedId);

                if (foundDosen) {
                    setDosen(foundDosen);
                } else {
                    throw new Error('Data dosen spesifik tidak ditemukan.');
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [encodedId, namaDosen]);

    const breadcrumbItems = [
      { label: "Dosen", href: "/dosen" },
      { label: dosen ? dosen.nama : "Detail" }
    ];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
    }
    
    if (error || !dosen) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
                <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data</h1>
                <p className="text-gray-600 mt-2">{error || "Data dosen tidak dapat ditemukan."}</p>
                <Link href="/dosen" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <ArrowLeft size={16} />
                    Kembali ke Pencarian
                </Link>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
            <main className="max-w-3xl mx-auto">
                 <Breadcrumbs items={breadcrumbItems} />
                 <div className="mt-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200"><User size={48} className="text-gray-500" /></div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{dosen.nama}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="border-t-2 border-dashed border-gray-200"></div>
                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InfoItem label="NIDN" value={dosen.nidn} icon={<Hash size={20}/>} />
                        <InfoItem label="NUPTK" value={dosen.nuptk} icon={<ShieldCheck size={20}/>} />
                        <InfoItem label="Perguruan Tinggi" value={dosen.nama_pt} icon={<University size={20}/>} />
                        <InfoItem label="Program Studi Homebase" value={dosen.nama_prodi} icon={<BookOpen size={20}/>} />
                        <InfoItem label="ID Dosen" value={dosen.id} icon={<Briefcase size={20}/>} />
                    </div>
                </div>
                 <Link href="/dosen" className="mt-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 group transition-colors">
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Kembali ke Pencarian Dosen
                </Link>
            </main>
        </motion.div>
    );
}