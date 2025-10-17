// app/(pages)/pt/detail/[id]/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { PerguruanTinggiDetail, Dosen } from '@/lib/types';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useDetailPage } from '@/lib/hooks/useDetailPage';
import { Pagination } from '@/components/search/Pagination';
import {
    University, MapPin, Globe, Mail, Phone, Calendar, ArrowLeft,
    Users, Building, FileText, Shield, CheckCircle, User, ArrowRight, Search, Printer, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const InfoItem = ({ label, value, icon }: { label: string, value: string | React.ReactNode, icon: React.ReactNode }) => {
    if (!value || value === '-') return null;
    return (
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
            <div className="flex-shrink-0 h-10 w-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <div className="font-semibold text-gray-800 text-base break-words">{value}</div>
            </div>
        </div>
    );
};

const DetailSkeleton = () => (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
        <main className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ label: 'Perguruan Tinggi', href: '/pt' }, {label: 'Detail'}]} />
          <div className="mt-8 animate-pulse bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
            <div className="relative p-6 sm:p-8">
                <div className="absolute top-6 right-6 h-7 w-24 bg-gray-200 rounded-full"></div>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl bg-gray-200"></div>
                    <div className="flex-grow w-full sm:w-auto text-center sm:text-left">
                        <div className="h-8 w-3/4 bg-gray-200 rounded mx-auto sm:mx-0"></div>
                        <div className="h-6 w-1/2 bg-gray-200 rounded mt-2 mx-auto sm:mx-0"></div>
                    </div>
                </div>
            </div>
            <div className="border-t-2 border-dashed border-gray-200" />
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full" />
                  <div className="flex-grow space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-5 w-2/3 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
    </div>
);

const DosenTableSkeleton = () => (
    <div className="animate-pulse overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="p-4"><div className="h-10 bg-gray-200 rounded-lg w-full"></div></div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <th key={i} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-full"></div></td>
                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-full"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded-md w-20 ml-auto"></div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const DOSEN_PER_PAGE = 10;

export default function PtDetailPage() {
    const { data: pt, loading, error } = useDetailPage<PerguruanTinggiDetail>('pt');
    const [dosenList, setDosenList] = useState<Dosen[]>([]);
    const [dosenLoading, setDosenLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterQuery, setFilterQuery] = useState('');

    useEffect(() => {
        if (pt) {
            const fetchDosen = async () => {
                setDosenLoading(true);
                try {
                    const initiateResponse = await fetch('/api/search/initiate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: pt.nama_pt }),
                    });
                    if (!initiateResponse.ok) throw new Error('Gagal memulai sesi pencarian dosen.');
                    
                    const { key } = await initiateResponse.json();
                    const response = await fetch(`/api/dosen?key=${key}`);
                    if (!response.ok) throw new Error('Gagal mengambil data dosen.');

                    const result = await response.json();
                    setDosenList(Array.isArray(result.data) ? result.data : []);
                } catch (err) {
                    console.error("Gagal mengambil daftar dosen:", err);
                    setDosenList([]);
                } finally {
                    setDosenLoading(false);
                }
            };
            fetchDosen();
        }
    }, [pt]);

    const filteredDosen = useMemo(() => {
        if (!filterQuery) return dosenList;
        const query = filterQuery.toLowerCase();
        return dosenList.filter(dosen =>
            dosen.nama.toLowerCase().includes(query) ||
            dosen.nidn.toLowerCase().includes(query) ||
            dosen.nama_prodi.toLowerCase().includes(query)
        );
    }, [dosenList, filterQuery]);

    const paginatedDosen = useMemo(() => {
        const startIndex = (currentPage - 1) * DOSEN_PER_PAGE;
        return filteredDosen.slice(startIndex, startIndex + DOSEN_PER_PAGE);
    }, [filteredDosen, currentPage]);

    const totalPages = Math.ceil(filteredDosen.length / DOSEN_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterQuery]);

    const breadcrumbItems = [
      { label: "Perguruan Tinggi", href: "/pt" },
      { label: pt ? pt.nama_pt : "Detail" }
    ];

    if (loading) return <DetailSkeleton />;

    if (error || !pt) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
            <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data</h1>
            <p className="text-gray-600 mt-2">{error || 'Data perguruan tinggi tidak dapat ditemukan.'}</p>
            <Link
              href="/pt"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali ke Pencarian
            </Link>
          </div>
        );
    }

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const fullAddress = [pt.alamat, pt.kecamatan_pt, pt.kab_kota_pt, pt.provinsi_pt, pt.kode_pos].filter(part => part && part !== 'Tidak Diisi').join(', ');
    const isAktif = pt.status_pt.toLowerCase() === 'aktif';
    const statusInfo = {
        label: pt.status_pt,
        color: isAktif ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
        icon: isAktif ? <CheckCircle size={14} className="text-green-700" /> : <AlertTriangle size={14} className="text-yellow-700" />
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
            <main className="max-w-4xl mx-auto">
                <Breadcrumbs items={breadcrumbItems} />
                <div className="mt-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
                    <div className="relative p-6 sm:p-8">
                        <div className="absolute top-6 right-6">
                            <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${statusInfo.color}`}>
                                {statusInfo.icon}
                                <span>{statusInfo.label}</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <div id="logo-placeholder" style={{ display: 'none' }} className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 flex items-center justify-center rounded-xl border bg-gray-100 text-gray-400 shadow-sm">
                                <University size={40} />
                            </div>
                            <Image
                                id="pt-logo"
                                src={`/api/pt/logo/${pt.id_sp}`}
                                alt={`Logo ${pt.nama_pt}`}
                                width={96}
                                height={96}
                                className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl border-2 border-white bg-white object-contain shadow-md"
                                unoptimized
                                onError={() => {
                                    const logoEl = document.getElementById('pt-logo');
                                    if (logoEl) logoEl.style.display = 'none';
                                    const placeholder = document.getElementById('logo-placeholder');
                                    if (placeholder) placeholder.style.display = 'flex';
                                }}
                            />
                            <div className="flex-grow text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{pt.nama_pt}</h1>
                                <p className="text-gray-500 text-base sm:text-lg mt-1">{pt.kelompok}</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t-2 border-dashed border-gray-200"></div>
                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InfoItem label="Akreditasi" value={pt.akreditasi_pt} icon={<Shield size={20}/>} />
                        <InfoItem label="Kode PT" value={pt.kode_pt.trim()} icon={<Building size={20}/>} />
                        <InfoItem label="Wilayah" value={pt.pembina} icon={<Users size={20}/>} />
                        <InfoItem label="Tanggal Berdiri" value={formatDate(pt.tgl_berdiri_pt)} icon={<Calendar size={20}/>} />
                        <InfoItem 
                            label="SK Pendirian" 
                            value={<>{pt.sk_pendirian_sp} <span className="block text-sm font-normal text-gray-500 mt-1">Tanggal: {formatDate(pt.tgl_sk_pendirian_sp)}</span></>} 
                            icon={<FileText size={20}/>} 
                        />
                        <InfoItem label="Alamat" value={fullAddress} icon={<MapPin size={20}/>} />
                        <InfoItem label="Website" value={pt.website ? <a href={`http://${pt.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{pt.website}</a> : '-'} icon={<Globe size={20}/>} />
                        <InfoItem label="Email" value={pt.email ? <a href={`mailto:${pt.email}`} className="text-blue-600 hover:underline">{pt.email}</a> : '-'} icon={<Mail size={20}/>} />
                        <InfoItem label="Telepon" value={pt.no_tel} icon={<Phone size={20}/>} />
                        <InfoItem label="Fax" value={pt.no_fax} icon={<Printer size={20}/>} />
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-200 flex items-center gap-3">
                        <User className="text-blue-500" />
                        Dosen ({dosenLoading ? 'Memuat...' : filteredDosen.length})
                    </h2>
                    {dosenLoading ? (
                        <DosenTableSkeleton />
                    ) : (
                        <div>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={filterQuery}
                                        onChange={(e) => setFilterQuery(e.target.value)}
                                        placeholder={`Cari di antara ${dosenList.length} dosen...`}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            
                            {paginatedDosen.length > 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm text-left">
                                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-4 w-12 text-center font-medium tracking-wider">No</th>
                                                        <th scope="col" className="px-6 py-4 font-medium tracking-wider">Nama Dosen</th>
                                                        <th scope="col" className="px-6 py-4 font-medium tracking-wider">NIDN</th>
                                                        <th scope="col" className="px-6 py-4 font-medium tracking-wider">Program Studi</th>
                                                        <th scope="col" className="relative px-6 py-4"><span className="sr-only">Aksi</span></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {paginatedDosen.map((dosen, index) => (
                                                        <tr key={dosen.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                                            <td className="px-6 py-4 text-center text-gray-500 font-medium">{(currentPage - 1) * DOSEN_PER_PAGE + index + 1}</td>
                                                            <td className="px-6 py-4 font-semibold text-gray-800 truncate max-w-xs">{dosen.nama}</td>
                                                            <td className="px-6 py-4 font-mono text-gray-600">{dosen.nidn}</td>
                                                            <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{dosen.nama_prodi}</td>
                                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                                <Link href={`/dosen/detail/${encodeURIComponent(dosen.id)}`} className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold inline-flex items-center gap-1.5 group px-3 py-1.5 rounded-md text-xs transition-all">
                                                                    <span>Detail</span>
                                                                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="mt-6">
                                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-10 rounded-xl">
                                    <p>Tidak ada dosen yang cocok dengan kata kunci "<span className="font-semibold text-gray-700">{filterQuery}</span>".</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </motion.div>
    );
}