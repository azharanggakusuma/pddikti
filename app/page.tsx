'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, School, User, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Tipe props untuk MenuItem
type MenuItemProps = {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
};

// Komponen MenuItem dengan loading state yang diperbarui
const MenuItem = ({ href, icon, title, description }: MenuItemProps) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Link
            href={href}
            className="group block"
            onClick={() => setIsLoading(true)}
        >
            <div className={`bg-white p-6 rounded-xl border border-gray-200 h-full
                            hover:border-gray-300 hover:shadow-lg hover:-translate-y-1
                            transition-all duration-300
                            ${isLoading ? 'cursor-wait opacity-60' : ''}`}
            >
                <div className="flex items-start justify-between">
                    <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-300 group-hover:bg-blue-50 group-hover:border-blue-200">
                        {/* Ikon utama selalu ditampilkan */}
                        {icon}
                    </div>

                    {/* Indikator loading atau panah di pojok kanan */}
                    {isLoading ? (
                        <Loader2 className="animate-spin text-blue-600" size={20} />
                    ) : (
                        <ArrowRight
                            className="text-gray-300 transform -translate-x-2 opacity-0
                                       group-hover:opacity-100 group-hover:translate-x-0
                                       transition-all duration-300"
                            size={20}
                        />
                    )}
                </div>
                <div className="mt-5">
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{description}</p>
                </div>
            </div>
        </Link>
    );
};


export default function Home() {
    return (
        <div className="min-h-screen w-full antialiased bg-gray-50 text-gray-800">
            <main className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-24">
                <header className="text-center">
                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
                        Pangkalan Data
                        <span className="mt-2 block text-blue-600">
                            Pendidikan Tinggi
                        </span>
                    </h1>
                    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                        Akses cepat dan mudah ke data mahasiswa, dosen, dan perguruan tinggi di seluruh Indonesia.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                    <MenuItem
                        href="/mahasiswa"
                        icon={<GraduationCap size={24} className="text-gray-500 group-hover:text-blue-600 transition-colors" />}
                        title="Pencarian Mahasiswa"
                        description="Temukan data mahasiswa berdasarkan nama atau NIM."
                    />
                    <MenuItem
                        href="/dosen"
                        icon={<User size={24} className="text-gray-500 group-hover:text-blue-600 transition-colors" />}
                        title="Pencarian Dosen"
                        description="Temukan data dosen dan riwayat mengajarnya."
                    />
                    <MenuItem
                        href="/prodi"
                        icon={<BookOpen size={24} className="text-gray-500 group-hover:text-blue-600 transition-colors" />}
                        title="Pencarian Program Studi"
                        description="Lihat informasi detail tentang program studi."
                    />
                    <MenuItem
                        href="/pt"
                        icon={<School size={24} className="text-gray-500 group-hover:text-blue-600 transition-colors" />}
                        title="Pencarian Perguruan Tinggi"
                        description="Cari informasi mengenai perguruan tinggi."
                    />
                </div>
            </main>

            <footer className="w-full text-center pb-8 text-sm text-gray-500">
                <p>Proyek independen untuk memudahkan akses data PDDIKTI.</p>
            </footer>
        </div>
    );
}