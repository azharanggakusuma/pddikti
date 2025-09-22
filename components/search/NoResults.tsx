// components/search/NoResults.tsx
import { FileX, Search } from 'lucide-react';

interface NoResultsProps {
  query: string;
  suggestion?: string | null;
  onSuggestionClick?: (suggestion: string) => void;
}

export const NoResults = ({ query, suggestion, onSuggestionClick }: NoResultsProps) => {
  if (!query) {
    return (
      <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-10 sm:p-16 rounded-xl flex flex-col items-center justify-center">
        <Search size={56} className="text-gray-300" />
        <h3 className="mt-6 font-bold text-lg sm:text-xl text-gray-700">
          Mulai Pencarian Anda
        </h3>
        <p className="text-sm sm:text-base mt-1">
          Gunakan kotak pencarian di atas untuk menemukan data.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-10 sm:p-16 rounded-xl flex flex-col items-center justify-center">
      <FileX size={56} className="text-gray-300" />
      <h3 className="mt-6 font-bold text-lg sm:text-xl text-gray-700">
        Tidak Ada Hasil Ditemukan
      </h3>
      <p className="text-sm sm:text-base mt-1">
        Coba sesuaikan filter atau kata kunci pencarian Anda.
      </p>
      {suggestion && onSuggestionClick && (
        <p className="text-sm sm:text-base mt-4">
          Mungkin maksud Anda:{" "}
          <button
            onClick={() => onSuggestionClick(suggestion)}
            className="text-blue-600 hover:underline font-semibold"
          >
            {suggestion}
          </button>
        </p>
      )}
    </div>
  );
};