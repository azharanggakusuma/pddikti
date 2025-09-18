// app/components/DosenCard.tsx
'use client';

import { University, User, BookText, ArrowRight } from 'lucide-react';
import { Dosen } from '@/app/types';

interface DosenCardProps {
    dosen: Dosen;
    index: number;
}

export const DosenCard = ({ dosen, index }: DosenCardProps) => {
    return (
        <div 
            className="bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
            style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${index * 80}ms` }}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-gray-800 truncate" title={dosen.nama}>{dosen.nama}</h2>
                    <p className="text-gray-500 font-mono text-sm">NIDN: {dosen.nidn || '-'}</p>
                </div>
                <div
                    className="flex-shrink-0 flex items-center justify-center h-10 w-10 ml-4 rounded-full bg-gray-100 border border-gray-200 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
                    aria-label="Lihat Detail"
                >
                    <ArrowRight size={18} />
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-sm text-gray-600 space-y-2">
                <p className="flex items-center truncate" title={dosen.nama_pt}><University size={16} className="mr-3 text-gray-400 flex-shrink-0"/> {dosen.nama_pt}</p>
                <p className="flex items-center truncate" title={dosen.nama_prodi}><BookText size={16} className="mr-3 text-gray-400 flex-shrink-0"/> {dosen.nama_prodi}</p>
            </div>
        </div>
    );
};