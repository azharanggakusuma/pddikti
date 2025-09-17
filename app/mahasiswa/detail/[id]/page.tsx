'use client';

import { useEffect, useState } from 'react';
import { University, BookOpen, User, Calendar, GraduationCap, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import type { MahasiswaDetail } from '@/app/types';

const InfoItem = ({ label, value, icon, className = '' }: { label: string, value: string, icon: React.ReactNode, className?: string }) => (
    <div className={`bg-gray-100 p-4 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500 flex items-center gap-2">{icon} {label}</p>
        <p className="font-semibold text-gray-800 mt-1">{value || '-'}</p>
    </div>
);


export default function MahasiswaDetailPage({ params }: { params: { id: string } }) {
    const [mahasiswa, setMahasiswa] = useState<MahasiswaDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const encodedId = params.id;

    useEffect(() => {
        if (!encodedId) {
            setLoading(false);
            setError("ID tidak ditemukan.");
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const decodedId = decodeURIComponent(encodedId);
                const response = await fetch(`/api/mahasiswa/detail?id=${decodedId}`);
                if (!response.ok) {
                    throw new Error('Gagal memuat data mahasiswa.');
                }
                const data = await response.json();
                setMahasiswa(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [encodedId]);

    if (loading) {
        return (
             <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
                <main className="max-w-2xl mx-auto">
                    <div className="animate-pulse bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-20 w-20 bg-gray-300 rounded-full"></div>
                            <div className="space-y-2">
                                <div className="h-8 w-64 bg-gray-300 rounded"></div>
                                <div className="h-6 w-40 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-gray-100 p-4 rounded-lg space-y-2">
                                    <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                                    <div className="h-5 w-2/3 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !mahasiswa) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
                <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data</h1>
                <p className="text-gray-600 mt-2">{error || "Data mahasiswa tidak dapat ditemukan."}</p>
                <Link href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Kembali ke Pencarian
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <main className="max-w-2xl mx-auto">
                 <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="flex-shrink-0 h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={40} className="text-gray-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{mahasiswa.nama}</h1>
                            <p className="text-gray-500 font-mono text-lg">{mahasiswa.nim}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Perguruan Tinggi" value={mahasiswa.nama_pt} icon={<University size={16}/>} />
                        <InfoItem label="Jenjang - Program Studi" value={`${mahasiswa.jenjang} - ${mahasiswa.prodi}`} icon={<BookOpen size={16}/>} />
                        <InfoItem label="Jenis Kelamin" value={mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} icon={<Users size={16}/>} />
                        <InfoItem label="Status Awal Mahasiswa" value={mahasiswa.jenis_daftar} icon={<UserPlus size={16}/>} />
                        <InfoItem label="Tanggal Masuk" value={new Date(mahasiswa.tanggal_masuk).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} icon={<Calendar size={16}/>} />
                        <InfoItem label="Status Terakhir" value={mahasiswa.status_saat_ini} icon={<User size={16}/>} />
                    </div>

                    <div className="mt-8 border-t pt-6">
                        <Link href="/" className="w-full text-center block px-4 py-3 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all">
                            Kembali ke Pencarian
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}