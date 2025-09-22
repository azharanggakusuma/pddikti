// app/components/SkeletonCard.tsx

export const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-200 space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="h-5 w-48 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        </div>
        <div className="pt-4 border-t border-dashed border-gray-200 space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        </div>
    </div>
);