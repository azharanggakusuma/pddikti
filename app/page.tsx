'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, School, User, ArrowRight, Loader2, Info } from 'lucide-react';
import { useState } from 'react';

// Tipe props untuk MenuItem
type MenuItemProps = {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
};

// Komponen MenuItem yang telah disempurnakan
const MenuItem = ({ href, icon, title, description }: MenuItemProps) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Link
            href={href}
            className="group block"
            onClick={() => setIsLoading(true)}
        >
            <div className={`bg-white p-6 rounded-2xl border border-gray-200/80 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:shadow-blue-500/10 relative overflow-hidden`}>
                {/* Garis aksen di atas kartu */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className={`transition-all duration-300 ${isLoading ? 'opacity-50 cursor-wait' : ''}`}>
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors duration-300 group-hover:bg-blue-50 group-hover:border-blue-200">
                            {icon}
                        </div>
                        {isLoading ? (
                            <Loader2 className="animate-spin text-blue-600" size={20} />
                        ) : (
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                                <ArrowRight className="text-gray-500" size={18} />
                            </div>
                        )}
                    </div>
                    <div className="mt-5">
                        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default function Home() {
    return (
        <div className="min-h-screen w-full antialiased bg-gray-50 text-gray-800 flex flex-col">
            {/* Latar belakang dengan pola grid */}
            <div 
                className="absolute top-0 left-0 w-full h-full bg-repeat -z-10 opacity-50" 
                style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23e2e8f0\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M.5 1.5l1-1M2.5 3.5l1-1\"/%3E%3C/g%3E%3C/svg%3E')" }}
            ></div>

            <main className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-24 flex-grow">
                <header className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium tracking-wide mb-8 border border-gray-200">
                        <Info size={14} />
                        <span>Ini bukan situs web resmi dari Kemdiktisaintek.</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
                        Pangkalan Data
                        <span className="mt-2 block text-blue-600">
                            Pendidikan Tinggi
                        </span>
                    </h1>
                    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                        Akses cepat, mudah, dan terintegrasi untuk data mahasiswa, dosen, dan perguruan tinggi di seluruh Indonesia.
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

            <footer className="w-full text-center py-8 text-sm text-gray-500">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="border-t border-gray-200 pt-8">
                        <p>
                        Dikembangkan dengan <span className="font-semibold">Next.js</span> dan <span className="font-semibold">Tailwind CSS</span> oleh{" "}
                        <a
                            href="https://azharanggakusuma.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            Azharangga Kusuma
                        </a>
                    </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}