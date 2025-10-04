// lib/utils/apiHandler.ts
import { NextRequest, NextResponse } from 'next/server';
// Impor fungsi deleteQueryFromCache yang baru dibuat
import { getQueryFromCache, deleteQueryFromCache } from '@/app/api/search/initiate/route';

// Opsi untuk kustomisasi, jika diperlukan di masa depan
interface FetchOptions {
  errorMessage?: string;
  emptyResponseValue?: any;
}

/**
 * Helper untuk menangani request ke API eksternal PDDIKTI.
 * Alur ini sekarang MEWAJIBKAN penggunaan 'key' yang didapat dari /api/search/initiate.
 */
export async function handleApiRequest(
  request: NextRequest,
  buildApiUrl: (query: string) => string,
  options: FetchOptions = {}
) {
  const { searchParams } = new URL(request.url);
  const searchKey = searchParams.get('key');

  // --- LOGIKA KEAMANAN ---

  // 1. Jika tidak ada 'key', langsung tolak permintaan.
  if (!searchKey) {
    // --- PERUBAHAN PESAN ERROR DI SINI ---
    return NextResponse.json({ message: 'Akses tidak diizinkan.' }, { status: 401 });
  }

  // 2. Ambil query dari cache menggunakan 'key'.
  const query = getQueryFromCache(searchKey);

  // 3. Jika query tidak ditemukan (key salah atau kedaluwarsa), tolak permintaan.
  if (!query) {
    return NextResponse.json({ message: 'Sesi pencarian tidak valid atau telah kedaluwarsa. Silakan lakukan pencarian baru.' }, { status: 404 });
  }

  // 4. (PENTING) Langsung hapus key dari cache agar tidak bisa digunakan lagi.
  deleteQueryFromCache(searchKey);

  // --- AKHIR LOGIKA KEAMANAN ---


  const {
    errorMessage = 'Gagal mem-parsing data dari API eksternal.',
    emptyResponseValue = [],
  } = options;

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = buildApiUrl(encodedQuery);

  try {
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ message: `Error from PDDIKTI API: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return NextResponse.json({ data: emptyResponseValue, query });
    }

    try {
      const data = JSON.parse(responseText);
      // Sertakan query asli dalam response agar bisa ditampilkan di UI
      return NextResponse.json({ data, query });
    } catch (e) {
      return NextResponse.json({ message: errorMessage, details: responseText }, { status: 500 });
    }

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  }
}


/**
 * Helper untuk menangani request ke API detail PDDIKTI.
 * (Fungsi ini tidak perlu diubah karena sudah aman menggunakan ID unik)
 */
export async function handleDetailApiRequest(
  request: NextRequest,
  paramName: string,
  buildApiUrl: (paramValue: string) => string
) {
  const paramValue = request.nextUrl.searchParams.get(paramName);

  if (!paramValue) {
    return NextResponse.json({ message: `Parameter query "${paramName}" is required` }, { status: 400 });
  }

  const apiUrl = buildApiUrl(paramValue);

  try {
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Revalidasi cache setiap 1 jam
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ message: `Error from PDDIKTI Detail API: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  }
}