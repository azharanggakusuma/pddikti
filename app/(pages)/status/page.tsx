// app/(pages)/status/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Zap, Clock, AlertTriangle, CheckCircle, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface EndpointDetail {
  name: string;
  status: 'online' | 'offline';
  latency: number;
}

// Tipe data disesuaikan dengan respons API yang baru
interface StatusData {
  status: 'online' | 'offline' | 'error';
  message: string;
  latency?: string;
  details?: EndpointDetail[];
}

const StatusSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div className="h-4 w-1/3 bg-gray-200 rounded-md"></div>
                <div className="flex items-center gap-3">
                    <div className="h-4 w-16 bg-gray-200 rounded-md"></div>
                    <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                </div>
            </div>
        ))}
    </div>
);

// Komponen Header disesuaikan dengan status baru
const StatusHeader = ({ status, loading }: { status: StatusData['status'] | null, loading: boolean }) => {
    const statusConfig = {
        loading: { Icon: Loader2, label: 'Memeriksa Layanan...', iconColor: 'text-gray-500', bgColor: 'bg-gray-100', animate: true },
        online: { Icon: CheckCircle, label: 'Layanan Berfungsi Normal', iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50', animate: false },
        error: { Icon: AlertTriangle, label: 'Layanan Terganggu', iconColor: 'text-amber-500', bgColor: 'bg-amber-50', animate: false },
        offline: { Icon: WifiOff, label: 'Layanan Tidak Tersedia', iconColor: 'text-rose-500', bgColor: 'bg-rose-50', animate: false },
    };
    
    const currentKey = loading ? 'loading' : status || 'loading';
    const { Icon, label, iconColor, bgColor, animate } = statusConfig[currentKey];

    return (
        <motion.div 
            className={`p-8 sm:p-10 transition-colors duration-500 rounded-t-2xl ${bgColor}`}
            initial={false}
            animate={{ backgroundColor: bgColor }}
        >
            <div className="flex flex-col items-center text-center">
                <motion.div
                    key={currentKey}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className={`flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-5 border-4 border-gray-50 ${iconColor}`}
                >
                    <Icon size={40} className={animate ? 'animate-spin' : ''} strokeWidth={2.5} />
                </motion.div>
                <motion.h2
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`text-3xl font-bold tracking-tight text-gray-900`}
                >
                    {label}
                </motion.h2>
            </div>
        </motion.div>
    );
};

const ServiceStatusRow = ({ name, status, latency, index }: EndpointDetail & { index: number }) => {
    const isOnline = status === 'online';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between rounded-lg bg-gray-50/80 p-4 border border-gray-200/80"
        >
            <p className="font-semibold text-gray-800">{name}</p>
            <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-500">{latency}ms</span>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${isOnline ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isOnline ? 'Normal' : 'Gangguan'}
                    </span>
                    <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                </div>
            </div>
        </motion.div>
    );
};


export default function StatusPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch('/api/status');
      const data: StatusData = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        status: 'offline',
        message: 'Gagal menghubungi server pengecekan status.',
      });
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkStatus(true);
    const interval = setInterval(() => checkStatus(true), 60000);
    return () => clearInterval(interval);
  }, []);
  
  const breadcrumbItems = [{ label: "Status Layanan" }];

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center bg-gray-50 text-gray-800">
      <main className="w-full max-w-2xl mx-auto z-10">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="text-center my-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Status <span className="text-blue-600">Layanan</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
                Laporan real-time untuk konektivitas dan performa API PDDikti.
            </p>
        </header>

        <motion.div 
            className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <StatusHeader status={status?.status || null} loading={loading} />
            
            <div className="border-t-2 border-dashed border-gray-200"></div>

            <div className="p-6 sm:p-8">
                {/* Pesan Kesimpulan dari API */}
                {!loading && status?.message && (
                    <div className="mb-6 p-4 text-center text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200/80">
                        {status.message}
                    </div>
                )}
                
                <h3 className="text-lg font-bold text-gray-800 mb-4">Rincian Layanan</h3>
                
                <div className="space-y-3">
                    {loading ? (
                        <StatusSkeleton />
                    ) : (
                        status?.details?.map((service, index) => (
                            <ServiceStatusRow key={service.name} {...service} index={index} />
                        ))
                    )}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                     <p className="text-xs text-gray-500">
                        {lastChecked ? (
                            <>
                                Terakhir diperbarui: <span className="font-semibold">{lastChecked.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })}</span>
                            </>
                        ) : (
                            'Memuat...'
                        )}
                    </p>
                     <button 
                        onClick={() => checkStatus()} 
                        disabled={loading}
                        className="w-full sm:w-auto px-6 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed font-semibold group shadow-sm hover:shadow-md"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                           <div className="flex items-center gap-2">
                                <RefreshCw size={14} className="transition-transform group-hover:rotate-180"/>
                                <span>Periksa Ulang</span>
                           </div>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
      </main>
    </div>
  );
}