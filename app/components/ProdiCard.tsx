// app/components/ProdiCard.tsx
'use client';

import { University, BookOpen, ArrowRight } from 'lucide-react';
import { ProgramStudi } from '@/app/types';

interface ProdiCardProps {
    prodi: ProgramStudi;
    index: number;
}

export const ProdiCard = ({ prodi, index }: ProdiCardProps) => {
    return (
        <div 
            className="bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
            style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${index * 80}ms` }}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-gray-800 truncate" title={`${prodi.jenjang} - ${prodi.nama}`}>{prodi.jenjang} - {prodi.nama}</h2>
                </div>
                <div
                    className="flex-shrink-0 flex items-center justify-center h-10 w-10 ml-4 rounded-full bg-gray-100 border border-gray-200 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
                    aria-label="Lihat Detail"
                >
                    <ArrowRight size={18} />
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-sm text-gray-600 space-y-2">
                <p className="flex items-center truncate" title={prodi.pt}><University size={16} className="mr-3 text-gray-400 flex-shrink-0"/> {prodi.pt}</p>
            </div>
        </div>
    );
};