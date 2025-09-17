'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchableSelect = ({ options, value, onChange, placeholder = "Pilih..." }: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => 
        options.filter(option => 
            option.toLowerCase().includes(searchTerm.toLowerCase())
        ), [options, searchTerm]
    );

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2 pr-10 text-left bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex justify-between items-center"
            >
                <span className={value === 'Semua' ? 'text-gray-500' : 'text-gray-800'}>{value}</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 flex flex-col">
                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                            <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari opsi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <ul className="overflow-y-auto flex-grow">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <li
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    className={`p-2 text-sm cursor-pointer hover:bg-blue-50 ${value === option ? 'bg-blue-100 text-blue-700' : 'text-gray-800'}`}
                                >
                                    {option}
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-sm text-gray-500 text-center">Tidak ada hasil</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};