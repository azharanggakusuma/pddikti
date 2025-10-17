// app/api/pt/logo/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return new NextResponse('Parameter "id" dibutuhkan', { status: 400 });
  }

  const apiUrl = `https://api-pddikti.ridwaanhall.com/pt/logo/${id}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return new NextResponse(`Gagal mengambil logo: ${response.statusText}`, {
        status: response.status,
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/png';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache gambar selama 1 hari
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ message: `Terjadi kesalahan pada server: ${error.message}` }),
        { status: 500 }
      );
    }
    return new NextResponse(
      JSON.stringify({ message: 'Terjadi kesalahan tidak diketahui saat memproses data.' }),
      { status: 500 }
    );
  }
}