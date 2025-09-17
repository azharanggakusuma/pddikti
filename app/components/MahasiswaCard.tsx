// app/components/MahasiswaCard.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { University, BookOpen, Clipboard, ClipboardCheck } from 'lucide-react';
import { Mahasiswa } from '@/app/types';

interface MahasiswaCardProps {
    mhs: Mahasiswa;
    index: number;
}

export const MahasiswaCard = ({ mhs, index }: MahasiswaCardProps) => {
    const [copiedNim, setCopiedNim] = useState<string | null>(null);

    const handleCopyNim = (nim: string) => {
        navigator.clipboard.writeText(nim);
        setCopiedNim(nim);
        setTimeout(() => setCopiedNim(null), 2000);
    };

    return (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 group" style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${index * 80}ms` }}>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-bold text-xl truncate" title={mhs.nama}>{mhs.nama}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 font-mono text-base">NIM: {mhs.nim}</p>
                        <button onClick={() => handleCopyNim(mhs.nim)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Salin NIM">
                            {copiedNim === mhs.nim ? <ClipboardCheck size={16} className="text-blue-600" /> : <Clipboard size={16} />}
                        </button>
                    </div>
                </div>
                <Link href={`/mahasiswa/${encodeURIComponent(mhs.id)}`}
                    className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all whitespace-nowrap shadow-lg shadow-blue-500/30 hover:bg-blue-700">
                    Lihat Detail
                </Link>
            </div>
            <div className="mt-5 pt-5 border-t-2 border-dashed border-gray-200 text-base text-gray-600 space-y-3">
                <p className="flex items-center"><BookOpen size={18} className="mr-3"/> {mhs.nama_prodi}</p>
                <p className="flex items-center"><University size={18} className="mr-3"/> {mhs.nama_pt}</p>
            </div>
        </div>
    );
};