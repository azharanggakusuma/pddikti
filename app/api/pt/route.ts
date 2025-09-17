// app/api/pt/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: 'Query parameter "q" is required' }, { status: 400 });
  }

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api-pddikti.ridwaanhall.com/search/pt/${encodedQuery}/?format=json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ message: `Error from PDDIKTI API: ${response.statusText}`, details: errorText }, { status: response.status });
    }
    
    const responseText = await response.text();

    if (!responseText.trim()) {
      return NextResponse.json([]);
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ message: 'Gagal mem-parsing data dari API eksternal.', details: responseText }, { status: 500 });
    }
    
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "An unknown error occured"}, {status:500})
  }
}