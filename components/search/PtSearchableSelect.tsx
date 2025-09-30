// components/PtSearchableSelect.tsx
'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Loader2, University, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PerguruanTinggi } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/useDebounce';

// ---------- Portal (fix stacking context) ----------
interface PortalProps { children: React.ReactNode }
const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;
  const portalRoot = document.getElementById('portal-root') || (() => {
    const el = document.createElement('div');
    el.id = 'portal-root';
    document.body.appendChild(el);
    return el;
  })();
  return createPortal(children, portalRoot);
};

// ---------- Props ----------
interface PtSearchableSelectProps {
  value: PerguruanTinggi | null;
  onChange: (value: PerguruanTinggi | null) => void;
  placeholder?: string;
  apiPath?: string;         // default: /api/pt
  minChars?: number;        // default: 3
  maxItems?: number;        // default: 50
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

// in-memory cache sederhana
const cache = new Map<string, PerguruanTinggi[]>();

export const PtSearchableSelect: React.FC<PtSearchableSelectProps> = ({
  value,
  onChange,
  placeholder = 'Ketik untuk mencari perguruan tinggi...',
  apiPath = '/api/pt',
  minChars = 3,
  maxItems = 50,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<PerguruanTinggi[]>([]);
  const [status, setStatus] = useState<FetchState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const controlRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLUListElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  const debounced = useDebounce(searchTerm, 400);

  // ---------- Helpers ----------
  const openDropdown = useCallback(() => {
    setIsOpen(true);
    if (value) setSearchTerm(value.nama);
  }, [value]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    setSearchTerm('');
  }, []);

  const updateCoords = useCallback(() => {
    if (!controlRef.current) return;
    const rect = controlRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top + window.scrollY + rect.height,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  // ---------- Fetch with cache + cancel ----------
  const fetchPt = useCallback(async (query: string) => {
    if (query.trim().length < minChars) {
      setOptions([]);
      setStatus('idle');
      setErrorMsg(null);
      return;
    }

    const key = `${apiPath}?q=${query.trim().toLowerCase()}`;
    if (cache.has(key)) {
      setOptions(cache.get(key)!.slice(0, maxItems));
      setStatus('success');
      setErrorMsg(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStatus('loading');
    setErrorMsg(null);
    try {
      const res = await fetch(`${apiPath}?q=${encodeURIComponent(query)}`, { signal: ac.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as unknown;
      const arr = Array.isArray(data) ? (data as PerguruanTinggi[]) : [];
      cache.set(key, arr);
      setOptions(arr.slice(0, maxItems));
      setStatus('success');
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Fetch PT error:', err);
      setOptions([]);
      setStatus('error');
      setErrorMsg('Gagal memuat data. Coba lagi.');
    }
  }, [apiPath, maxItems, minChars]);

  useEffect(() => {
    fetchPt(debounced);
  }, [debounced, fetchPt]);

  // ---------- Select / Clear ----------
  const handleSelect = useCallback((opt: PerguruanTinggi) => {
    onChange(opt);
    closeDropdown();
  }, [onChange, closeDropdown]);

  const handleClear = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(null);
    setOptions([]);
    closeDropdown();
  }, [onChange, closeDropdown]);

  // ---------- Keyboard navigation ----------
  const visibleCount = options.length;
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(visibleCount, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + Math.max(visibleCount, 1)) % Math.max(visibleCount, 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < visibleCount) {
        e.preventDefault();
        handleSelect(options[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
    }
  };

  useEffect(() => {
    if (!listRef.current || activeIndex < 0) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ---------- Outside click ----------
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node;
      const inControl = controlRef.current?.contains(target);
      const inPortal  = (target as HTMLElement).closest?.('.pt-select-dropdown-portal');
      if (!inControl && !inPortal) closeDropdown();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen, closeDropdown]);

  // ---------- Highlight match ----------
  const highlight = useCallback((text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-100 text-inherit rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }, []);

  // ---------- Empty / helper message ----------
  const helper = useMemo(() => {
    if (status === 'loading') {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 size={16} className="animate-spin" />
          <span>Mencari…</span>
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      );
    }
    if (debounced.trim().length < minChars) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info size={16} className="text-gray-400" />
          <span>Ketik minimal <strong className="text-gray-700">{minChars} huruf</strong> untuk memulai.</span>
        </div>
      );
    }
    if (status === 'success' && options.length === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info size={16} className="text-gray-400" />
          <span>Tidak ada hasil untuk “<strong className="text-gray-700">{debounced}</strong>”.</span>
        </div>
      );
    }
    return null;
  }, [status, errorMsg, debounced, minChars, options.length]);

  // ---------- Render ----------
  return (
    <div className="relative w-full" ref={controlRef}>
      {/* Control */}
      {isOpen ? (
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="pt-select-listbox"
            aria-activedescendant={activeIndex >= 0 ? `pt-opt-${activeIndex}` : undefined}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setActiveIndex(-1); }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="w-full h-12 pl-11 pr-4 text-base bg-white border border-blue-400 rounded-lg outline-none ring-2 ring-blue-400/60 ring-offset-1 placeholder:text-gray-400
                       focus:ring-blue-500/70 focus:border-blue-500 transition-all"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={openDropdown}
          className="flex items-center w-full h-12 px-4 text-left bg-white border border-gray-300 rounded-lg transition-all duration-200
                     hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1"
          aria-haspopup="listbox"
          aria-expanded={false}
        >
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <University className={value ? 'text-blue-600 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} size={20} />
            <div className="flex-grow min-w-0">
              {value ? (
                <p className="text-sm font-medium text-gray-900 truncate">{value.nama}</p>
              ) : (
                <p className="text-sm text-gray-500">{placeholder}</p>
              )}
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 ml-2">
            {value && (
              <span className="mr-1">
                <X
                  size={18}
                  className="text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 cursor-pointer"
                  onClick={(e) => handleClear(e)}
                  aria-label="Bersihkan pilihan"
                />
              </span>
            )}
            <ChevronDown size={20} className="text-gray-400" aria-hidden />
          </div>
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 26 } }}
              exit={{ opacity: 0, scale: 0.98, y: -6, transition: { duration: 0.12 } }}
              style={{ position: 'absolute', top: `${coords.top + 8}px`, left: `${coords.left}px`, width: `${coords.width}px` }}
              className="pt-select-dropdown-portal z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80
                         border border-gray-200 rounded-xl shadow-2xl shadow-gray-200/70"
            >
              {/* Header helper */}
              <div className="px-3 pt-2 pb-2 border-b border-gray-100">
                {helper}
              </div>

              {/* Listbox */}
              <div className="max-h-80 overflow-y-auto">
                <ul
                  id="pt-select-listbox"
                  role="listbox"
                  aria-label="Daftar perguruan tinggi"
                  ref={listRef}
                  className="divide-y divide-gray-100"
                >
                  {options.map((opt, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <li
                        id={`pt-opt-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        key={opt.id}
                        onMouseDown={() => handleSelect(opt)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`px-4 py-3 cursor-pointer transition-colors group
                                   ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-start gap-2">
                          <University size={16} className={`mt-[2px] ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          <div className="min-w-0">
                            <p className={`text-sm ${isActive ? 'text-blue-700 font-semibold' : 'text-gray-900 font-medium'}`}>
                              {highlight(opt.nama, debounced)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Kode: <span className="tabular-nums">{opt.kode}</span>
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}

                  {status === 'loading' && options.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                    <li key={`sk-${i}`} className="px-4 py-3">
                      <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse mb-2" />
                      <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer hint — mobile vs desktop */}
              <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-500">
                {/* Mobile hint */}
                <div className="flex sm:hidden justify-between">
                  <span>Tap untuk memilih</span>
                  <span>Geser untuk scroll</span>
                </div>
                {/* Desktop hint */}
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
