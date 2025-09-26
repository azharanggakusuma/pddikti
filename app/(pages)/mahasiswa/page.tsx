// app/mahasiswa/page.tsx
import { Suspense } from 'react';
import MahasiswaPageClient from './MahasiswaPageClient';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const PageSkeleton = () => {
    const breadcrumbItems = [{ label: "Mahasiswa" }];
    return (
        <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center antialiased bg-gray-50 text-gray-800">
            <main className="w-full max-w-4xl mx-auto">
                <Breadcrumbs items={breadcrumbItems} />
                <div className="grid grid-cols-1 gap-5 mt-12">
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </main>
        </div>
    );
};

export default function MahasiswaPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MahasiswaPageClient />
    </Suspense>
  );
}