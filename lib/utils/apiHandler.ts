// lib/utils/apiHandler.ts
import { NextRequest, NextResponse } from 'next/server';
// Kita masih butuh getQueryFromCache, tapi deleteQueryFromCache tidak lagi dipakai di sini
import { getQueryFromCache, deleteQueryFromCache } from '@/app/api/search/initiate/route';

interface FetchOptions {
  errorMessage?: string;
  emptyResponseValue?: any;
}

export async function handleApiRequest(
  request: NextRequest,
  buildApiUrl: (query: string) => string,
  options: FetchOptions = {}
) {
  const { searchParams } = new URL(request.url);
  const searchKey = searchParams.get('key');
  let query: string | null = null;

  if (!searchKey) {
    return NextResponse.json({ message: 'Akses tidak diizinkan.' }, { status: 401 });
  }

  const cachedQuery = getQueryFromCache(searchKey);

  if (cachedQuery) {
    query = cachedQuery;
    // HAPUS BARIS INI: deleteQueryFromCache(searchKey);
  } else if (searchParams.has('fallback_q')) {
    query = searchParams.get('fallback_q');
  }

  if (!query) {
    return NextResponse.json({ message: 'Sesi pencarian tidak valid atau telah kedaluwarsa. Silakan lakukan pencarian baru.' }, { status: 404 });
  }

  // ... (sisa kode tetap sama)
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

// Fungsi handleDetailApiRequest tidak perlu diubah
export async function handleDetailApiRequest(
  request: NextRequest,
  paramName: string,
  buildApiUrl: (paramValue: string) => string
) {
  // ... (kode di sini tidak berubah)
  const paramValue = request.nextUrl.searchParams.get(paramName);

  if (!paramValue) {
    return NextResponse.json({ message: `Parameter query "${paramName}" is required` }, { status: 400 });
  }

  const apiUrl = buildApiUrl(paramValue);

  try {
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
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