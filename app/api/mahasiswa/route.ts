// app/api/mahasiswa/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: 'Parameter "q" harus diisi' }, { status: 400 });
  }

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api-pddikti.ridwaanhall.com/search/mhs/${encodedQuery}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ message: "Terjadi gangguan saat mengambil data mahasiswa. Silakan coba lagi nanti.", details: errorText }, { status: response.status });
    }

    // Mengambil respons sebagai teks terlebih dahulu
    const responseText = await response.text();

    // Jika teks respons kosong, kembalikan array kosong yang valid
    // Ini adalah perbaikan untuk "Unexpected end of JSON input"
    if (!responseText.trim()) {
      return NextResponse.json([]);
    }

    // Jika tidak kosong, baru coba parse sebagai JSON
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      // Menangani kasus jika respons tidak kosong tapi bukan JSON valid
      return NextResponse.json({ message: 'Gagal memproses data dari server eksternal.', details: responseText }, { status: 500 });
    }
    
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda." }, { status: 500 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan yang tidak diketahui"}, {status:500})
  }
}