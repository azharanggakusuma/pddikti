// app/components/ProdiSearchableSelect.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X, Loader2, School, BookOpen } from 'lucide-react';
import { ProgramStudi } from '@/app/types';
import { useDebounce } from '@/app/hooks/useDebounce'; // Kita akan buat hook ini

interface ProdiSearchableSelectProps {
    value: ProgramStudi | null;
    onChange: (value: ProgramStudi | null) => void;
    placeholder?: string;
}

export const ProdiSearchableSelect = ({ value, onChange, placeholder = "Pilih..." }: ProdiSearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [options, setOptions] = useState<ProgramStudi[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchProdi = useCallback(async (query: string) => {
        if (query.length < 3) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`/api/prodi?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setOptions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Gagal mengambil data prodi:", error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProdi(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchProdi]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleSelect = (option: ProgramStudi) => {
        onChange(option);
        setSearchTerm("");
        setOptions([]);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setSearchTerm("");
        setOptions([]);
    }

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {value ? (
                <div className="w-full p-3 text-left bg-white border border-gray-300 rounded-lg flex justify-between items-center">
                    <div className="flex-grow">
                        <p className="text-sm font-semibold text-gray-800">{value.jenjang} - {value.nama}</p>
                        <p className="text-xs text-gray-500">{value.pt}</p>
                    </div>
                    <button type="button" onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-3 pr-10 text-left bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex justify-between items-center"
                >
                    <span className="text-gray-500">{placeholder}</span>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            )}

            {isOpen && !value && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 flex flex-col">
                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ketik nama prodi atau PT..."
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                             {loading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                        </div>
                    </div>
                    <ul className="overflow-y-auto flex-grow">
                        {options.length > 0 ? (
                            options.map(option => (
                                <li
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    className="p-3 cursor-pointer hover:bg-blue-50 text-gray-800 border-b border-gray-100 last:border-b-0"
                                >
                                    <p className="font-semibold text-sm">{option.jenjang} - {option.nama}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1"><School size={12}/> {option.pt}</p>
                                </li>
                            ))
                        ) : (
                            !loading && searchTerm.length >= 3 && <li className="p-3 text-sm text-gray-500 text-center">Tidak ada hasil ditemukan.</li>
                        )}
                         {!loading && searchTerm.length < 3 && <li className="p-3 text-sm text-gray-500 text-center">Ketik minimal 3 huruf untuk mencari.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
};