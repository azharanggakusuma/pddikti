// app/prodi/detail/[id]/page.tsx
'use client';

import Link from 'next/link';
import type { ProgramStudiDetail } from '@/lib/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useDetailPage } from '@/lib/hooks/useDetailPage';
import { University, BookOpen, Calendar, MapPin, Globe, Mail, Phone, CheckCircle, BarChart2, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const InfoItem = ({ label, value, icon }: { label: string, value: string | React.ReactNode, icon: React.ReactNode }) => (
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
        <div className="flex-shrink-0 h-10 w-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 text-base">{value || '-'}</p>
        </div>
    </div>
);

export default function ProdiDetailPage({ params }: { params: { id: string } }) {
    const { data: prodi, loading, error } = useDetailPage<ProgramStudiDetail>('prodi');
    
    const breadcrumbItems = [
      { label: "Program Studi", href: "/prodi" },
      { label: prodi ? prodi.nama_prodi : "Detail" }
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!prodi) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
            <main className="max-w-3xl mx-auto">
                 <Breadcrumbs items={breadcrumbItems} />
                 <div className="mt-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
                    <div className="p-6 sm:p-8">
                        <div className="text-center">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{prodi.nama_prodi}</h1>
                            <p className="text-gray-500 text-base sm:text-lg mt-1">{prodi.nama_pt}</p>
                        </div>
                    </div>
                    <div className="border-t-2 border-dashed border-gray-200"></div>
                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InfoItem label="Jenjang" value={prodi.jenj_didik} icon={<BarChart2 size={20}/>} />
                        <InfoItem label="Status" value={prodi.status} icon={<CheckCircle size={20}/>} />
                        <InfoItem label="Akreditasi" value={prodi.akreditasi} icon={<University size={20}/>} />
                        <InfoItem label="Tanggal Berdiri" value={new Date(prodi.tgl_berdiri).toLocaleDateString('id-ID')} icon={<Calendar size={20}/>} />
                        <InfoItem label="Alamat" value={`${prodi.alamat}, ${prodi.kab_kota}, ${prodi.provinsi}`} icon={<MapPin size={20}/>} />
                        <InfoItem label="Website" value={<a href={`http://${prodi.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{prodi.website}</a>} icon={<Globe size={20}/>} />
                        <InfoItem label="Email" value={<a href={`mailto:${prodi.email}`} className="text-blue-600 hover:underline">{prodi.email}</a>} icon={<Mail size={20}/>} />
                        <InfoItem label="Telepon" value={prodi.no_tel} icon={<Phone size={20}/>} />
                    </div>
                </div>
                 <Link href="/prodi" className="mt-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 group transition-colors">
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Kembali ke Pencarian Prodi
                </Link>
            </main>
        </motion.div>
    );
}