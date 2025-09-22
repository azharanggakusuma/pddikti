// app/api/pt/detail/route.ts
import { NextRequest } from 'next/server';
import { handleDetailApiRequest } from '@/lib/utils/apiHandler';

export async function GET(request: NextRequest) {
  const buildApiUrl = (id: string) => `https://api-pddikti.ridwaanhall.com/pt/detail/${id}/?format=json`;
  return handleDetailApiRequest(request, 'id', buildApiUrl);
}