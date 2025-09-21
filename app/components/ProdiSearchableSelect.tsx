// app/components/ProdiSearchableSelect.tsx
'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Loader2, BookOpen, University, Info } from 'lucide-react';
import { ProgramStudi } from '@/app/types';
import { useDebounce } from '@/app/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

// Portal Component for stacking context fix
interface PortalProps {
  children: React.ReactNode;
}
const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;
  const portalRoot = document.getElementById('portal-root') || (() => {
    const newRoot = document.createElement('div');
    newRoot.id = 'portal-root';
    document.body.appendChild(newRoot);
    return newRoot;
  })();
  return createPortal(children, portalRoot);
};


interface ProdiSearchableSelectProps {
    value: ProgramStudi | null;
    onChange: (value: ProgramStudi | null) => void;
    placeholder?: string;
}

export const ProdiSearchableSelect = ({ value, onChange, placeholder = "Ketik untuk mencari prodi..." }: ProdiSearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [options, setOptions] = useState<ProgramStudi[]>([]);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState<{ top: number, left: number, width: number }>({ top: 0, left: 0, width: 0 });
    
    const controlRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const openDropdown = () => {
        setIsOpen(true);
        if (value) {
            setSearchTerm(`${value.jenjang} - ${value.nama}`);
        }
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    const updateCoords = useCallback(() => {
        if (controlRef.current) {
            const rect = controlRef.current.getBoundingClientRect();
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
            window.addEventListener('resize', updateCoords, true);
            window.addEventListener('scroll', updateCoords, true);
        }
        return () => {
            window.removeEventListener('resize', updateCoords, true);
            window.removeEventListener('scroll', updateCoords, true);
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

    const handleSelect = (option: ProgramStudi) => {
        onChange(option);
        setSearchTerm("");
        setOptions([]);
        setIsOpen(false);
    };

    const handleClear = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        onChange(null);
        setSearchTerm("");
        setOptions([]);
        setIsOpen(false);
    };
    
    const handleBlur = () => {
        setTimeout(() => {
            if (!document.activeElement || !document.activeElement.closest('.prodi-select-dropdown-portal')) {
                setIsOpen(false);
                setSearchTerm("");
            }
        }, 150);
    };

    const dropdownVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } },
        exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.1 } }
    };

    return (
        <div className="relative w-full" ref={controlRef}>
            {isOpen ? (
                // --- Input Mode ---
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className="w-full h-12 pl-11 pr-4 text-base bg-white border border-blue-400 rounded-lg outline-none ring-2 ring-blue-400 ring-offset-1"
                    />
                </div>
            ) : (
                // --- Display Mode ---
                <div 
                    onClick={openDropdown}
                    className="flex items-center w-full h-12 px-4 text-left bg-white border border-gray-300 rounded-lg transition-all duration-200 cursor-pointer hover:border-gray-400"
                >
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                        {value ? (
                            <BookOpen className="text-blue-600 flex-shrink-0" size={20} />
                        ) : (
                            <Search className="text-gray-400 flex-shrink-0" size={20} />
                        )}
                        <div className="flex-grow min-w-0">
                            {value ? (
                                <>
                                    <p className="text-sm font-semibold text-gray-800 truncate">{value.jenjang} - {value.nama}</p>
                                    <p className="text-xs text-gray-500 truncate">{value.pt}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">{placeholder}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-2">
                        {value && (
                            <button type="button" onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={16} />
                            </button>
                        )}
                        <ChevronDown size={20} className="text-gray-400" />
                    </div>
                </div>
            )}

            {/* Dropdown Menu via Portal */}
            <AnimatePresence>
                {isOpen && (
                     <Portal>
                        <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ position: 'absolute', top: `${coords.top + 8}px`, left: `${coords.left}px`, width: `${coords.width}px` }}
                            className="prodi-select-dropdown-portal bg-white border border-gray-200 rounded-lg shadow-2xl shadow-gray-200/60 z-50 max-h-72 flex flex-col"
                        >
                            <div className="flex-grow overflow-y-auto">
                                <ul>
                                    {options.length > 0 ? (
                                        options.map(option => (
                                            <li key={option.id} onMouseDown={() => handleSelect(option)} className="p-4 cursor-pointer hover:bg-blue-50 text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors">
                                                <p className="font-semibold text-sm flex items-center gap-2"><BookOpen size={14}/> {option.jenjang} - {option.nama}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-2 mt-1 pl-6"><University size={12}/> {option.pt}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center p-8 text-sm text-gray-500">
                                            <Info size={32} className="text-gray-300 mb-4" />
                                            {!loading && debouncedSearchTerm.length < 3 && <p>Ketik minimal <strong className="text-gray-600">3 huruf</strong> untuk memulai.</p>}
                                            {!loading && debouncedSearchTerm.length >= 3 && <p>Prodi <strong className="text-gray-600">"{debouncedSearchTerm}"</strong> tidak ditemukan.</p>}
                                            {loading && <div className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /><p>Mencari...</p></div>}
                                        </div>
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