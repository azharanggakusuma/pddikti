// components/ProdiByPtSearchableSelect.tsx
'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Loader2, BookOpen, Info } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import type { ProgramStudi, PerguruanTinggi } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/useDebounce';

// Portal (fix stacking context)
interface PortalProps { children: React.ReactNode }
const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;
  const root = document.getElementById('portal-root') || (() => {
    const el = document.createElement('div'); el.id = 'portal-root'; document.body.appendChild(el); return el;
  })();
  return createPortal(children, root);
};

interface ProdiByPtSearchableSelectProps {
  value: ProgramStudi | null;
  onChange: (value: ProgramStudi | null) => void;
  selectedPt: PerguruanTinggi | null;
  placeholder?: string;
}

export const ProdiByPtSearchableSelect: React.FC<ProdiByPtSearchableSelectProps> = ({
  value, onChange, selectedPt, placeholder = 'Pilih program studi...'
}) => {
  // --- STATE & REFS (logika inti tetap) ---
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<ProgramStudi[]>([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [activeIndex, setActiveIndex] = useState(-1);

  const controlRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // key unik PT utk kontrol refetch
  const ptKey = selectedPt ? (selectedPt.id?.toString() || selectedPt.nama.toLowerCase()) : '';
  const lastFetchedPtKeyRef = useRef<string>(''); // menyimpan PT terakhir yang sudah difetch

  // helper label konsisten
  const itemLabel = useCallback((o: ProgramStudi) => `${o.jenjang} - ${o.nama}`, []);

  // Reset ketika PT berganti
  useEffect(() => {
    onChange(null);
    setSearchTerm('');
    setOptions([]);
    setActiveIndex(-1);
    setIsOpen(false);
    // jangan reset lastFetchedPtKeyRef di sini—biar saat pindah PT, key beda & akan fetch
  }, [selectedPt, onChange]);

  const openDropdown = () => {
    if (!selectedPt) return;
    setIsOpen(true);
    if (value) setSearchTerm(itemLabel(value));
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const updateCoords = useCallback(() => {
    const el = controlRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.top + window.scrollY + r.height, left: r.left + window.scrollX, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateCoords();
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener('resize', updateCoords, opts);
    window.addEventListener('scroll', updateCoords, opts);
    return () => {
      window.removeEventListener('resize', updateCoords, opts as any);
      window.removeEventListener('scroll', updateCoords, opts as any);
    };
  }, [isOpen, updateCoords]);

  // --- FETCH (tetap, tapi skip kalau sudah pernah dimuat untuk PT yang sama) ---
  const fetchProdi = useCallback(async () => {
    if (!selectedPt) { setOptions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/prodi?q=${encodeURIComponent(selectedPt.nama)}`);
      const data = await res.json();
      const filtered = Array.isArray(data)
        ? (data as ProgramStudi[]).filter(p => p.pt.toLowerCase() === selectedPt.nama.toLowerCase())
        : [];
      setOptions(filtered);
      lastFetchedPtKeyRef.current = ptKey; // tandai PT ini sudah dimuat
    } catch (e) {
      console.error('Gagal mengambil data prodi:', e);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPt, ptKey]);

  // Fetch saat buka — HANYA jika belum ada data utk PT ini
  useEffect(() => {
    if (!isOpen) return;
    const alreadyLoadedForThisPt = lastFetchedPtKeyRef.current === ptKey && options.length > 0;
    if (!alreadyLoadedForThisPt) {
      // belum pernah dimuat utk PT ini → fetch
      fetchProdi();
    }
    // kalau sudah pernah dimuat & masih ada options, jangan fetch dan jangan tampilkan loading
  }, [isOpen, ptKey, options.length, fetchProdi]);

  // --- Filter (tetap) ---
  const filteredOptions = useMemo(() => {
    const q = debouncedSearchTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => itemLabel(o).toLowerCase().includes(q));
  }, [options, debouncedSearchTerm, itemLabel]);

  // --- Select / Clear ---
  const handleSelect = (opt: ProgramStudi) => {
    onChange(opt);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(null);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!document.activeElement || !document.activeElement.closest('.prodi-by-pt-select-dropdown-portal')) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }, 150);
  };

  // --- Keyboard nav (match komponen PT) ---
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % Math.max(filteredOptions.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + Math.max(filteredOptions.length, 1)) % Math.max(filteredOptions.length, 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        e.preventDefault();
        handleSelect(filteredOptions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    if (!listRef.current || activeIndex < 0) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // outside click
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (ev: MouseEvent) => {
      const t = ev.target as Node;
      const inControl = controlRef.current?.contains(t);
      const inPortal = (t as HTMLElement).closest?.('.prodi-by-pt-select-dropdown-portal');
      if (!inControl && !inPortal) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen]);

  // --- Animasi & helper UI ---
  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98, y: -6 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 26 } },
    exit: { opacity: 0, scale: 0.98, y: -6, transition: { duration: 0.12 } }
  };

  const helper = () => {
    if (!selectedPt) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info size={16} className="text-gray-400" />
          <span>Pilih perguruan tinggi terlebih dahulu.</span>
        </div>
      );
    }
    // tampilkan "Memuat…" hanya bila belum ada data sama sekali
    if (loading && options.length === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 size={16} className="animate-spin" />
          <span>Memuat program studi…</span>
        </div>
      );
    }
    if (!loading && !debouncedSearchTerm) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info size={16} className="text-gray-400" />
          <span>Ketik untuk memfilter daftar prodi.</span>
        </div>
      );
    }
    if (!loading && filteredOptions.length === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info size={16} className="text-gray-400" />
          <span>Tidak ada hasil untuk “<strong className="text-gray-700">{debouncedSearchTerm}</strong>”.</span>
        </div>
      );
    }
    return null;
  };

  // highlight (UI)
  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-yellow-100 text-inherit rounded px-0.5">{text.slice(i, i + q.length)}</mark>
        {text.slice(i + q.length)}
      </>
    );
  };

  const isDisabled = !selectedPt;

  return (
    <div className="relative w-full" ref={controlRef}>
      {/* SINGLE INPUT (gabung select + search) */}
      {isOpen ? (
        <div className={`relative ${isDisabled ? 'pointer-events-none' : ''}`}>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="prodi-listbox"
            aria-activedescendant={activeIndex >= 0 ? `prodi-opt-${activeIndex}` : undefined}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setActiveIndex(-1); }}
            onKeyDown={onKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full h-12 pl-11 pr-4 text-base bg-white border border-blue-400 rounded-lg outline-none
                       ring-2 ring-blue-400/60 ring-offset-1 placeholder:text-gray-400
                       focus:ring-blue-500/70 focus:border-blue-500 transition-all"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={openDropdown}
          className={`flex items-center w-full h-12 px-4 text-left rounded-lg transition-all duration-200
            ${isDisabled
              ? 'bg-gray-100 border border-gray-200 cursor-not-allowed'
              : 'bg-white border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1'}`}
          aria-haspopup="listbox"
          aria-expanded={false}
          aria-disabled={isDisabled}
        >
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <BookOpen className={value ? 'text-blue-600 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} size={20} />
            <div className="flex-grow min-w-0">
              {value ? (
                <p className="text-sm font-medium text-gray-900 truncate">{itemLabel(value)}</p>
              ) : (
                <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isDisabled ? 'Pilih perguruan tinggi dahulu' : placeholder}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 ml-2">
            {value && !isDisabled && (
              <span className="mr-1">
                <X
                  size={18}
                  className="text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  aria-label="Bersihkan pilihan"
                />
              </span>
            )}
            <ChevronDown size={20} className="text-gray-400" aria-hidden />
          </div>
        </button>
      )}

      {/* Dropdown (tanpa input kedua) */}
      <AnimatePresence>
        {isOpen && (
          <Portal>
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ position: 'absolute', top: `${coords.top + 8}px`, left: `${coords.left}px`, width: `${coords.width}px` }}
              className="prodi-by-pt-select-dropdown-portal z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80
                         border border-gray-200 rounded-xl shadow-2xl shadow-gray-200/70 flex flex-col"
            >
              {/* Header helper (status/info) */}
              <div className="px-3 pt-2 pb-2 border-b border-gray-100">
                {helper()}
              </div>

              {/* List hasil */}
              <div className="max-h-80 overflow-y-auto">
                <ul
                  id="prodi-listbox"
                  role="listbox"
                  aria-label="Daftar program studi"
                  ref={listRef}
                  className="divide-y divide-gray-100"
                >
                  {/* Skeleton hanya saat belum ada data sama sekali */}
                  {loading && options.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                    <li key={`sk-${i}`} className="px-4 py-3">
                      <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse mb-2" />
                      <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
                    </li>
                  ))}

                  {filteredOptions.map((opt, idx) => {
                    const isActive = idx === activeIndex;
                    const label = itemLabel(opt);
                    return (
                      <li
                        id={`prodi-opt-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        key={opt.id}
                        onMouseDown={() => handleSelect(opt)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`px-4 py-3 cursor-pointer transition-colors group
                                   ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-start gap-2">
                          <BookOpen size={16} className={`mt-[2px] ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          <div className="min-w-0">
                            <p className={`text-sm ${isActive ? 'text-blue-700 font-semibold' : 'text-gray-900 font-medium'}`}>
                              {highlight(label, debouncedSearchTerm)}
                            </p>
                            {opt.pt && (
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                <span className="truncate inline-block max-w-[16rem] align-bottom">{opt.pt}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}

                  {!loading && filteredOptions.length === 0 && (
                    <li className="px-4 py-8 text-sm text-gray-500 text-center">
                      <Info size={20} className="mx-auto mb-2 text-gray-300" />
                      Tidak ada program studi ditemukan.
                    </li>
                  )}
                </ul>
              </div>

              {/* Footer hint — adaptif */}
              <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-500">
                <div className="flex sm:hidden justify-between">
                  <span>Tap untuk memilih</span>
                  <span>Geser untuk scroll</span>
                </div>
                <div className="hidden sm:flex justify-between">
                  <span>
                    Gunakan <kbd className="px-1.5 py-0.5 rounded border bg-gray-50">↑</kbd>/
                    <kbd className="px-1.5 py-0.5 rounded border bg-gray-50">↓</kbd> lalu
                    <kbd className="px-1.5 py-0.5 rounded border bg-gray-50 ml-1">Enter</kbd>
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded border bg-gray-50">Esc</kbd> untuk menutup
                  </span>
                </div>
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
};
