// app/components/ProdiByPtSearchableSelect.tsx
'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Loader2, BookOpen, University, Info } from 'lucide-react';
import { ProgramStudi, PerguruanTinggi } from '@/app/types';
import { useDebounce } from '@/app/hooks/useDebounce';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Import Variants

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


interface ProdiByPtSearchableSelectProps {
    value: ProgramStudi | null;
    onChange: (value: ProgramStudi | null) => void;
    selectedPt: PerguruanTinggi | null;
    placeholder?: string;
}

export const ProdiByPtSearchableSelect = ({ value, onChange, selectedPt, placeholder = "Pilih program studi..." }: ProdiByPtSearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [options, setOptions] = useState<ProgramStudi[]>([]);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState<{ top: number, left: number, width: number }>({ top: 0, left: 0, width: 0 });
    
    const controlRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Reset when selectedPt changes
    useEffect(() => {
        onChange(null);
        setSearchTerm("");
        setOptions([]);
    }, [selectedPt, onChange]);

    const openDropdown = () => {
        if (!selectedPt) return;
        setIsOpen(true);
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
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

    const fetchProdi = useCallback(async () => {
        if (!selectedPt) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            // Gunakan nama PT sebagai query untuk mendapatkan semua prodinya
            const response = await fetch(`/api/prodi?q=${encodeURIComponent(selectedPt.nama)}`);
            const data = await response.json();
            const filteredData = Array.isArray(data) 
                ? data.filter((prodi: ProgramStudi) => prodi.pt.toLowerCase() === selectedPt.nama.toLowerCase()) 
                : [];
            setOptions(filteredData);
        } catch (error) {
            console.error("Gagal mengambil data prodi:", error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, [selectedPt]);

    // Fetch prodi saat dropdown dibuka
    useEffect(() => {
        if (isOpen) {
            fetchProdi();
        }
    }, [isOpen, fetchProdi]);

    const filteredOptions = useMemo(() => {
        if (!debouncedSearchTerm) return options;
        return options.filter(option => 
            `${option.jenjang} ${option.nama}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [options, debouncedSearchTerm]);


    const handleSelect = (option: ProgramStudi) => {
        onChange(option);
        setSearchTerm("");
        setIsOpen(false);
    };

    const handleClear = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        onChange(null);
        setSearchTerm("");
        setIsOpen(false);
    };
    
    const handleBlur = () => {
        setTimeout(() => {
            if (!document.activeElement || !document.activeElement.closest('.prodi-by-pt-select-dropdown-portal')) {
                setIsOpen(false);
                setSearchTerm("");
            }
        }, 150);
    };

    const dropdownVariants: Variants = { // Add the Variants type here
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } },
        exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.1 } }
    };

    const isDisabled = !selectedPt;

    return (
        <div className="relative w-full" ref={controlRef}>
            {/* --- PERBAIKAN DI BARIS DI BAWAH INI --- */}
            <div 
                onClick={openDropdown}
                className={`flex items-center w-full h-12 px-4 text-left bg-white border border-gray-300 rounded-lg transition-all duration-200 ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
            >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <BookOpen className={value ? 'text-blue-600 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} size={20} />
                    <div className="flex-grow min-w-0">
                        {value ? (
                            <p className="text-sm font-semibold text-gray-800 truncate">{value.jenjang} - {value.nama}</p>
                        ) : (
                            <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{isDisabled ? 'Pilih perguruan tinggi dahulu' : placeholder}</p>
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

            <AnimatePresence>
                {isOpen && (
                     <Portal>
                        <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ position: 'absolute', top: `${coords.top + 8}px`, left: `${coords.left}px`, width: `${coords.width}px` }}
                            className="prodi-by-pt-select-dropdown-portal bg-white border border-gray-200 rounded-lg shadow-2xl shadow-gray-200/60 z-50 max-h-72 flex flex-col"
                        >
                            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onBlur={handleBlur}
                                        placeholder="Ketik untuk memfilter prodi..."
                                        className="w-full pl-9 pr-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto">
                                <ul>
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
                                            <Loader2 size={16} className="animate-spin" /><p>Memuat program studi...</p>
                                        </div>
                                    ) : filteredOptions.length > 0 ? (
                                        filteredOptions.map(option => (
                                            <li key={option.id} onMouseDown={() => handleSelect(option)} className="p-4 cursor-pointer hover:bg-blue-50 text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors">
                                                <p className="font-semibold text-sm flex items-center gap-2"><BookOpen size={14}/> {option.jenjang} - {option.nama}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center p-8 text-sm text-gray-500">
                                            <Info size={32} className="text-gray-300 mb-4" />
                                            <p>Tidak ada program studi ditemukan.</p>
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