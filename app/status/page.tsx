// app/status/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Zap, Clock, AlertTriangle, CheckCircle, Loader2, RefreshCw, Globe } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface StatusData {
  status: 'online' | 'offline' | 'error';
  message: string;
  latency?: string;
}

// Komponen Skeleton untuk loading
const StatusSkeleton = () => (
    <div className="space-y-5 animate-pulse">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
                <div className="flex items-center gap-3 w-1/3">
                    <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                </div>
                <div className="w-full sm:w-auto text-left sm:text-right">
                   <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
                </div>
            </div>
        ))}
    </div>
);


const StatusHeader = ({ status, loading }: { status: StatusData['status'] | null, loading: boolean }) => {
    const statusConfig = {
        loading: {
            Icon: Loader2,
            label: 'Memeriksa Koneksi...',
            iconColor: 'text-gray-500',
            textColor: 'text-gray-800',
            animateIcon: true,
        },
        online: {
            Icon: CheckCircle,
            label: 'Layanan Berfungsi Normal',
            iconColor: 'text-emerald-500',
            textColor: 'text-emerald-900',
            animateIcon: false,
        },
        offline: {
            Icon: AlertTriangle,
            label: 'Layanan Tidak Terjangkau',
            iconColor: 'text-rose-500',
            textColor: 'text-rose-900',
            animateIcon: false,
        },
        error: {
            Icon: AlertTriangle,
            label: 'Layanan Mengalami Gangguan',
            iconColor: 'text-amber-500',
            textColor: 'text-amber-900',
            animateIcon: false,
        },
    };

    const currentStatusKey = loading ? 'loading' : status || 'loading';
    const { Icon, label, iconColor, textColor, animateIcon } = statusConfig[currentStatusKey];

    return (
        <div className="flex flex-col items-center text-center">
            <motion.div
                key={currentStatusKey}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className={`flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4 ${iconColor}`}
            >
                <Icon size={32} className={animateIcon ? 'animate-spin' : ''} />
            </motion.div>
            <motion.h2
                 key={label}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className={`text-2xl font-bold tracking-tight ${textColor}`}
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkStatus = async (isInitial = false) => {
    if (!isInitial) {
        setLoading(true);
    }
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
    const interval = setInterval(() => checkStatus(true), 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, []);
  
  const breadcrumbItems = [{ label: "Status API" }];

  const statusColorConfig = {
    loading: 'from-gray-300/40 to-gray-100/40',
    online: 'from-sky-300/40 via-green-300/40 to-emerald-100/40',
    offline: 'from-rose-300/40 via-red-300/40 to-orange-100/40',
    error: 'from-amber-300/40 via-yellow-300/40 to-orange-100/40',
  };
  
  const headerBgConfig = {
    loading: 'bg-gradient-to-br from-gray-100 to-gray-200/60',
    online: 'bg-gradient-to-br from-emerald-100 to-green-200/60',
    offline: 'bg-gradient-to-br from-rose-100 to-red-200/60',
    error: 'bg-gradient-to-br from-amber-100 to-yellow-200/60',
  };

  const currentStatusKey = loading ? 'loading' : status?.status || 'loading';
  const auroraGradient = statusColorConfig[currentStatusKey];
  const headerBg = headerBgConfig[currentStatusKey];

  return (
    <div className="relative min-h-screen p-4 sm:p-8 flex flex-col items-center bg-gray-50 text-gray-800 overflow-hidden">
      {/* Aurora Background */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] bg-gradient-to-tr ${auroraGradient} rounded-full blur-3xl -z-10 transition-all duration-1000`}
      ></div>
      
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
            className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-300/30 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className={`p-8 sm:p-10 border-b border-gray-200/80 transition-colors duration-500 ${headerBg}`}>
                <StatusHeader status={status?.status || null} loading={loading} />
            </div>
            
            <div className="p-6 sm:p-8">
                {loading ? (
                    <StatusSkeleton />
                ) : (
                <dl className="space-y-5">
                    <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <Server size={16} />
                            <span>Server</span>
                        </dt>
                        <dd className="w-full sm:w-auto text-left sm:text-right">
                           <span className="text-base font-semibold text-gray-800">PDDikti Public API</span>
                        </dd>
                    </div>
                    <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <Globe size={16} />
                            <span>Endpoint</span>
                        </dt>
                        <dd className="w-full sm:w-auto text-left sm:text-right">
                            <code className="text-base font-semibold font-mono bg-gray-100/80 px-2.5 py-1 rounded-md border border-gray-200/80">
                                GET /search/all/&#123;query&#125;
                            </code>
                        </dd>
                    </div>
                    <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <Clock size={16} />
                            <span>Latensi</span>
                        </dt>
                        <dd className="font-mono text-base font-semibold text-gray-800">
                           {status?.latency || '-'}
                        </dd>
                    </div>
                    <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <Zap size={16} />
                            <span>Pesan</span>
                        </dt>
                        <dd className="text-base font-semibold text-gray-800 text-left sm:text-right max-w-md">
                           {status?.message}
                        </dd>
                    </div>
                </dl>
                )}

                <div className="mt-10 pt-6 border-t border-gray-200/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                     <p className="text-xs text-gray-500">
                        {isClient && lastChecked ? (
                            <>
                                Terakhir diperbarui: <span className="font-semibold">{lastChecked.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </>
                        ) : (
                            'Memuat waktu...'
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