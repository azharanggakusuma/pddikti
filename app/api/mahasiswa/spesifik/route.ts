// app/api/mahasiswa/spesifik/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { Mahasiswa } from '@/app/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nim = searchParams.get('nim');
  const nama_prodi = searchParams.get('nama_prodi');
  const nama_pt = searchParams.get('nama_pt');

  if (!nim || !nama_prodi || !nama_pt) {
    return NextResponse.json({ message: 'Parameter "nim", "nama_prodi", dan "nama_pt" dibutuhkan' }, { status: 400 });
  }
  
  // API PDDIKTI lebih efektif mencari berdasarkan nama, jadi kita cari semua mahasiswa dengan NIM tersebut
  // lalu filter di backend.
  const encodedQuery = encodeURIComponent(nim);
  const apiUrl = `https://api-pddikti.ridwaanhall.com/search/mhs/${encodedQuery}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ message: `Error dari API PDDIKTI: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return NextResponse.json(null, { status: 404 });
    }

    const data: Mahasiswa[] = JSON.parse(responseText);

    // Cari kecocokan eksak berdasarkan NIM, Nama Prodi, dan Nama PT
    const specificMahasiswa = data.find(
      (mhs) =>
        mhs.nim.trim().toLowerCase() === nim.trim().toLowerCase() &&
        mhs.nama_prodi.trim().toLowerCase() === nama_prodi.trim().toLowerCase() &&
        mhs.nama_pt.trim().toLowerCase() === nama_pt.trim().toLowerCase()
    );

    if (specificMahasiswa) {
      return NextResponse.json(specificMahasiswa);
    } else {
      return NextResponse.json(null, { status: 404 });
    }

  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan tidak diketahui"}, {status:500})
  }
}