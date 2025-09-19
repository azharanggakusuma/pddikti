'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Definisikan tipe data untuk status
interface StatusData {
  status: 'online' | 'offline' | 'error';
  message: string;
  latency?: string;
}

// 2. Definisikan tipe untuk Context
interface StatusContextType {
  status: StatusData | null;
  isLoading: boolean;
}

// 3. Buat Context dengan nilai default
const StatusContext = createContext<StatusContextType | undefined>(undefined);

// 4. Buat Provider Component
export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Panggil API status Anda
        const response = await fetch('/api/status');
        const data: StatusData = await response.json();
        setStatus(data);
      } catch (error) {
        setStatus({
          status: 'offline',
          message: 'Gagal menghubungi server.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Panggil saat pertama kali dimuat
    checkStatus();

    // Set interval untuk memeriksa status setiap 60 detik
    const intervalId = setInterval(checkStatus, 60000);

    // Bersihkan interval saat komponen di-unmount
    return () => clearInterval(intervalId);
  }, []);

  const value = { status, isLoading };

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  );
};

// 5. Buat custom hook untuk mempermudah penggunaan context
export const useApiStatus = (): StatusContextType => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useApiStatus must be used within a StatusProvider');
  }
  return context;
};