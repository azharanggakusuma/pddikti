// app/api/search/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Cache sederhana di memori server untuk menyimpan query sementara.
const queryCache = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ message: 'Parameter "query" dibutuhkan' }, { status: 400 });
    }

    const searchKey = randomBytes(8).toString('hex');
    queryCache.set(searchKey, query);

    setTimeout(() => {
      queryCache.delete(searchKey);
    }, 10 * 60 * 1000); // 10 menit

    // PERUBAHAN: Kembalikan juga query-nya
    return NextResponse.json({ key: searchKey, query: query });

  } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export function getQueryFromCache(key: string): string | undefined {
  return queryCache.get(key);
}