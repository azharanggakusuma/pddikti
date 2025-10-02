// components/search/ErrorDisplay.tsx
import { AlertTriangle } from 'lucide-react';

export const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="text-center text-amber-700 bg-amber-50 border-2 border-dashed border-amber-200 p-10 sm:p-16 rounded-xl flex flex-col items-center justify-center">
        <AlertTriangle size={56} className="text-amber-400" />
        <h3 className="mt-6 font-bold text-lg sm:text-xl text-amber-900">
            Terjadi Masalah
        </h3>
        <p className="text-sm sm:text-base mt-1 max-w-md mx-auto">
            {message}
        </p>
    </div>
);