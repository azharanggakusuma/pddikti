// app/api/prodi/route.ts
import { NextRequest } from 'next/server';
import { handleApiRequest } from '@/lib/utils/apiHandler';

export async function GET(request: NextRequest) {
  const buildApiUrl = (query: string) => `https://api-pddikti.ridwaanhall.com/search/prodi/${query}/?format=json`;
  return handleApiRequest(request, buildApiUrl);
}