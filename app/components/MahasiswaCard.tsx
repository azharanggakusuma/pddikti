// app/components/MahasiswaCard.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { University, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { Mahasiswa } from '@/app/types';

interface MahasiswaCardProps {
    mhs: Mahasiswa;
    index: number;
}

export const MahasiswaCard = ({ mhs, index }: MahasiswaCardProps) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Link
            href={`/mahasiswa/detail/${encodeURIComponent(mhs.id)}`}
            onClick={() => setIsLoading(true)}
            className="group block"
        >
            <div 
                className={`bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1 ${isLoading ? 'cursor-wait opacity-60' : ''}`}
                style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${index * 80}ms` }}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg text-gray-800 truncate" title={mhs.nama}>{mhs.nama}</h2>
                        <p className="text-gray-500 font-mono text-sm">NIM: {mhs.nim}</p>
                    </div>
                    <div
                        className="flex-shrink-0 flex items-center justify-center h-10 w-10 ml-4 rounded-full bg-gray-100 border border-gray-200 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
                        aria-label="Lihat Detail"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <ArrowRight size={18} />}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-sm text-gray-600 space-y-2">
                    <p className="flex items-center truncate" title={mhs.nama_pt}><University size={16} className="mr-3 text-gray-400 flex-shrink-0"/> {mhs.nama_pt}</p>
                    <p className="flex items-center truncate" title={mhs.nama_prodi}><BookOpen size={16} className="mr-3 text-gray-400 flex-shrink-0"/> {mhs.nama_prodi}</p>
                </div>
            </div>
        </Link>
    );
};