// app/mahasiswa/page.tsx

import { University, BookOpen, User, Calendar, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';
import type { MahasiswaDetail } from '@/app/types';

// Fungsi untuk mengambil data di server
async function getMahasiswaDetail(id: string): Promise<MahasiswaDetail | null> {
    try {
        const apiUrl = `https://api-pddikti.ridwaanhall.com/mhs/detail/${id}/?format=json`;
        const response = await fetch(apiUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch detail:", error);
        return null;
    }
}

const InfoItem = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
    <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-500 flex items-center gap-2">{icon} {label}</p>
        <p className="font-semibold text-gray-800 mt-1">{value || '-'}</p>
    </div>
);

// Menggunakan `searchParams` untuk mendapatkan ID dari query URL
export default async function MahasiswaDetailPage({ searchParams }: { searchParams: { id: string } }) {
    const encodedId = searchParams.id;
    if (!encodedId) {
        // Handle caso não haja ID
        return <div>ID tidak ditemukan.</div>;
    }
    const decodedId = decodeURIComponent(encodedId);
    const mahasiswa = await getMahasiswaDetail(decodedId);

    if (!mahasiswa) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
                <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data</h1>
                <p className="text-gray-600 mt-2">Data mahasiswa tidak dapat ditemukan atau terjadi kesalahan pada server.</p>
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
                        <InfoItem label="Program Studi" value={mahasiswa.prodi} icon={<BookOpen size={16}/>} />
                        <InfoItem label="Jenjang" value={mahasiswa.jenjang} icon={<GraduationCap size={16}/>} />
                        <InfoItem label="Jenis Kelamin" value={mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} icon={<Users size={16}/>} />
                        <InfoItem label="Tanggal Masuk" value={new Date(mahasiswa.tanggal_masuk).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} icon={<Calendar size={16}/>} />
                        <InfoItem label="Status Terakhir" value={mahasiswa.status_saat_ini} icon={<User size={16}/>} />
                    </div>

                    <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row gap-4">
                         <a href={`https://pddikti.kemdikbud.go.id/data_mahasiswa/${mahasiswa.id}`} target="_blank" rel="noopener noreferrer" 
                           className="flex-1 text-center px-4 py-3 text-sm font-semibold bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                           Lihat di Situs PDDIKTI
                        </a>
                        <Link href="/" className="flex-1 text-center px-4 py-3 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all">
                            Kembali ke Pencarian
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}