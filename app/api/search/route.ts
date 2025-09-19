// app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: 'Parameter "q" harus diisi' }, { status: 400 });
  }

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api-pddikti.ridwaanhall.com/search/all/${encodedQuery}/?format=json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ message: "Terjadi gangguan pada layanan pencarian. Silakan coba lagi nanti.", details: errorText }, { status: response.status });
    }

    const responseText = await response.text();

    if (!responseText.trim()) {
      return NextResponse.json({
        mahasiswa: null,
        dosen: null,
        pt: null,
        prodi: null,
      });
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ message: 'Gagal memproses data dari server eksternal.', details: responseText }, { status: 500 });
    }

  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: "Tidak dapat melakukan pencarian, server tidak dapat dihubungi." }, { status: 500 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan yang tidak diketahui"}, {status:500})
  }
}