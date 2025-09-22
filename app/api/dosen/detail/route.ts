// app/api/dosen/detail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Dosen, DosenDetail } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Parameter "id" dibutuhkan' }, { status: 400 });
  }

  try {
    // 1. Ambil data detail utama dari endpoint profile
    const profileApiUrl = `https://api-pddikti.ridwaanhall.com/dosen/profile/${id}/?format=json`;
    const profileResponse = await fetch(profileApiUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache data selama 1 jam
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      throw new Error(`Gagal mengambil data profil dosen: ${errorData.message || profileResponse.statusText}`);
    }

    const profileData: DosenDetail = await profileResponse.json();

    // 2. Ambil data dari hasil pencarian untuk mendapatkan NIDN dan NUPTK
    const searchApiUrl = `https://api-pddikti.ridwaanhall.com/search/dosen/${encodeURIComponent(profileData.nama_dosen)}/?format=json`;
    const searchResponse = await fetch(searchApiUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    });

    let nidn = '';
    let nuptk = '';

    if (searchResponse.ok) {
      const searchData: Dosen[] = await searchResponse.json();
      
      // 3. Cari dosen yang cocok berdasarkan NAMA dan NAMA PT di dalam hasil pencarian
      const matchingDosen = searchData.find(d => 
        d.nama.trim().toLowerCase() === profileData.nama_dosen.trim().toLowerCase() && 
        d.nama_pt.trim().toLowerCase() === profileData.nama_pt.trim().toLowerCase()
      );

      if (matchingDosen) {
        nidn = matchingDosen.nidn;
        nuptk = matchingDosen.nuptk;
      }
    }

    // 4. Gabungkan kedua data
    const combinedData: DosenDetail = {
      ...profileData,
      nidn: nidn || profileData.nidn, // Fallback jika sudah ada
      nuptk: nuptk || profileData.nuptk, // Fallback jika sudah ada
    };

    return NextResponse.json(combinedData);

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan tidak diketahui" }, { status: 500 });
  }
}