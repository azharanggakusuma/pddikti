// app/status/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Zap, Clock, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface StatusData {
  status: 'online' | 'offline' | 'error';
  message: string;
  latency?: string;
}

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
            label: 'Berfungsi Normal',
            iconColor: 'text-emerald-500',
            textColor: 'text-emerald-900',
            animateIcon: false,
        },
        offline: {
            Icon: AlertTriangle,
            label: 'Layanan API Tidak Terjangkau',
            iconColor: 'text-rose-500',
            textColor: 'text-rose-900',
            animateIcon: false,
        },
        error: {
            Icon: AlertTriangle,
            label: 'Gangguan Terdeteksi',
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
  const [lastChecked, setLastChecked] = useState(new Date());

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
    online: 'from-green-300/40 to-emerald-100/40',
    offline: 'from-red-300/40 to-rose-100/40',
    error: 'from-yellow-300/40 to-amber-100/40',
  };
  const currentStatusKey = loading ? 'loading' : status?.status || 'loading';
  const auroraGradient = statusColorConfig[currentStatusKey];

  return (
    <div className="relative min-h-screen p-4 sm:p-8 flex flex-col items-center bg-gray-50 text-gray-800 overflow-hidden">
      {/* Aurora Background */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] bg-gradient-to-tr ${auroraGradient} rounded-full blur-3xl -z-10 transition-all duration-1000`}
      ></div>
      
      <main className="w-full max-w-2xl mx-auto z-10">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="text-center my-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Status Layanan
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
                Laporan real-time untuk konektivitas dan performa API PDDIKTI.
            </p>
        </header>

        <motion.div 
            className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-300/30"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="p-8 sm:p-10 border-b border-gray-200/80">
                <StatusHeader status={status?.status || null} loading={loading} />
            </div>
            
            <div className="p-6 sm:p-8">
                <dl className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <Server size={16} />
                            <span>Endpoint</span>
                        </dt>
                        <dd className="w-full sm:w-auto text-left sm:text-right">
                            <code className="text-sm font-semibold bg-gray-100/80 px-2.5 py-1 rounded-md border border-gray-200/80">
                                api-pddikti
                            </code>
                        </dd>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <Zap size={16} />
                            <span>Pesan</span>
                        </dt>
                        <dd className="text-sm font-semibold text-gray-800 text-left sm:text-right">
                           {loading ? 'Menunggu respons server...' : status?.message}
                        </dd>
                    </div>
                     {!loading && status?.latency && (
                        <AnimatePresence>
                           <motion.div
                             initial={{ opacity: 0, y: -10 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                           >
                                <dt className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <Clock size={16} />
                                    <span>Latensi</span>
                                </dt>
                                <dd className="font-mono text-sm font-semibold text-gray-800">
                                    {status.latency}
                                </dd>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </dl>

                <div className="mt-8 pt-6 border-t border-gray-200/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                     <p className="text-xs text-gray-500">
                        Terakhir diperbarui: <span className="font-semibold">{lastChecked.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
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