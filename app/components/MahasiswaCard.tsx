'use client';

import Link from 'next/link';
import { useState } from 'react';
import { University, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { Mahasiswa } from '@/app/types';
import { useRouter } from 'next/navigation';

interface MahasiswaCardProps {
    mhs: Mahasiswa;
    index: number;
}

export const MahasiswaCard = ({ mhs, index }: MahasiswaCardProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDetailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsLoading(true);
        router.push(e.currentTarget.href);
    };

    return (
        <div 
            className="bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
            style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${index * 80}ms` }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-bold text-lg text-gray-800 truncate" title={mhs.nama}>{mhs.nama}</h2>
                    <p className="text-gray-500 font-mono text-sm">NIM: {mhs.nim}</p>
                </div>
                <Link
                    href={`/mahasiswa/detail/${encodeURIComponent(mhs.id)}`}
                    onClick={handleDetailClick}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 border border-gray-200 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
                    aria-label="Lihat Detail"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <ArrowRight size={18} />}
                </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-sm text-gray-600 space-y-2">
                <p className="flex items-center"><University size={16} className="mr-3 text-gray-400"/> {mhs.nama_pt}</p>
                <p className="flex items-center"><BookOpen size={16} className="mr-3 text-gray-400"/> {mhs.nama_prodi}</p>
            </div>
        </div>
    );
};