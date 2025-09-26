// app/mahasiswa/detail/[id]/page.tsx
'use client';

import Link from 'next/link';
import type { MahasiswaDetail } from '@/lib/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useDetailPage } from '@/lib/hooks/useDetailPage';
import { University, BookOpen, User, Calendar, GraduationCap, Users, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const InfoItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
}) => (
  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
    <div className="flex-shrink-0 h-10 w-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800 text-base">{value || '-'}</p>
    </div>
  </div>
);

const DetailSkeleton = () => (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
        <main className="max-w-3xl mx-auto">
          <Breadcrumbs items={[{ label: 'Mahasiswa', href: '/mahasiswa' }, {label: 'Detail'}]} />
          <div className="mt-8 animate-pulse bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex-shrink-0 h-24 w-24 bg-gray-300 rounded-full" />
                <div className="flex flex-col items-center sm:items-start space-y-2">
                  <div className="h-8 w-64 bg-gray-300 rounded" />
                  <div className="h-6 w-40 bg-gray-300 rounded" />
                </div>
              </div>
            </div>
            <div className="border-t-2 border-dashed border-gray-200" />
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
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


export default function MahasiswaDetailPage() {
  const { data: mahasiswa, loading, error } = useDetailPage<MahasiswaDetail>('mahasiswa');

  const breadcrumbItems = [
    { label: 'Mahasiswa', href: '/mahasiswa' },
    { label: mahasiswa ? mahasiswa.nama : 'Detail' },
  ];

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !mahasiswa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data</h1>
        <p className="text-gray-600 mt-2">{error || 'Data mahasiswa tidak dapat ditemukan.'}</p>
        <Link
          href="/mahasiswa"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Pencarian
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased"
    >
      <main className="max-w-3xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mt-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <User size={48} className="text-gray-500" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mahasiswa.nama}</h1>
                <p className="text-gray-500 font-mono text-base sm:text-lg mt-1">NIM: {mahasiswa.nim}</p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-200" />

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoItem label="Perguruan Tinggi" value={mahasiswa.nama_pt} icon={<University size={20} />} />
            <InfoItem label="Program Studi" value={`${mahasiswa.jenjang} - ${mahasiswa.prodi}`} icon={<BookOpen size={20} />} />
            <InfoItem
              label="Jenis Kelamin"
              value={mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              icon={<Users size={20} />}
            />
            <InfoItem
              label="Tanggal Masuk"
              value={new Date(mahasiswa.tanggal_masuk).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              icon={<Calendar size={20} />}
            />
            <InfoItem label="Status Awal" value={mahasiswa.jenis_daftar} icon={<UserPlus size={20} />} />
            <InfoItem label="Status Saat Ini" value={mahasiswa.status_saat_ini} icon={<GraduationCap size={20} />} />
          </div>
        </div>
      </main>
    </motion.div>
  );
}