// app/(pages)/pt/detail/[id]/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { PerguruanTinggiDetail, ProgramStudi } from '@/lib/types';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useDetailPage } from '@/lib/hooks/useDetailPage';
import { Pagination } from '@/components/search/Pagination';
import {
  University, MapPin, Globe, Mail, Phone, Calendar, ArrowLeft,
  Users, Building, FileText, Shield, CheckCircle, ArrowRight, Search, Printer, AlertTriangle,
  ExternalLink, Copy, BookOpen,
  Map as MapIcon, Satellite, Crosshair,
} from 'lucide-react';
import { motion } from 'framer-motion';

// === Hanya untuk tipe; tidak memicu SSR
import type * as L from 'leaflet';

/* ----------------------------- Reusable Pieces ----------------------------- */

const InfoItem = ({ label, value, icon }: { label: string, value: string | React.ReactNode, icon: React.ReactNode }) => {
  if (!value || value === '-') return null;
  return (
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
      <div className="flex-shrink-0 h-10 w-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="font-semibold text-gray-800 text-base break-words">{value}</div>
      </div>
    </div>
  );
};

// --- Skeleton Komponen ---

const ProdiTableSkeleton = () => (
  <div className="animate-pulse overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
    <div className="p-4"><div className="h-10 bg-gray-200 rounded-lg w-full"></div></div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: 4 }).map((_, i) => (
              <th key={i} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
              <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-full"></div></td>
              <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
              <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded-md w-20 ml-auto"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
    <main className="max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Perguruan Tinggi', href: '/pt' }, { label: 'Detail' }]} />
      <div className="mt-8 animate-pulse">
        {/* PT Detail Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
          <div className="relative p-6 sm:p-8">
            <div className="absolute top-6 right-6 h-7 w-24 bg-gray-200 rounded-full"></div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl bg-gray-200"></div>
              <div className="flex-grow w-full sm:w-auto text-center sm:text-left">
                <div className="h-8 w-3/4 bg-gray-200 rounded mx-auto sm:mx-0"></div>
                <div className="h-6 w-1/2 bg-gray-200 rounded mt-2 mx-auto sm:mx-0"></div>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-dashed border-gray-200" />
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                  <div className="h-5 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Skeleton */}
        <div className="mt-12">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
          <div className="aspect-video w-full bg-gray-200 rounded-2xl"></div>
        </div>

        {/* Prodi List Skeleton */}
        <div className="mt-12">
          <div className="h-8 w-1/2 bg-gray-200 rounded mb-6"></div>
          <ProdiTableSkeleton />
        </div>
      </div>
    </main>
  </div>
);


/* ------------------------- LocationSection (fix overlay positions, mobile-first) ------------------------- */

function LocationSection({
  name,
  address,
  latRaw,
  lngRaw,
}: {
  name: string;
  address?: string;
  latRaw: unknown;
  lngRaw: unknown;
}) {
  const toNumber = (val: unknown) => {
    if (val === null || val === undefined) return NaN;
    const s = String(val).trim().replace(/\s+/g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const lat = toNumber(latRaw);
  const lng = toNumber(lngRaw);
  const coordsValid = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;

  const [mapType, setMapType] = useState<'osm' | 'sat'>('osm');
  const [zoom, setZoom] = useState<number>(15);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const MIN_ZOOM = 3;
  const MAX_ZOOM = 19;

  // Lazy-show container
  useEffect(() => {
    const el = mapDivRef.current;
    if (!el) { setMapVisible(true); return; }
    let timer = setTimeout(() => setMapVisible(true), 600);
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMapVisible(true);
        obs.disconnect();
        clearTimeout(timer);
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, []);

  // Init Leaflet client-only
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!mapVisible || !coordsValid || typeof window === 'undefined' || mapRef.current) return;

      const Lmod = await import('leaflet');
      leafletRef.current = Lmod;
      const Lns = Lmod as unknown as typeof import('leaflet');

      // inject CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // fix default marker
      const DefaultIcon = Lns.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      (Lns as any).Marker.prototype.options.icon = DefaultIcon;

      if (cancelled) return;

      const TILE_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

      const initialZoom = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);

      const map = Lns.map(mapDivRef.current as HTMLDivElement, {
        center: [lat, lng],
        zoom: initialZoom,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoomControl: false,         // mobile: gesture only
        scrollWheelZoom: true,
        doubleClickZoom: true,
        attributionControl: false,
        tapTolerance: 15,
      });
      mapRef.current = map;

      // auto resize
      map.whenReady(() => {
        requestAnimationFrame(() => map.invalidateSize());
        setTimeout(() => map.invalidateSize(), 250);
      });
      const ro = new ResizeObserver(() => map.invalidateSize());
      if (mapDivRef.current) ro.observe(mapDivRef.current);
      map.on('unload', () => ro.disconnect());

      // Tile layer dengan maxZoom agar aman
      const makeTile = (type: 'osm' | 'sat') =>
        Lns.tileLayer(type === 'sat' ? TILE_SAT : TILE_OSM, {
          attribution: '',
          maxZoom: MAX_ZOOM,
          maxNativeZoom: 19,
        });

      const tile = makeTile(mapType).addTo(map);
      const marker = Lns.marker([lat, lng]).addTo(map);
      tileRef.current = tile;
      markerRef.current = marker;

      map.on('zoomend', () => setZoom(map.getZoom()));
      setMapLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [mapVisible, coordsValid, lat, lng]);

  // respond to zoom change (clamped)
  useEffect(() => {
    if (!mapRef.current) return;
    const clamped = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
    if (mapRef.current.getZoom() !== clamped) mapRef.current.setZoom(clamped);
  }, [zoom]);

  // respond to coords change
  useEffect(() => {
    if (mapRef.current && coordsValid) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true });
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    }
  }, [coordsValid, lat, lng]);

  // respond to mapType change (recreate tile with maxZoom)
  useEffect(() => {
    const Lns = leafletRef.current as (typeof import('leaflet')) | null;
    if (!Lns || !mapRef.current) return;
    const TILE_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    if (tileRef.current) {
      mapRef.current.removeLayer(tileRef.current);
      tileRef.current = null;
    }
    tileRef.current = Lns.tileLayer(mapType === 'sat' ? TILE_SAT : TILE_OSM, {
      attribution: '',
      maxZoom: MAX_ZOOM,
      maxNativeZoom: 19,
    }).addTo(mapRef.current);
    mapRef.current.invalidateSize();
  }, [mapType]);

  // Helpers link GMaps
  const gmapsLink = coordsValid
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

  const directionsLink = coordsValid
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(gmapsLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch { /* ignore */ }
  };

  // recenter cepat
  const recenter = () => {
    if (!mapRef.current) return;
    mapRef.current.setView([lat, lng], Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM), { animate: true });
  };

  if (!coordsValid) return null;

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lokasi</h2>
          {address && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{address}</p>}
        </div>
      </div>

      <div className="relative rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-xl overflow-hidden">
        {/* MAP: mobile-friendly height */}
        <div
          ref={mapDivRef}
          className="relative z-0 h-[60vh] sm:h-auto sm:aspect-video w-full bg-gradient-to-b from-gray-50 to-white"
        >
          {!mapLoaded && (
            <div className="absolute inset-0 animate-pulse">
              <div className="h-full w-full bg-[linear-gradient(120deg,rgba(255,255,255,0.25)_25%,rgba(0,0,0,0.03)_25%,rgba(0,0,0,0.03)_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,rgba(0,0,0,0.03)_75%)] bg-[length:24px_24px]" />
            </div>
          )}

          {/* Koordinat: pindah ke kanan-atas di mobile biar tidak bentrok tombol bawah */}
          <div className="pointer-events-none absolute z-[1100] right-3 top-3 sm:bottom-0 sm:top-auto sm:right-auto sm:left-0 sm:p-4 sm:z-[700]">
            <div className="pointer-events-auto rounded-xl border border-gray-200 bg-white/90 shadow backdrop-blur px-3 py-1.5 text-xs text-gray-600 flex items-center gap-2">
              <MapPin size={14} className="text-blue-600" />
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </div>
          </div>

          {/* Kontrol bawah (MOBILE): pakai ikon + aman dari safe-area */}
          <div
            className="pointer-events-none absolute left-3 right-3 sm:hidden z-[1200]"
            style={{
              bottom: 'max(env(safe-area-inset-bottom), 16px)',
            }}
          >
            <div className="pointer-events-auto grid grid-cols-2 gap-2">
              <button
                onClick={() => setMapType((t) => (t === 'osm' ? 'sat' : 'osm'))}
                className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/95 py-3 font-semibold shadow active:scale-[0.98]"
                aria-label="Ganti Map/Satelit"
              >
                {mapType === 'osm' ? <Satellite className="h-5 w-5" /> : <MapIcon className="h-5 w-5" />}
                <span className="text-sm">{mapType === 'osm' ? 'Satelit' : 'Map'}</span>
              </button>
              <button
                onClick={recenter}
                className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/95 py-3 font-semibold shadow active:scale-[0.98]"
                aria-label="Kembali ke titik"
              >
                <Crosshair className="h-5 w-5" />
                <span className="text-sm">Pusatkan</span>
              </button>
            </div>
          </div>

          {/* Toolbar kiri atas (DESKTOP): ikon + zoom */}
          <div className="absolute z-[1200] top-4 left-4 hidden md:flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl border border-gray-200 bg-white/90 shadow pointer-events-auto">
              <button
                onClick={() => setMapType('osm')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${mapType === 'osm' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <MapIcon className="h-4 w-4" />
                Map
              </button>
              <button
                onClick={() => setMapType('sat')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${mapType === 'sat' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Satellite className="h-4 w-4" />
                Satelit
              </button>
            </div>

            {/* Zoom desktop */}
            <div className="hidden lg:inline-flex items-center gap-1 p-1 rounded-xl border border-gray-200 bg-white/90 shadow pointer-events-auto">
              <button
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
                className="h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100 text-lg leading-none"
                aria-label="Zoom out"
                title="Zoom out"
              >
                −
              </button>
              <div className="px-2 text-sm text-gray-600 tabular-nums">{Math.round(zoom)}</div>
              <button
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
                className="h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100 text-lg leading-none"
                aria-label="Zoom in"
                title="Zoom in"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Actions (tetap responsif, tidak menimpa mobile controls karena non-absolute di mobile) */}
        <div className="md:absolute md:z-[1200] md:top-4 md:right-4 flex gap-2 pointer-events-auto p-4 border-t border-gray-100 bg-white/70 md:p-0 md:border-t-0 md:bg-transparent">
          <button
            onClick={copyLink}
            className={`inline-flex items-center justify-center gap-2 h-10 md:h-auto md:w-auto w-10 md:px-3 md:py-2 rounded-lg border text-sm shadow transition-colors
              ${copied ? 'border-green-200 bg-green-50/90 text-green-700' : 'border-gray-200 bg-white/90 hover:bg-white text-gray-700'}`}
            title={copied ? 'Tautan tersalin' : 'Salin tautan Google Maps'}
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            <span className="hidden md:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
          <a
            href={gmapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-10 md:h-auto md:w-auto w-10 md:px-3 md:py-2 rounded-lg border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-sm shadow"
            title="Buka di Google Maps"
          >
            <ExternalLink size={16} />
            <span className="hidden md:inline">Buka Maps</span>
          </a>
          <a
            href={directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-10 md:h-auto md:w-auto w-10 md:px-3 md:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm shadow"
            title="Petunjuk Arah"
          >
            <ArrowRight size={16} />
            <span className="hidden md:inline">Petunjuk Arah</span>
          </a>
        </div>
      </div>
    </div>
  );
}


/* --------------------------------- Page ---------------------------------- */

const PRODI_PER_PAGE = 10;

export default function PtDetailPage() {
  const { data: pt, loading: ptLoading, error } = useDetailPage<PerguruanTinggiDetail>('pt');
  const [prodiList, setProdiList] = useState<ProgramStudi[]>([]);
  const [prodiLoading, setProdiLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (pt && pt.nama_pt) {
      const fetchProdi = async () => {
        setProdiLoading(true);
        try {
          const initiateResponse = await fetch('/api/search/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: pt.nama_pt }),
          });
          if (!initiateResponse.ok) {
            const errorJson = await initiateResponse.json();
            throw new Error(errorJson.message || 'Gagal memulai sesi pencarian prodi.');
          }
          const { key } = await initiateResponse.json();
          const response = await fetch(`/api/prodi?key=${key}`);
          if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.message || 'Gagal mengambil data prodi.');
          }
          const result = await response.json();
          const filteredData = (Array.isArray(result.data) ? result.data : []).filter(
            (prodi: ProgramStudi) => prodi.pt.trim().toLowerCase() === pt.nama_pt.trim().toLowerCase()
          );
          setProdiList(filteredData);
        } catch (err) {
          console.error("Gagal mengambil daftar program studi:", err);
          setProdiList([]);
        } finally {
          setProdiLoading(false);
        }
      };
      fetchProdi();
    } else if (!ptLoading) {
      setProdiLoading(false);
    }
  }, [pt, ptLoading]);

  const filteredProdi = useMemo(() => {
    if (!filterQuery) return prodiList;
    const query = filterQuery.toLowerCase();
    return prodiList.filter(prodi =>
      prodi.nama.toLowerCase().includes(query) ||
      prodi.jenjang.toLowerCase().includes(query)
    );
  }, [prodiList, filterQuery]);

  const paginatedProdi = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODI_PER_PAGE;
    return filteredProdi.slice(startIndex, startIndex + PRODI_PER_PAGE);
  }, [filteredProdi, currentPage]);

  const totalPages = Math.ceil(filteredProdi.length / PRODI_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [filterQuery]);

  const breadcrumbItems = [
    { label: "Perguruan Tinggi", href: "/pt" },
    { label: pt ? pt.nama_pt : "Detail" }
  ];

  if (ptLoading) return <PageSkeleton />;

  if (error || !pt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data</h1>
        <p className="text-gray-600 mt-2">{error || 'Data perguruan tinggi tidak dapat ditemukan.'}</p>
        <Link
          href="/pt"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Pencarian
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  const fullAddress = pt ? [pt.alamat, pt.kecamatan_pt, pt.kab_kota_pt, pt.provinsi_pt, pt.kode_pos]
    .filter(part => part && part !== 'Tidak Diisi').join(', ') : '';

  const isAktif = pt?.status_pt?.toLowerCase() === 'aktif';
  const statusInfo = pt ? {
    label: pt.status_pt || 'N/A',
    color: isAktif ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
    icon: isAktif ? <CheckCircle size={14} className="text-green-700" /> : <AlertTriangle size={14} className="text-yellow-700" />
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
      <main className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="mt-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200">
            <div className="relative p-6 sm:p-8">
              {statusInfo && (
                <div className="absolute top-6 right-6">
                  <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div id="logo-placeholder" style={{ display: 'none' }} className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 flex items-center justify-center rounded-xl border bg-gray-100 text-gray-400 shadow-sm">
                  <University size={40} />
                </div>
                <Image
                  id="pt-logo"
                  src={`/api/pt/logo/${pt.id_sp}`}
                  alt={`Logo ${pt.nama_pt}`}
                  width={96}
                  height={96}
                  className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl border-2 border-white bg-white object-contain shadow-md"
                  unoptimized
                  onError={() => {
                    const logoEl = document.getElementById('pt-logo') as HTMLImageElement | null;
                    if (logoEl) logoEl.style.display = 'none';
                    const placeholder = document.getElementById('logo-placeholder');
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                <div className="flex-grow text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{pt.nama_pt}</h1>
                  <p className="text-gray-500 text-base sm:text-lg mt-1">{pt.kelompok}</p>
                </div>
              </div>
            </div>
            <div className="border-t-2 border-dashed border-gray-200"></div>
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoItem label="Akreditasi" value={pt.akreditasi_pt} icon={<Shield size={20} />} />
              <InfoItem label="Kode PT" value={pt.kode_pt?.trim() || '-'} icon={<Building size={20} />} />
              <InfoItem label="Wilayah" value={pt.pembina} icon={<Users size={20} />} />
              <InfoItem label="Tanggal Berdiri" value={formatDate(pt.tgl_berdiri_pt)} icon={<Calendar size={20} />} />
              <InfoItem
                label="SK Pendirian"
                value={<>{pt.sk_pendirian_sp} <span className="block text-sm font-normal text-gray-500 mt-1">Tanggal: {formatDate(pt.tgl_sk_pendirian_sp)}</span></>}
                icon={<FileText size={20} />}
              />
              <InfoItem label="Alamat" value={fullAddress} icon={<MapPin size={20} />} />
              <InfoItem label="Website" value={pt.website ? <a href={`http://${pt.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{pt.website}</a> : '-'} icon={<Globe size={20} />} />
              <InfoItem label="Email" value={pt.email ? <a href={`mailto:${pt.email}`} className="text-blue-600 hover:underline">{pt.email}</a> : '-'} icon={<Mail size={20} />} />
              <InfoItem label="Telepon" value={pt.no_tel} icon={<Phone size={20} />} />
              <InfoItem label="Fax" value={pt.no_fax} icon={<Printer size={20} />} />
            </div>
          </div>

          <LocationSection
            name={pt.nama_pt}
            address={fullAddress}
            latRaw={pt.lintang_pt}
            lngRaw={pt.bujur_pt}
          />
        </motion.div>

        {/* ====== Program Studi ====== */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-200 flex items-center gap-3">
            <BookOpen className="text-blue-500" />
            Program Studi ({prodiLoading ? 'Memuat...' : filteredProdi.length})
          </h2>
          {prodiLoading ? (
            <ProdiTableSkeleton />
          ) : (
            <div>
              <div className="mb-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder={`Cari di antara ${prodiList.length} program studi...`}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {paginatedProdi.length > 0 ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th scope="col" className="px-6 py-4 w-12 text-center font-medium tracking-wider">No</th>
                            <th scope="col" className="px-6 py-4 font-medium tracking-wider">Program Studi</th>
                            <th scope="col" className="px-6 py-4 font-medium tracking-wider">Jenjang</th>
                            <th scope="col" className="relative px-6 py-4"><span className="sr-only">Aksi</span></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedProdi.map((prodi, index) => (
                            <tr key={prodi.id} className="group hover:bg-blue-50/50 transition-colors duration-150">
                              <td className="px-6 py-4 text-center text-gray-500 font-medium">{(currentPage - 1) * PRODI_PER_PAGE + index + 1}</td>
                              <td className="px-6 py-4 font-semibold text-gray-800 truncate max-w-xs">
                                <Link href={`/prodi/detail/${encodeURIComponent(prodi.id)}`} className="hover:underline">
                                  {prodi.nama}
                                </Link>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{prodi.jenjang}</td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <Link href={`/prodi/detail/${encodeURIComponent(prodi.id)}`} className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all">
                                  <span>Detail</span>
                                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 border-2 border-dashed border-gray-300 p-10 rounded-xl">
                  <p>Tidak ada program studi yang cocok dengan kata kunci "<span className="font-semibold text-gray-700">{filterQuery}</span>".</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}