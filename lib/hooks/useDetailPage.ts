// lib/hooks/useDetailPage.ts
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

/**
 * Custom hook untuk mengambil data pada halaman detail.
 * @param apiPath - Bagian path dari URL API (misal: "mahasiswa", "prodi", "pt").
 */
export function useDetailPage<T>(apiPath: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams<{ id: string }>();
  const encodedId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    if (!encodedId) {
      setLoading(false);
      setError('ID tidak ditemukan di URL.');
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        let decodedId = encodedId;
        try {
          decodedId = decodeURIComponent(encodedId);
        } catch (e) {
          console.warn("Gagal melakukan decode pada ID, menggunakan ID asli:", encodedId);
        }
        
        const response = await fetch(`/api/${apiPath}/detail?id=${decodedId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal memuat data detail.');
        }
        const resultData: T = await response.json();
        setData(resultData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [encodedId, apiPath]);

  return { data, loading, error };
}