// app/status/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Zap, Clock, AlertTriangle, CheckCircle, Loader2, RefreshCw, Globe } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface StatusData {
  status: 'online' | 'offline' | 'error';
  message: string;
  latency?: string;
}

const StatusSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-1/3">
                    <div className="h-5 w-5 bg-gray-200 rounded-md"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                </div>
                <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
            </div>
        ))}
    </div>
);

const StatusHeader = ({ status, loading }: { status: StatusData['status'] | null, loading: boolean }) => {
    const statusConfig = {
        loading: { Icon: Loader2, label: 'Memeriksa...', iconColor: 'text-gray-500', textColor: 'text-gray-800', animate: true },
        online: { Icon: CheckCircle, label: 'Layanan Berfungsi Normal', iconColor: 'text-emerald-500', textColor: 'text-emerald-900', animate: false },
        offline: { Icon: AlertTriangle, label: 'Layanan Tidak Terjangkau', iconColor: 'text-rose-500', textColor: 'text-rose-900', animate: false },
        error: { Icon: AlertTriangle, label: 'Layanan Mengalami Gangguan', iconColor: 'text-amber-500', textColor: 'text-amber-900', animate: false },
    };
    const currentKey = loading ? 'loading' : status || 'loading';
    const { Icon, label, iconColor, textColor, animate } = statusConfig[currentKey];

    return (
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
                 className={`text-3xl font-bold tracking-tight ${textColor}`}
            >
                {label}
            </motion.h2>
        </div>
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
        message: 'Gagal menghubungi server.',
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

  const headerBgConfig = {
    loading: 'bg-gray-100',
    online: 'bg-emerald-50',
    offline: 'bg-rose-50',
    error: 'bg-amber-50',
  };
  const currentStatusKey = loading ? 'loading' : status?.status || 'loading';

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
            <div className={`p-8 sm:p-10 transition-colors duration-500 ${headerBgConfig[currentStatusKey]}`}>
                <StatusHeader status={status?.status || null} loading={loading} />
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200"></div>

            <div className="p-6 sm:p-8">
                {loading ? (
                    <StatusSkeleton />
                ) : (
                <motion.dl 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium"><Server size={16} /><span>Server</span></dt>
                        <dd className="text-sm font-semibold text-gray-800">PDDikti Public API</dd>
                    </div>
                     <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium"><Globe size={16} /><span>Endpoint</span></dt>
                        <dd>
                            <code className="text-sm font-semibold font-mono bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                GET /search/.../...
                            </code>
                        </dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium"><Clock size={16} /><span>Latensi</span></dt>
                        <dd className="font-mono text-sm font-semibold text-gray-800">{status?.latency || '-'}</dd>
                    </div>
                    <div className="flex items-start justify-between">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium pt-0.5"><Zap size={16} /><span>Pesan</span></dt>
                        <dd className="text-sm font-semibold text-gray-800 text-right max-w-sm">{status?.message}</dd>
                    </div>
                </motion.dl>
                )}

                <div className="mt-10 pt-6 border-t border-gray-200/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                     <p className="text-xs text-gray-500">
                        {lastChecked ? (
                            <>
                                Terakhir diperbarui: <span className="font-semibold">{lastChecked.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })}</span>
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