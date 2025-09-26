// app/pt/detail/[id]/page.tsx
'use client';

import Link from 'next/link';
import type { PerguruanTinggiDetail } from '@/lib/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useDetailPage } from '@/lib/hooks/useDetailPage';
import {
    University, MapPin, Globe, Mail, Phone, Calendar, ArrowLeft, Loader2,
    Users, Building, FileText, Shield, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const InfoItem = ({ label, value, icon }: { label: string, value: string | React.ReactNode, icon: React.ReactNode }) => {
    if (!value || value === '-') return null;
    return (
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
            <div className="flex-shrink-0 h-10 w-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-semibold text-gray-800 text-base break-words">{value}</p>
            </div>
        </div>
    );
};

const DetailSkeleton = () => (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
        <main className="max-w-3xl mx-auto">
          <Breadcrumbs items={[{ label: 'Perguruan Tinggi', href: '/pt' }, {label: 'Detail'}]} />
          <div className="mt-8 animate-pulse bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
            <div className="p-6 sm:p-8 text-center space-y-3">
              <div className="h-8 w-3/4 bg-gray-300 rounded mx-auto" />
              <div className="h-6 w-1/2 bg-gray-300 rounded mx-auto" />
            </div>
            <div className="border-t-2 border-dashed border-gray-200" />
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full" />
                  <div className="flex-grow space-y-2">
                    <div className="h-4 w-1/3 bg-gray-300 rounded" />
                    <div className="h-5 w-2/3 bg-gray-300 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
    </div>
);


export default function PtDetailPage() {
    const { data: pt, loading, error } = useDetailPage<PerguruanTinggiDetail>('pt');

    const breadcrumbItems = [
      { label: "Perguruan Tinggi", href: "/pt" },
      { label: pt ? pt.nama_pt : "Detail" }
    ];

    if (loading) return <DetailSkeleton />;

    if (error || !pt) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
            <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data</h1>
            <p className="text-gray-600 mt-2">{error || 'Data perguruan tinggi tidak dapat ditemukan.'}</p>
            <Link
              href="/pt"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali ke Pencarian
            </Link>
          </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    const fullAddress = [pt.alamat, pt.kecamatan_pt, pt.kab_kota_pt, pt.provinsi_pt, pt.kode_pos]
        .filter(part => part && part !== 'Tidak Diisi')
        .join(', ');

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
            <main className="max-w-3xl mx-auto">
                <Breadcrumbs items={breadcrumbItems} />
                <div className="mt-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
                    <div className="p-6 sm:p-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pt.nama_pt}</h1>
                        <p className="text-gray-500 text-base sm:text-lg mt-1">{pt.kelompok}</p>
                    </div>
                    <div className="border-t-2 border-dashed border-gray-200"></div>
                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InfoItem label="Status" value={pt.status_pt} icon={<CheckCircle size={20}/>} />
                        <InfoItem label="Akreditasi" value={pt.akreditasi_pt} icon={<Shield size={20}/>} />
                        <InfoItem label="Kode PT" value={pt.kode_pt.trim()} icon={<Building size={20}/>} />
                        <InfoItem label="Wilayah" value={pt.pembina} icon={<Users size={20}/>} />
                        <InfoItem label="Tanggal Berdiri" value={formatDate(pt.tgl_berdiri_pt)} icon={<Calendar size={20}/>} />
                        <InfoItem label="SK Pendirian" value={pt.sk_pendirian_sp} icon={<FileText size={20}/>} />
                        <InfoItem label="Alamat" value={fullAddress} icon={<MapPin size={20}/>} />
                        <InfoItem label="Website" value={pt.website ? <a href={`http://${pt.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{pt.website}</a> : '-'} icon={<Globe size={20}/>} />
                        <InfoItem label="Email" value={pt.email ? <a href={`mailto:${pt.email}`} className="text-blue-600 hover:underline">{pt.email}</a> : '-'} icon={<Mail size={20}/>} />
                        <InfoItem label="Telepon" value={pt.no_tel} icon={<Phone size={20}/>} />
                    </div>
                </div>
            </main>
        </motion.div>
    );
}