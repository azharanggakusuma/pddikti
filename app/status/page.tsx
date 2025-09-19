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

const StatusCardHeader = ({ status, loading }: { status: StatusData['status'] | null, loading: boolean }) => {
    const baseClasses = "relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-t-2xl text-white overflow-hidden transition-all duration-500";
    
    const statusConfig = {
        loading: {
            gradient: 'bg-gradient-to-br from-gray-500 to-gray-700',
            Icon: Loader2,
            label: 'Memeriksa Status...',
            animateIcon: true,
        },
        online: {
            gradient: 'bg-gradient-to-br from-emerald-500 to-green-600',
            Icon: CheckCircle,
            label: 'Semua Sistem Berfungsi',
            animateIcon: false,
        },
        offline: {
            gradient: 'bg-gradient-to-br from-rose-500 to-red-600',
            Icon: AlertTriangle,
            label: 'Layanan Terputus',
            animateIcon: false,
        },
        error: {
            gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
            Icon: AlertTriangle,
            label: 'Terjadi Gangguan',
            animateIcon: false,
        },
    };

    const currentStatusKey = loading ? 'loading' : status || 'loading';
    const { gradient, Icon, label, animateIcon } = statusConfig[currentStatusKey];

    return (
        <div className={`${baseClasses} ${gradient}`}>
            {/* Background decorative pattern */}
            <div className="absolute inset-0 bg-repeat bg-center opacity-5" style={{backgroundImage: 'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.4"%3E%3Cpath d="M.5 1.5l1-1M2.5 3.5l1-1"/%3E%3C/g%3E%3C/svg%3E\')'}}></div>
            
            <motion.div
                key={currentStatusKey}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
                <Icon size={48} className={animateIcon ? 'animate-spin' : ''} />
            </motion.div>
            <motion.h2 
                 key={label}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                className="mt-4 text-2xl font-bold tracking-tight text-center"
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

  const checkStatus = async () => {
    setLoading(true);
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
    checkStatus();
    // Set interval to re-check status every 1 minute
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const breadcrumbItems = [{ label: "Status API" }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-4 sm:p-8 flex flex-col items-center bg-gray-50 text-gray-800"
    >
      <main className="w-full max-w-2xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Status <span className="text-blue-600">Layanan API</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
                Laporan real-time mengenai status konektivitas dan waktu respons dari API PDDIKTI.
            </p>
        </header>

        <motion.div 
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
            <StatusCardHeader status={status?.status || null} loading={loading} />
            
            <div className="p-6 sm:p-8">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <Server size={16} />
                            <span>Endpoint Target</span>
                        </div>
                        <code className="text-sm font-semibold bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">api-pddikti</code>
                    </div>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <Zap size={16} />
                            <span>Pesan</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 text-left sm:text-right">
                           {loading ? 'Menunggu respons...' : status?.message}
                        </p>
                    </div>
                     {!loading && status?.latency && (
                        <AnimatePresence>
                           <motion.div
                             initial={{ opacity: 0, y: -10 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                           >
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <Clock size={16} />
                                    <span>Latensi</span>
                                </div>
                                <p className="font-mono text-sm font-semibold text-gray-800">
                                    {status.latency}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                     <p className="text-xs text-gray-500">
                        Terakhir diperbarui: <span className="font-semibold">{lastChecked.toLocaleTimeString('id-ID')}</span>
                    </p>
                     <button 
                        onClick={checkStatus} 
                        disabled={loading}
                        className="w-full sm:w-auto px-6 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed font-semibold group"
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
    </motion.div>
  );
}