// app/components/SkeletonCard.tsx

export const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-lg p-5 border border-gray-200 space-y-4">
        <div className="flex items-center space-x-4">
            <div className="flex-1 space-y-2">
                <div className="h-5 w-4/5 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-300 rounded-md"></div>
            </div>
        </div>
        <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="h-4 w-full bg-gray-300 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
        </div>
    </div>
);