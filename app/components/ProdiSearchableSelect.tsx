// app/components/ProdiSearchableSelect.tsx
'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Loader2, BookOpen, University } from 'lucide-react';
import { ProgramStudi } from '@/app/types';
import { useDebounce } from '@/app/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

interface PortalProps {
  children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }
  
  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) {
    const newRoot = document.createElement('div');
    newRoot.id = 'portal-root';
    document.body.appendChild(newRoot);
    return createPortal(children, newRoot);
  }

  return createPortal(children, portalRoot);
};


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
    const [coords, setCoords] = useState<{ top: number, left: number, width: number }>({ top: 0, left: 0, width: 0 });
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const updateCoords = useCallback(() => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + window.scrollY + rect.height,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, []);
    
    useLayoutEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords);
        }
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords);
        };
    }, [isOpen, updateCoords]);

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
            const target = event.target as HTMLElement;
            if (wrapperRef.current && !wrapperRef.current.contains(target) && !target.closest('.prodi-select-dropdown-portal')) {
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

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearchTerm("");
        setOptions([]);
        setIsOpen(false);
    }

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } },
        exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } }
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {value ? (
                <div className="relative w-full p-3 pl-4 pr-16 text-left bg-blue-50 border-2 border-blue-500 rounded-lg flex items-center gap-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <BookOpen className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{value.jenjang} - {value.nama}</p>
                        <p className="text-xs text-gray-500 truncate">{value.pt}</p>
                    </div>
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
                        <button type="button" onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                            <X size={16} />
                        </button>
                        <ChevronDown size={20} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full p-3 pl-4 pr-10 text-left bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400"
                >
                    <span className="text-gray-500">{placeholder}</span>
                    <ChevronDown size={18} className={`absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <Portal>
                        <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{
                                position: 'absolute',
                                top: `${coords.top + 8}px`,
                                left: `${coords.left}px`,
                                width: `${coords.width}px`,
                            }}
                            className="prodi-select-dropdown-portal bg-white border border-gray-200 rounded-lg shadow-2xl shadow-gray-200/60 z-50 max-h-80 flex flex-col"
                        >
                            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                                <div className="relative">
                                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Ketik nama prodi atau PT..."
                                        autoFocus
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {loading && <Loader2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                                </div>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto">
                                <ul>
                                    {options.length > 0 ? (
                                        options.map(option => (
                                            <li
                                                key={option.id}
                                                onClick={() => handleSelect(option)}
                                                className="p-4 cursor-pointer hover:bg-blue-50 text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors"
                                            >
                                                <p className="font-semibold text-sm flex items-center gap-2"><BookOpen size={14}/> {option.jenjang} - {option.nama}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-2 mt-1 pl-6"><University size={12}/> {option.pt}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-6 text-sm text-gray-500 text-center">
                                            {!loading && debouncedSearchTerm.length < 3 && "Ketik minimal 3 huruf untuk mencari."}
                                            {!loading && debouncedSearchTerm.length >= 3 && "Tidak ada hasil ditemukan."}
                                            {loading && "Mencari..."}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </motion.div>
                    </Portal>
                )}
            </AnimatePresence>
        </div>
    );
};