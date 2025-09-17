'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, School, User, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Komponen MenuItem dengan state loading
const MenuItem = ({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
    };

    return (
        <Link href={href} className="group block" onClick={handleClick}>
            <div className={`relative bg-white p-6 rounded-2xl border-2 border-gray-200 h-full overflow-hidden
                            hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 
                            transition-all duration-300 ${isLoading ? 'cursor-wait opacity-75' : ''}`}>
                
                {/* Ikon panah atau loading yang muncul saat hover/klik */}
                {isLoading ? (
                    <Loader2 
                        className="absolute top-4 right-4 text-blue-500 animate-spin" 
                        size={20} 
                    />
                ) : (
                    <ArrowRight 
                        className="absolute top-4 right-4 text-gray-300 group-hover:text-blue-500 
                                   transform -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 
                                   transition-all duration-300" 
                        size={20} 
                    />
                )}

                <div className="flex flex-col h-full">
                    <div className={`bg-gray-100 p-3 rounded-lg border border-gray-200 self-start
                                    group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:scale-110 group-hover:rotate-[-12deg]
                                    transition-all duration-300 ${isLoading ? 'scale-110 rotate-[-12deg]' : ''}`}>
                        {icon}
                    </div>
                    <div className="mt-4">
                        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default function Home() {
    return (
        <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800">
            <main className="w-full max-w-4xl mx-auto">
                <header className="text-center my-20">
                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-gray-900">
                        Pangkalan Data <br className="md:hidden" />
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                            Pendidikan Tinggi
                        </span>
                    </h1>
                    <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto">
                        Akses cepat dan mudah ke data mahasiswa, dosen, dan perguruan tinggi di seluruh Indonesia.
                    </p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <MenuItem 
                        href="/mahasiswa" 
                        icon={<GraduationCap size={24} />}
                        title="Pencarian Mahasiswa"
                        description="Temukan data mahasiswa berdasarkan nama atau NIM."
                    />
                    <MenuItem 
                        href="/dosen" 
                        icon={<User size={24} />}
                        title="Pencarian Dosen"
                        description="Temukan data dosen dan riwayat mengajarnya."
                    />
                    <MenuItem 
                        href="/prodi" 
                        icon={<BookOpen size={24} />}
                        title="Pencarian Program Studi"
                        description="Lihat informasi detail tentang program studi."
                    />
                    <MenuItem 
                        href="/pt" 
                        icon={<School size={24} />}
                        title="Pencarian Perguruan Tinggi"
                        description="Cari informasi mengenai perguruan tinggi."
                    />
                </div>
            </main>

            <footer className="text-center mt-28 mb-8 text-sm text-gray-500/80">
                <p>Sebuah proyek independen untuk memudahkan akses data PDDIKTI Kemdiktisaintek.</p>
            </footer>
        </div>
    );
}