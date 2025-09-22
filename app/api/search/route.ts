// app/api/search/route.ts
import { NextRequest } from 'next/server';
import { handleApiRequest } from '@/lib/utils/apiHandler';

export async function GET(request: NextRequest) {
  const buildApiUrl = (query: string) => `https://api-pddikti.ridwaanhall.com/search/all/${query}/?format=json`;
  
  const options = {
    emptyResponseValue: {
      mahasiswa: null,
      dosen: null,
      pt: null,
      prodi: null,
    },
  };

  return handleApiRequest(request, buildApiUrl, options);
}