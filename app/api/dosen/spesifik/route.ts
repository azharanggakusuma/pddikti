// app/api/dosen/spesifik/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { Dosen } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nidn = searchParams.get('nidn');
  const nama_pt = searchParams.get('nama_pt');

  if (!nidn || !nama_pt) {
    return NextResponse.json({ message: 'Parameter "nidn" dan "nama_pt" dibutuhkan' }, { status: 400 });
  }
  
  const encodedQuery = encodeURIComponent(nidn);
  const apiUrl = `https://api-pddikti.ridwaanhall.com/search/dosen/${encodedQuery}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ message: `API eksternal sedang tidak dapat diakses (Status: ${response.status}). Coba beberapa saat lagi.`, details: errorText }, { status: response.status });
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return NextResponse.json(null, { status: 404 });
    }

    let data: Dosen[] = JSON.parse(responseText);

    // --- PERBAIKAN DI SINI ---
    if (!Array.isArray(data)) {
      data = [data];
    }
    // --- AKHIR PERBAIKAN ---

    const specificDosen = data.find(
      (dosen) =>
        dosen.nidn.trim().toLowerCase() === nidn.trim().toLowerCase() &&
        dosen.nama_pt.trim().toLowerCase() === nama_pt.trim().toLowerCase()
    );

    if (specificDosen) {
      return NextResponse.json(specificDosen);
    } else {
      return NextResponse.json(null, { status: 404 });
    }

  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: `Terjadi kesalahan pada server: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan tidak diketahui saat memproses data."}, {status:500})
  }
}