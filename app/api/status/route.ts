// app/api/status/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // URL diubah untuk menargetkan endpoint pencarian spesifik
  const externalApiUrl = 'https://api-pddikti.ridwaanhall.com/search/all/test';
  const startTime = Date.now();

  try {
    // Menggunakan metode GET untuk simulasi pencarian nyata
    const response = await fetch(externalApiUrl, {
      method: 'GET', 
      headers: { 'Accept': 'application/json' },
    });

    const duration = Date.now() - startTime;
    const responseText = await response.text(); // Baca respons untuk diagnosis

    if (!response.ok) {
      // Menangani error non-200 OK
      return NextResponse.json({
        status: 'error',
        message: `API merespons dengan status error (Status: ${response.status}).`,
        details: responseText || "Respons dari API kosong.",
        latency: `${duration}ms`,
      }, { status: response.status });
    }
    
    if (!responseText.trim()) {
        // Menangani respons kosong
        return NextResponse.json({
            status: 'error',
            message: 'API memberikan respons kosong.',
            latency: `${duration}ms`,
        }, { status: 503 });
    }

    // Coba parsing JSON
    try {
      const data = JSON.parse(responseText);
      
      // Deteksi error spesifik dari konten JSON, seperti timeout
      if (data.error) {
        return NextResponse.json({
          status: 'error',
          message: `API Mengalami Gangguan: ${data.message || 'Pesan error tidak tersedia'}`,
          details: `Kode Error: ${data.code}`,
          latency: `${duration}ms`,
        }, { status: 503 });
      }

      // Jika tidak ada field 'error' dan response OK, anggap online
      return NextResponse.json({
        status: 'online',
        message: 'API PDDIKTI berfungsi normal.',
        latency: `${duration}ms`,
      });

    } catch (e) {
      // Jika JSON tidak valid
      return NextResponse.json({
        status: 'error',
        message: 'Gagal mem-parsing respons dari API.',
        details: responseText,
        latency: `${duration}ms`,
      }, { status: 503 });
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof Error) {
      return NextResponse.json({
        status: 'offline',
        message: 'Gagal terhubung ke API PDDIKTI.',
        details: error.message,
        latency: `${duration}ms`,
      }, { status: 503 });
    }
    return NextResponse.json({
        status: 'offline',
        message: 'Terjadi kesalahan tidak diketahui saat menghubungi API PDDIKTI.',
        latency: `${duration}ms`,
     }, { status: 503 });
  }
}