// app/api/status/route.ts
import { NextResponse } from 'next/server';

const endpoints = [
  { name: 'Mahasiswa', url: 'https://api-pddikti.ridwaanhall.com/search/mhs/test' },
  { name: 'Dosen', url: 'https://api-pddikti.ridwaanhall.com/search/dosen/test' },
  { name: 'Prodi', url: 'https://api-pddikti.ridwaanhall.com/search/prodi/test' },
  { name: 'Perguruan Tinggi', url: 'https://api-pddikti.ridwaanhall.com/search/pt/test' },
  { name: 'Pencarian Umum', url: 'https://api-pddikti.ridwaanhall.com/search/all/test' },
];

interface EndpointStatus {
  name: string;
  status: 'online' | 'offline';
  latency: number;
}

async function checkEndpoint(endpoint: { name: string; url: string }): Promise<EndpointStatus> {
  const startTime = Date.now();
  try {
    const response = await fetch(endpoint.url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - startTime;
    return { name: endpoint.name, status: response.ok ? 'online' : 'offline', latency };
  } catch (error) {
    const latency = Date.now() - startTime;
    return { name: endpoint.name, status: 'offline', latency };
  }
}

export async function GET() {
  try {
    const results = await Promise.all(endpoints.map(checkEndpoint));
    const onlineCount = results.filter(r => r.status === 'online').length;
    const totalCount = endpoints.length;
    const averageLatency = results.reduce((acc, r) => acc + r.latency, 0) / totalCount;

    // --- PERUBAHAN LOGIKA STATUS ---
    let overallStatus: 'online' | 'error' | 'offline';
    let message: string;

    if (onlineCount === totalCount) {
      overallStatus = 'online';
      message = 'Semua layanan API berfungsi normal.';
    } else if (onlineCount > 0) {
      overallStatus = 'error'; // Diubah dari 'sebagian' menjadi 'error'
      const offlineServices = results.filter(r => r.status === 'offline').map(r => r.name).join(', ');
      message = `Beberapa layanan mengalami gangguan (${offlineServices}). Anda mungkin akan mengalami masalah pada fitur terkait.`;
    } else {
      overallStatus = 'offline'; // Diubah dari 'total' menjadi 'offline'
      message = 'Seluruh layanan API tidak dapat dijangkau. Aplikasi mungkin tidak berfungsi untuk sementara waktu.';
    }
    // --- AKHIR PERUBAHAN ---

    return NextResponse.json({
      status: overallStatus,
      message,
      latency: `${Math.round(averageLatency)}ms (rata-rata)`,
      details: results,
    });

  } catch (error) {
    return NextResponse.json({
      status: 'offline',
      message: 'Gagal melakukan pengecekan status layanan.',
      details: error instanceof Error ? error.message : "Kesalahan tidak diketahui",
    }, { status: 500 });
  }
}