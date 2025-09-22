// app/api/stats/route.ts
import { NextResponse } from 'next/server';

// Fungsi untuk mengambil data dengan penanganan error dasar
async function fetchStat(url: string, key: string, fallbackValue: any = 0) {
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache data selama 1 jam
    });
    if (!response.ok) return { [key]: fallbackValue };
    const data = await response.json();
    // Mengakses kunci yang mungkin berbeda ('jumlah' atau 'jumlah_mahasiswa', dll)
    return { [key]: data[Object.keys(data)[0]] || fallbackValue };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return { [key]: fallbackValue };
  }
}

export async function GET() {
  try {
    const results = await Promise.all([
      fetchStat('https://api-pddikti.ridwaanhall.com/stats/mhs-count-active/?format=json', 'mahasiswa'),
      fetchStat('https://api-pddikti.ridwaanhall.com/stats/dosen-count-active/?format=json', 'dosen'),
      fetchStat('https://api-pddikti.ridwaanhall.com/stats/prodi-count/?format=json', 'prodi'),
      fetchStat('https://api-pddikti.ridwaanhall.com/stats/pt-count/?format=json', 'pt')
    ]);

    // Menggabungkan semua hasil menjadi satu objek
    const stats = results.reduce((acc, current) => ({ ...acc, ...current }), {});

    return NextResponse.json(stats);

  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan tidak diketahui" }, { status: 500 });
  }
}