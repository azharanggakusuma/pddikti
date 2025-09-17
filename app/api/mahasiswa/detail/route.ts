import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Ambil 'id' dari query parameter
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Parameter query "id" is required' }, { status: 400 });
  }

  // URL endpoint yang benar
  const apiUrl = `https://api-pddikti.ridwaanhall.com/mhs/detail/${id}/?format=json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
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
    return NextResponse.json({ message: "An unknown error occured"}, {status:500})
  }
}