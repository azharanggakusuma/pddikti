import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: 'Query parameter "q" is required' }, { status: 400 });
  }

  // Menggunakan URL endpoint yang benar sesuai contoh Anda
  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api-pddikti.ridwaanhall.com/search/mhs/${encodedQuery}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        // Meminta respons JSON secara eksplisit
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
        // Coba baca respons sebagai teks jika terjadi error
        const errorText = await response.text();
        return NextResponse.json({ message: `Error from PDDIKTI API: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "An unknown error occured"}, {status:500})
  }
}