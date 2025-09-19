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
    <div className={`flex items-center gap-2 p-2.5 rounded-full font-semibold ${color.replace('text-', 'bg-').replace('500', '100')}`}>
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
        {/* CSS untuk rotasi ikon panah */}
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

        <div className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/40 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-dashed border-gray-200">
                <div className="flex items-center gap-3">
                    <Server size={24} className="text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-800">API PDDIKTI</h2>
                </div>
                {loading && (
                    <div className="flex items-center gap-2 p-2.5 rounded-full text-gray-500 bg-gray-100 mt-4 sm:mt-0">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="font-semibold">Memeriksa...</span>
                    </div>
                )}
                {!loading && status && <StatusIndicator status={status.status} />}
            </div>

            <div className="mt-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Zap size={16} className="text-gray-400"/>
                        <span>Pesan Status</span>
                    </div>
                    <p className="font-semibold text-sm text-right">
                        {loading ? '...' : status?.message}
                    </p>
                </div>
                {status?.latency && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Clock size={16} className="text-gray-400"/>
                            <span>Waktu Respons</span>
                        </div>
                        <p className="font-mono text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded">
                            {status.latency}
                        </p>
                    </div>
                )}
                 {status?.details && (
                    <div className="pt-2">
                        <details>
                            <summary className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline flex items-center justify-between list-none">
                                <span>Tampilkan Detail Teknis</span>
                                <ChevronDown size={16} className="text-gray-500 transition-transform details-arrow"/>
                            </summary>
                            <pre className="mt-2 bg-gray-100 p-3 rounded-lg text-xs text-gray-700 whitespace-pre-wrap">
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
                    className="w-full h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed font-semibold group"
                >
                    {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                       <div className="flex items-center gap-2">
                            <RefreshCw size={16} className="transition-transform group-hover:rotate-90"/>
                            <span>Periksa Ulang</span>
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

