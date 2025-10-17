// app/api/pt/logo/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Opsional: agar tidak dicache saat build/prerender
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params; // <-- penting: await!

  if (!id) {
    return new NextResponse('Parameter "id" dibutuhkan', { status: 400 });
  }

  const apiUrl = `https://api-pddikti.ridwaanhall.com/pt/logo/${id}`;

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });

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
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? `Terjadi kesalahan pada server: ${error.message}`
        : 'Terjadi kesalahan tidak diketahui saat memproses data.';
    return new NextResponse(JSON.stringify({ message }), { status: 500 });
  }
}
