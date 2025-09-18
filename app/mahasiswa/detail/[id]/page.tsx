'use client';

import { useEffect, useState, use } from 'react'; // <--- 1. IMPORT 'use' HOOK
import { University, BookOpen, User, Calendar, GraduationCap, Users, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { MahasiswaDetail } from '@/app/types';

const InfoItem = ({ label, value, icon }: { label: string, value: string | React.ReactNode, icon: React.ReactNode }) => (
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


export default function MahasiswaDetailPage({ params }: { params: { id: string } }) {
    const [mahasiswa, setMahasiswa] = useState<MahasiswaDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNavigatingBack, setIsNavigatingBack] = useState(false);
    
    // --- THIS IS THE FIX ---
    // 2. USE THE HOOK TO UNWRAP THE PROMISE-LIKE PARAMS
    const { id: encodedId } = use(params);

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
                <Link href="/" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <ArrowLeft size={16} />
                    Kembali ke Pencarian
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
            <main className="max-w-3xl mx-auto">
                 <div className="mb-6">
                     <Link 
                        href="/" 
                        onClick={() => setIsNavigatingBack(true)}
                        className={`inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors ${isNavigatingBack ? 'cursor-wait' : ''}`}
                     >
                        {isNavigatingBack ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <ArrowLeft size={16} />
                        )}
                        {isNavigatingBack ? 'Kembali...' : 'Kembali ke Halaman Utama'}
                    </Link>
                 </div>
                 <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
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

                    <div className="border-t-2 border-dashed border-gray-200"></div>

                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InfoItem label="Perguruan Tinggi" value={mahasiswa.nama_pt} icon={<University size={20}/>} />
                        <InfoItem label="Program Studi" value={`${mahasiswa.jenjang} - ${mahasiswa.prodi}`} icon={<BookOpen size={20}/>} />
                        <InfoItem label="Jenis Kelamin" value={mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} icon={<Users size={20}/>} />
                        <InfoItem label="Tanggal Masuk" value={new Date(mahasiswa.tanggal_masuk).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} icon={<Calendar size={20}/>} />
                        <InfoItem label="Status Awal" value={mahasiswa.jenis_daftar} icon={<UserPlus size={20}/>} />
                        <InfoItem label="Status Saat Ini" value={mahasiswa.status_saat_ini} icon={<GraduationCap size={20}/>} />     
                    </div>
                </div>
            </main>
        </div>
    );
}