// app/(pages)/status/page.tsx
'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  RefreshCw, 
  WifiOff,
  Activity,
  TrendingUp,
  Shield,
  Globe,
  Database
} from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

// --- Tipe Data (Sesuai API) ---
interface EndpointDetail {
  name: string;
  status: 'online' | 'offline';
  latency: number;
}

interface StatusData {
  status: 'online' | 'offline' | 'error';
  message: string;
  latency?: string;
  details?: EndpointDetail[];
}

// ** PERBAIKAN ERROR 1: Mengubah tipe `icon` menjadi lebih fleksibel **
interface SummaryCardProps {
  title: string;
  value: string;
  trend?: string;
  status: 'positive' | 'warning' | 'negative' | 'neutral';
  icon: React.ElementType; 
  description?: string;
}

// --- Komponen-Komponen UI yang Disesuaikan ---

const StatusSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center justify-between rounded-xl bg-white/70 p-4 h-[76px] border border-white/50">
          <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <div className="h-4 w-32 bg-gray-300 rounded-md"></div>
          </div>
          <div className="h-4 w-12 bg-gray-300 rounded-md"></div>
      </div>
    ))}
  </div>
);

const SummaryCard = ({ title, value, trend, status, icon: Icon, description }: SummaryCardProps) => {
  const statusConfig = {
    positive: { 
      bgColor: 'bg-gradient-to-br from-emerald-50/90 to-green-50/70',
      textColor: 'text-emerald-800',
      trendColor: 'text-emerald-600',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-200/60',
      shadowColor: 'shadow-emerald-100/50'
    },
    warning: { 
      bgColor: 'bg-gradient-to-br from-amber-50/90 to-yellow-50/70',
      textColor: 'text-amber-800',
      trendColor: 'text-amber-600',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-200/60',
      shadowColor: 'shadow-amber-100/50'
    },
    negative: { 
      bgColor: 'bg-gradient-to-br from-rose-50/90 to-red-50/70',
      textColor: 'text-rose-800',
      trendColor: 'text-rose-600',
      iconColor: 'text-rose-500',
      borderColor: 'border-rose-200/60',
      shadowColor: 'shadow-rose-100/50'
    },
    neutral: { 
      bgColor: 'bg-gradient-to-br from-slate-50/90 to-gray-50/70',
      textColor: 'text-slate-800',
      trendColor: 'text-slate-600',
      iconColor: 'text-slate-500',
      borderColor: 'border-slate-200/60',
      shadowColor: 'shadow-slate-100/50'
    }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-sm border ${config.bgColor} ${config.borderColor} ${config.shadowColor} group hover:shadow-lg transition-all duration-300`}
      whileHover={{ scale: [1, 1.02], y: [0, -2] }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      layout
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide truncate">{title}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
            )}
          </div>
          <motion.div 
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center ${config.iconColor} group-hover:scale-110 transition-transform flex-shrink-0 ml-2`}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            <Icon size={20} strokeWidth={2.5} />
          </motion.div>
        </div>
        
        <div className="mt-auto">
          <p className={`text-2xl sm:text-3xl font-bold ${config.textColor} mb-1`}>{value}</p>
          {trend && (
            <motion.div 
              className={`text-xs sm:text-sm ${config.trendColor} flex items-center gap-1`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TrendingUp size={12} />
              <span className="font-medium">{trend}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const LiveIndicator = () => (
  <motion.div 
    className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/40"
    animate={{ opacity: [0.7, 1, 0.7] }}
    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
  >
    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
    <span className="font-medium">Live</span>
  </motion.div>
);

const StatusHeader = ({ status, loading }: { status: StatusData['status'] | null, loading: boolean }) => {
  const statusConfig = {
    loading: { 
      Icon: Loader2, 
      label: 'Memeriksa Layanan...', 
      sublabel: 'Sedang memvalidasi koneksi',
      iconColor: 'text-slate-500', 
      bgGradient: 'bg-gradient-to-br from-slate-50/90 to-slate-100/70',
      ringColor: 'ring-slate-200/60',
      animate: true 
    },
    online: { 
      Icon: CheckCircle, 
      label: 'Semua Layanan Normal', 
      sublabel: 'Sistem berjalan optimal',
      iconColor: 'text-emerald-500', 
      bgGradient: 'bg-gradient-to-br from-emerald-50/90 to-green-50/70',
      ringColor: 'ring-emerald-200/60',
      animate: false 
    },
    error: { 
      Icon: AlertTriangle, 
      label: 'Layanan Terganggu', 
      sublabel: 'Beberapa sistem mengalami kendala',
      iconColor: 'text-amber-500', 
      bgGradient: 'bg-gradient-to-br from-amber-50/90 to-yellow-50/70',
      ringColor: 'ring-amber-200/60',
      animate: false 
    },
    offline: { 
      Icon: WifiOff, 
      label: 'Layanan Tidak Tersedia', 
      sublabel: 'Sistem sedang tidak dapat dijangkau',
      iconColor: 'text-rose-500', 
      bgGradient: 'bg-gradient-to-br from-rose-50/90 to-red-50/70',
      ringColor: 'ring-rose-200/60',
      animate: false 
    },
  };
  
  const currentKey = loading ? 'loading' : status || 'loading';
  const { Icon, label, sublabel, iconColor, bgGradient, ringColor, animate } = statusConfig[currentKey];

  return (
    <motion.div 
      className={`p-6 sm:p-8 lg:p-12 transition-all duration-500 rounded-t-2xl sm:rounded-t-3xl ${bgGradient} backdrop-blur-sm relative overflow-hidden`}
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentKey}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl mb-4 sm:mb-6 ring-4 ${ringColor} ${iconColor}`}
          >
            <Icon size={32} className={`${animate ? 'animate-spin' : ''} sm:size-36 lg:size-40`} strokeWidth={2} />
          </motion.div>
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-center space-y-2"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              {label}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
              {sublabel}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const ServiceStatusRow = ({ name, status, latency, index }: EndpointDetail & { index: number }) => {
  const isOnline = status === 'online';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        delay: index * 0.08 
      }}
    >
      <div className="flex items-center justify-between rounded-xl bg-white/70 backdrop-blur-sm p-3 sm:p-4 border border-white/50 transition-colors duration-300">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <motion.div 
            className={`w-3 h-3 rounded-full shadow-sm flex-shrink-0 ${isOnline ? 'bg-green-400' : 'bg-rose-400'}`}
            animate={isOnline ? {} : { scale: [1, 1.2, 1] }}
            transition={isOnline ? {} : { repeat: Infinity, duration: 2 }}
          />
          <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
            {name}
          </p>
        </div>
        
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <span className="font-mono text-sm text-gray-500">{latency}ms</span>
        </div>
      </div>
    </motion.div>
  );
};

const useStatusCheck = () => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const checkStatus = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch('/api/status', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: StatusData = await response.json();
      setStatus(data);
    } catch (err) {
      setStatus({
        status: 'error',
        message: 'Tidak dapat terhubung ke server status. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { status, loading, checkStatus };
};

export default function StatusPage() {
  const { status, loading, checkStatus } = useStatusCheck();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const handleStatusCheck = async (isInitial = false) => {
    await checkStatus(isInitial);
    setLastChecked(new Date());
  };

  useEffect(() => {
    handleStatusCheck(true);
    const interval = setInterval(() => handleStatusCheck(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const onlineServices = status?.details?.filter(service => service.status === 'online').length || 0;
  
  // ** PERBAIKAN ERROR 2: Menambahkan fallback `|| []` sebelum reduce **
  const totalServices = status?.details?.length || 0;
  const averageLatency = (status?.details || []).reduce((acc, service) => acc + service.latency, 0) / (totalServices || 1);
  const uptime = totalServices > 0 ? ((onlineServices / totalServices) * 100).toFixed(1) : '0';
  const maxLatency = Math.max(...(status?.details?.map(s => s.latency) || [0]));
  const minLatency = Math.min(...(status?.details?.map(s => s.latency) || [0]));
  
  const breadcrumbItems = [{ label: "Status Layanan" }];

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-8 flex flex-col items-center bg-gray-50 text-gray-800">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-50/20 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-indigo-50/10 via-transparent to-transparent"></div>
      </div>

      <main className="w-full max-w-7xl mx-auto z-10 relative">
        <div className="px-2 sm:px-0">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        
        <header className="text-center my-6 sm:my-8 lg:my-12 px-2">
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Status{' '}
            <span className="text-blue-600">
              Layanan
            </span>
          </motion.h1>
          <motion.p 
            className="mt-3 sm:mt-4 lg:mt-6 text-sm sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Monitoring real-time untuk semua layanan API PDDikti dengan pemantauan 24/7 dan notifikasi instan.
          </motion.p>
        </header>

        <motion.div 
          className="bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/50 shadow-2xl shadow-gray-900/5 overflow-hidden mx-2 sm:mx-0"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <StatusHeader status={status?.status || null} loading={loading} />
          
          <div className="border-t border-white/50"></div>

          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {!loading && status?.details && (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-stretch"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <SummaryCard 
                  title="Uptime" 
                  value={`${uptime}%`}
                  trend={parseFloat(uptime) >= 99.5 ? "Sangat Baik" : parseFloat(uptime) >= 99 ? "Baik" : "Perlu Perhatian"}
                  status={parseFloat(uptime) >= 99.5 ? "positive" : parseFloat(uptime) >= 97 ? "warning" : "negative"}
                  icon={Shield}
                  description="Ketersediaan layanan"
                />
                <SummaryCard 
                  title="Avg Latency" 
                  value={`${Math.round(averageLatency)}ms`}
                  trend={averageLatency < 150 ? "Sangat Cepat" : averageLatency < 300 ? "Cepat" : "Lambat"}
                  status={averageLatency < 200 ? "positive" : averageLatency < 500 ? "warning" : "negative"}
                  icon={Activity}
                  description="Rata-rata waktu respons"
                />
                <SummaryCard 
                  title="Active Services" 
                  value={`${onlineServices}/${totalServices}`}
                  trend={onlineServices === totalServices ? "Semua Aktif" : `${totalServices - onlineServices} Terganggu`}
                  status={onlineServices === totalServices ? "positive" : onlineServices >= totalServices * 0.8 ? "warning" : "negative"}
                  icon={Server}
                  description="Layanan yang beroperasi"
                />
                <SummaryCard 
                  title="Peak Latency" 
                  value={`${maxLatency}ms`}
                  trend={`Min: ${minLatency}ms`}
                  status={maxLatency < 300 ? "positive" : maxLatency < 600 ? "warning" : "negative"}
                  icon={Globe}
                  description="Respons paling lambat"
                />
              </motion.div>
            )}

            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Database size={22} />
                  Status Endpoint
                </h3>
                <LiveIndicator />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <StatusSkeleton key="skeleton" />
                  ) : (
                    <motion.div key="content" className="contents">
                      {status?.details?.map((service, index) => (
                        <ServiceStatusRow key={service.name} {...service} index={index} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-6 border-t border-white/50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>
                    {lastChecked ? `Diperbarui: ${lastChecked.toLocaleTimeString('id-ID')}` : 'Memuat...'}
                  </span>
                </div>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span className="text-blue-600 font-medium">Auto-refresh setiap menit</span>
              </div>
              
              <motion.button 
                onClick={() => handleStatusCheck()} 
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed font-semibold group shadow-lg hover:shadow-xl text-sm sm:text-base"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={16} className="transition-transform group-hover:rotate-180 duration-500"/>
                    <span>Refresh Status</span>
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}