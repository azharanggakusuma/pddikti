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

    if (response.ok && responseText.trim() !== "") {
      // Sukses jika respons OK dan tidak kosong
      return NextResponse.json({
        status: 'online',
        message: 'API PDDIKTI berfungsi normal.',
        latency: `${duration}ms`,
      });
    } else {
      // Dianggap error jika respons tidak OK atau kosong
      return NextResponse.json({
        status: 'error',
        message: "API merespons, namun terjadi gangguan dalam pemrosesan data.",
        details: responseText || "Respons dari API kosong.",
        latency: `${duration}ms`,
      }, { status: 503 });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof Error) {
      return NextResponse.json({
        status: 'offline',
        message: 'Gagal terhubung ke API PDDIKTI. Server mungkin sedang tidak aktif atau periksa koneksi Anda.',
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