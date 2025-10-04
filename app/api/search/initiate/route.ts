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

    // Tetap hapus otomatis setelah 10 menit sebagai fallback
    setTimeout(() => {
      queryCache.delete(searchKey);
    }, 10 * 60 * 1000); // 10 menit

    return NextResponse.json({ key: searchKey, query: query });

  } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export function getQueryFromCache(key: string): string | undefined {
  return queryCache.get(key);
}

// --- TAMBAHAN DI SINI ---
// Fungsi untuk menghapus key setelah digunakan
export function deleteQueryFromCache(key: string): void {
  queryCache.delete(key);
}