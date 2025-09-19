// app/status/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Zap, Clock, AlertTriangle, CheckCircle, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface StatusData {
  status: 'online' | 'offline' | 'error';
  message: string;
  latency?: string;
  details?: string;
}

const StatusIndicator = ({ status }: { status: StatusData['status'] }) => {
  const statusConfig = {
    online: {
      Icon: CheckCircle,
      color: 'text-green-500',
      label: 'Online',
    },
    offline: {
      Icon: AlertTriangle,
      color: 'text-red-500',
      label: 'Offline',
    },
    error: {
      Icon: AlertTriangle,
      color: 'text-yellow-500',
      label: 'Error',
    },
  };

  const { Icon, color, label } = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 py-2 px-4 rounded-full font-semibold ${color.replace('text-', 'bg-').replace('500', '100')}`}>
      <Icon className={color} size={20} />
      <span className={color}>{label}</span>
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
      const response = await fetch('/api/status');
      const data: StatusData = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        status: 'offline',
        message: 'Gagal memuat status. Periksa koneksi Anda.',
      });
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkStatus();
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
        <style jsx>{`
            details[open] .details-arrow {
                transform: rotate(180deg);
            }
        `}</style>

        <Breadcrumbs items={breadcrumbItems} />
        <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Status <span className="text-blue-600">Layanan API</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
                Memeriksa konektivitas ke API eksternal PDDIKTI.
            </p>
        </header>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/40 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b-2 border-dashed border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full border-4 border-white shadow-sm">
                        <Server size={28} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">API PDDIKTI</h2>
                        <a href="https://api-pddikti.ridwaanhall.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                            api-pddikti.ridwaanhall.com
                        </a>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0">
                    {loading && (
                        <div className="flex items-center gap-2 py-2 px-4 rounded-full text-gray-500 bg-gray-100">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="font-semibold">Memeriksa...</span>
                        </div>
                    )}
                    {!loading && status && <StatusIndicator status={status.status} />}
                </div>
            </div>

            <div className="mt-6 space-y-5">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2 sm:mb-0">
                        <Zap size={16} className="text-gray-400"/>
                        <span>Pesan Status</span>
                    </div>
                    <p className="font-semibold text-sm text-right text-gray-800 bg-gray-50 py-1 px-3 rounded-md border border-gray-200">
                        {loading ? '...' : status?.message}
                    </p>
                </div>
                {status?.latency && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Clock size={16} className="text-gray-400"/>
                            <span>Waktu Respons</span>
                        </div>
                        <p className="font-mono text-sm font-semibold bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                            {status.latency}
                        </p>
                    </div>
                )}
                 {status?.details && (
                    <div className="pt-2">
                        <details className="bg-gray-50 rounded-lg border border-gray-200">
                            <summary className="p-3 cursor-pointer text-sm font-semibold text-blue-600 hover:bg-gray-100 flex items-center justify-between list-none rounded-t-lg">
                                <span>Tampilkan Detail Teknis</span>
                                <ChevronDown size={16} className="text-gray-500 transition-transform details-arrow"/>
                            </summary>
                            <pre className="p-3 border-t border-gray-200 bg-gray-100/50 text-xs text-gray-700 whitespace-pre-wrap rounded-b-lg">
                                <code>{status.details}</code>
                            </pre>
                        </details>
                    </div>
                )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
                 <button 
                    onClick={checkStatus} 
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed font-semibold group"
                >
                    {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                       <div className="flex items-center gap-2">
                            <RefreshCw size={16} className="transition-transform group-hover:rotate-90"/>
                            <span>Periksa Ulang Status</span>
                       </div>
                    )}
                </button>
            </div>
        </div>
        <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
                Pembaruan terakhir: {lastChecked.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}
            </p>
        </div>
      </main>
    </motion.div>
  );
}