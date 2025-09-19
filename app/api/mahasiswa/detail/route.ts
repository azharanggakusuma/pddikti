import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Ambil 'id' dari query parameter
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Parameter query "id" dibutuhkan' }, { status: 400 });
  }

  // URL endpoint eksternal
  const apiUrl = `https://api-pddikti.ridwaanhall.com/mhs/detail/${id}/?format=json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Revalidasi cache setiap 1 jam
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ message: "Gagal mengambil detail data dari server PDDIKTI. Mungkin sedang ada gangguan.", details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda." }, { status: 500 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan yang tidak diketahui"}, {status:500})
  }
}