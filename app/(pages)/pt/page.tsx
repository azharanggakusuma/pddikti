// app/(pages)/pt/page.tsx
import { Suspense } from 'react';
import PtPageClient from './PtPageClient';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

const PageSkeleton = () => {
    const breadcrumbItems = [{ label: "Perguruan Tinggi" }];
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

export default function PtPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PtPageClient />
    </Suspense>
  );
}