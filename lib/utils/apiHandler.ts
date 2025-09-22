// lib/utils/apiHandler.ts
import { NextRequest, NextResponse } from 'next/server';

// Opsi untuk kustomisasi, jika diperlukan di masa depan
interface FetchOptions {
  errorMessage?: string;
  emptyResponseValue?: any; // Nilai default jika respons kosong (misal: [])
}

/**
 * Helper untuk menangani request ke API eksternal PDDIKTI.
 * Mengenkapsulasi logika fetch, error handling, dan parsing JSON.
 * @param request - Objek NextRequest yang masuk.
 * @param buildApiUrl - Fungsi untuk membangun URL API eksternal berdasarkan query.
 * @param options - Opsi kustomisasi.
 */
export async function handleApiRequest(
  request: NextRequest,
  buildApiUrl: (query: string) => string,
  options: FetchOptions = {}
) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: 'Query parameter "q" is required' }, { status: 400 });
  }

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
      return NextResponse.json(emptyResponseValue);
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
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
 * Mengenkapsulasi logika fetch, error handling, dan parsing JSON untuk endpoint detail.
 * @param request - Objek NextRequest yang masuk.
 * @param paramName - Nama parameter yang dicari (misalnya "id").
 * @param buildApiUrl - Fungsi untuk membangun URL API eksternal berdasarkan nilai parameter.
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