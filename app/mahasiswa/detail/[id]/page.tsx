'use client';

import { useEffect, useState } from 'react';
import { University, BookOpen, User, Calendar, GraduationCap, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import type { MahasiswaDetail } from '@/app/types';

// Komponen InfoItem dengan desain baru
const InfoItem = ({ label, value, icon, className = '' }: { label: string, value: string, icon: React.ReactNode, className?: string }) => (
    <div className={`bg-white p-4 rounded-xl border border-gray-200 transition-all hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 ${className}`}>
        <p className="text-sm font-medium text-gray-500 flex items-center gap-2">{icon} {label}</p>
        <p className="font-semibold text-gray-800 mt-1 truncate" title={value}>{value || '-'}</p>
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
                const data: MahasiswaDetail = await response.json();
                setMahasiswa(data);
                // Set judul halaman browser
                document.title = `${data.nama} - Detail Mahasiswa`;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
                 document.title = `Error - Detail Mahasiswa`;
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [encodedId]);
    
    // Mendapatkan inisial dari nama mahasiswa
    const initial = mahasiswa ? mahasiswa.nama.charAt(0).toUpperCase() : '?';

    if (loading) {
        return (
             <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
                <main className="max-w-2xl mx-auto">
                    <div className="animate-pulse bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-20 w-20 bg-gray-300 rounded-full"></div>
                            <div className="space-y-3">
                                <div className="h-8 w-64 bg-gray-300 rounded"></div>
                                <div className="h-6 w-40 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data</h1>
                <p className="text-gray-600 mt-2">{error || "Data mahasiswa tidak dapat ditemukan."}</p>
                <Link href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Kembali ke Pencarian
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <main className="max-w-2xl mx-auto">
                 <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200/50">
                    <div className="flex items-center space-x-5 mb-8">
                        <div className="flex-shrink-0 h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                           <span className="text-5xl font-bold">{initial}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{mahasiswa.nama}</h1>
                            <p className="text-gray-500 font-mono text-lg mt-1">NIM: {mahasiswa.nim}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Perguruan Tinggi" value={mahasiswa.nama_pt} icon={<University size={16}/>} />
                        <InfoItem label="Jenjang - Program Studi" value={`${mahasiswa.jenjang} - ${mahasiswa.prodi}`} icon={<BookOpen size={16}/>} />
                        <InfoItem label="Jenis Kelamin" value={mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} icon={<Users size={16}/>} />
                        <InfoItem label="Jenis Pendaftaran" value={mahasiswa.jenis_daftar} icon={<UserPlus size={16}/>} />
                        <InfoItem label="Tanggal Masuk" value={new Date(mahasiswa.tanggal_masuk).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} icon={<Calendar size={16}/>} />
                        <InfoItem label="Status Terakhir" value={mahasiswa.status_saat_ini} icon={<User size={16}/>} />
                    </div>

                    <div className="mt-8 border-t-2 border-dashed pt-6">
                        <Link href="/mahasiswa" className="w-full text-center block px-4 py-3 text-base font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                            Kembali ke Hasil Pencarian
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}