// app/api/dosen/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: 'Parameter "q" harus diisi' }, { status: 400 });
  }

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api-pddikti.ridwaanhall.com/search/dosen/${encodedQuery}/?format=json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ message: "Terjadi gangguan saat mengambil data. Silakan coba lagi nanti.", details: errorText }, { status: response.status });
    }
    
    const responseText = await response.text();

    if (!responseText.trim()) {
      return NextResponse.json([]);
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ message: 'Gagal memproses data dari server eksternal.', details: responseText }, { status: 500 });
    }
    
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda." }, { status: 500 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan yang tidak diketahui"}, {status:500})
  }
}