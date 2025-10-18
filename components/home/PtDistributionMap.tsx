// components/home/PtDistributionMap.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Focus, Crosshair, Map as MapIcon, Satellite, Minus, Plus } from 'lucide-react';
import type * as L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface PddiktiLocationRaw {
  id_sp: string;
  nama: string;
  lintang: string | number;
  bujur: string | number;
  kelompok: string;
  pembina: string;
  kode: string;
  kab_kota: string;
}

const MapPlaceholder = ({ message }: { message: string }) => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4 text-gray-600">
      <Loader2 size={40} className="animate-spin text-blue-600" />
      <p className="font-semibold">{message}</p>
    </div>
  </div>
);

const DARK_FILL_COLOR = '#0f172a';
const DARK_FILL_OPACITY = 0.32;
const MIN_ZOOM = 3;
const MAX_ZOOM = 19;

const PtDistributionMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const maskRef = useRef<L.Polygon | null>(null);
  const outlineRef = useRef<L.GeoJSON | null>(null);
  const outlineGlowRef = useRef<L.GeoJSON | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mapType, setMapType] = useState<'osm' | 'sat'>('osm');
  const [zoom, setZoom] = useState(5);
  const [focusOn, setFocusOn] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '100px' });
    if (mapContainerRef.current) observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !mapRef.current || !mapContainerRef.current) return;
    const ro = new ResizeObserver(() => mapRef.current?.invalidateSize());
    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || mapRef.current || !mapContainerRef.current) return;

    const initMap = async () => {
      try {
        const Lns = (await import('leaflet')).default;
        await import('leaflet.markercluster');

        const { default: booleanPointInPolygon } = await import('@turf/boolean-point-in-polygon');
        const { point } = await import('@turf/helpers');

        const normalizeLatLng = (rawLat: any, rawLng: any) => {
          let lat = parseFloat(String(rawLat));
          let lng = parseFloat(String(rawLng));
          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
          const looksSwapped = (lng >= -11 && lng <= 6) && (lat >= 95 && lat <= 141);
          if (looksSwapped) [lat, lng] = [lng, lat];
          if (lat > 10 && lat <= 20) lat = -lat;
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
          return { lat, lng };
        };

        const isOnIndonesiaLand = (lat: number, lng: number, geojson: any): boolean => {
          const p = point([lng, lat]);
          if (geojson.type === 'FeatureCollection') {
            for (const f of geojson.features || []) { try { if (booleanPointInPolygon(p, f)) return true; } catch {} }
            return false;
          }
          try { return booleanPointInPolygon(p, geojson); } catch { return false; }
        };

        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const DefaultIcon = Lns.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        (Lns.Marker.prototype.options as any).icon = DefaultIcon;

        const container = mapContainerRef.current as HTMLDivElement;

        const map = Lns.map(container, {
          center: [-2.548926, 118.0148634],
          zoom: Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM),
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          zoomControl: false,           // kita pakai kontrol custom (desktop only)
          scrollWheelZoom: true,
          doubleClickZoom: true,        // mobile tetap bisa zoom via double-tap
          attributionControl: false,
          tapTolerance: 15,
        });
        mapRef.current = map;

        map.whenReady(() => {
          requestAnimationFrame(() => map.invalidateSize());
          setTimeout(() => map.invalidateSize(), 250);
        });

        map.on('click', () => map.closePopup());
        map.on('zoomend', () => setZoom(map.getZoom()));

        map.createPane('pane-mask');    map.getPane('pane-mask')!.style.zIndex = '300';
        map.createPane('pane-outline'); map.getPane('pane-outline')!.style.zIndex = '350';
        map.createPane('pane-markers'); map.getPane('pane-markers')!.style.zIndex = '400';

        const TILE_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

        const makeTile = (type: 'osm' | 'sat') =>
          Lns.tileLayer(type === 'osm' ? TILE_OSM : TILE_SAT, {
            attribution: '',
            maxZoom: MAX_ZOOM,
            maxNativeZoom: 19,
          });

        tileRef.current = makeTile(mapType).addTo(map);

        // Batas Indonesia
        const gjRes = await fetch('/data/indonesia.geojson');
        if (!gjRes.ok) throw new Error('Gagal memuat /data/indonesia.geojson');
        const indoGeoJSON = await gjRes.json();

        outlineGlowRef.current = Lns.geoJSON(indoGeoJSON, {
          style: () => ({ color: '#0ea5e9', weight: 6, opacity: 0.18, fillOpacity: 0, pane: 'pane-outline' }),
          interactive: false,
        }).addTo(map);

        outlineRef.current = Lns.geoJSON(indoGeoJSON, {
          style: () => ({ color: '#2563eb', weight: 1.6, opacity: 0.9, fillOpacity: 0, pane: 'pane-outline' }),
          interactive: false,
        }).addTo(map);

        const bounds = outlineRef.current.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: isMobile ? [16, 16] : [20, 20], maxZoom: 8 });

        // MASK
        const worldRing: [number, number][] = [
          [-89.999, -179.999], [-89.999, 179.999], [89.999, 179.999], [89.999, -179.999],
        ];
        const holes: [number, number][][] = [];
        const collectOuter = (coords: any) => {
          if (Array.isArray(coords?.[0]?.[0])) {
            const outer = coords[0].map((p: [number, number]) => [p[1], p[0]] as [number, number]);
            holes.push(outer);
          }
        };
        const geoms =
          indoGeoJSON.type === 'FeatureCollection'
            ? indoGeoJSON.features?.map((f: any) => f.geometry)
            : [indoGeoJSON.geometry ?? indoGeoJSON];
        for (const g of geoms) {
          if (!g) continue;
          if (g.type === 'Polygon') collectOuter(g.coordinates);
          else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) collectOuter(poly);
          else if (g.type === 'GeometryCollection')
            for (const gg of g.geometries || []) {
              if (gg.type === 'Polygon') collectOuter(gg.coordinates);
              else if (gg.type === 'MultiPolygon') for (const poly of gg.coordinates) collectOuter(poly);
            }
        }
        const maskLatLngs: [number, number][][] = [worldRing, ...holes];
        maskRef.current = Lns.polygon(maskLatLngs as any, {
          stroke: false,
          fillColor: DARK_FILL_COLOR,
          fillOpacity: focusOn ? DARK_FILL_OPACITY : 0,
          pane: 'pane-mask',
          interactive: false,
        }).addTo(map);

        // MARKERS
        const res = await fetch('/pt-locations.json');
        if (!res.ok) throw new Error('Gagal memuat /pt-locations.json');
        const pts: PddiktiLocationRaw[] = await res.json();

        const clusters = (Lns as any).markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          maxClusterRadius: isMobile ? 44 : 50,
          pane: 'pane-markers',
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            const size = count < 20 ? 'small' : count < 100 ? 'medium' : 'large';
            const s = size === 'small' ? 34 : size === 'medium' ? 40 : 46;
            const c = size === 'small' ? '#3b82f6' : size === 'medium' ? '#2563eb' : '#1d4ed8';
            const html = `<div style="width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:${c};color:#fff;font-weight:600;box-shadow:0 6px 14px rgba(37,99,235,.35)">${count}</div>`;
            return new (Lns as any).DivIcon({ html, className: 'pddikti-cluster', iconSize: [s, s] });
          },
        });

        let dropped = 0;
        pts.forEach((pt) => {
          const norm = normalizeLatLng(pt.lintang, pt.bujur);
          if (!norm) { dropped++; return; }
          const { lat, lng } = norm;
          const inBBox = lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141;
          if (!inBBox) { dropped++; return; }
          if (!isOnIndonesiaLand(lat, lng, indoGeoJSON)) { dropped++; return; }

          const logoContainerId = `logo-container-${pt.id_sp.replace(/[^a-zA-Z0-9-_]/g, '')}`;
          const popupContent = `
            <style>
              @keyframes pddikti-skeleton-loading { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
              .pddikti-logo-skeleton {
                background-color:#e2e8f0;background-image:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
                background-size:200% 100%;animation:pddikti-skeleton-loading 1.5s infinite linear;
                width:48px;height:48px;border-radius:6px;flex-shrink:0;
              }
            </style>
            <div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;max-width:${isMobile ? 260 : 300}px;">
              <div style="display:flex;align-items:center;gap:12px;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
                <div id="${logoContainerId}" class="pddikti-logo-skeleton">
                  <img src="/api/pt/logo/${encodeURIComponent(pt.id_sp)}" alt="Logo ${pt.nama}"
                       style="width:48px;height:48px;object-fit:contain;border-radius:6px;display:none;"
                       onload="this.style.display='block';var c=document.getElementById('${logoContainerId}');if(c){c.style.background='none';c.style.animation='none';}"
                       onerror="var c=document.getElementById('${logoContainerId}');if(c){c.style.background='#e2e8f0';c.style.animation='none';this.style.display='none';}">
                </div>
                <p style="font-weight:600;margin:0;font-size:15px;line-height:1.35;">${pt.nama}</p>
              </div>
              <div style="display:grid;grid-template-columns:90px 1fr;gap:6px 10px;padding-top:10px;">
                <strong style="color:#4b5563;">Kelompok:</strong><span>${pt.kelompok || 'N/A'}</span>
                <strong style="color:#4b5563;">Pembina:</strong><span>${pt.pembina || 'N/A'}</span>
                <strong style="color:#4b5563;">Kode:</strong><span>${pt.kode ? pt.kode.trim() : 'N/A'}</span>
                <strong style="color:#4b5563;">Kab./Kota:</strong><span>${pt.kab_kota || 'N/A'}</span>
              </div>
              <a href="/pt/detail/${encodeURIComponent(pt.id_sp)}"
                 style="display:block;text-align:center;background-color:#2563EB;color:white;padding:10px 12px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px;">
                 Lihat Detail
              </a>
            </div>
          `;

          clusters.addLayer(
            (Lns as any).marker([lat, lng]).bindPopup(popupContent, {
              autoPan: true,
              autoPanPaddingTopLeft: isMobile ? Lns.point(12, 12) : Lns.point(20, 20),
              autoPanPaddingBottomRight: isMobile ? Lns.point(12, 72) : Lns.point(20, 20),
              maxWidth: isMobile ? 260 : 300,
              closeButton: true,
              className: 'pddikti-popup',
            })
          );
        });

        clusters.addTo(map);
        markersRef.current = clusters;

        map.invalidateSize();
        if (dropped > 0) console.warn(`Markers dibuang (di laut/invalid): ${dropped}`);
        setStatus('success');
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        setStatus('error');
      }
    };

    initMap();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [isVisible, isMobile]);

  // recreate tile on mapType change (keep maxZoom config)
  useEffect(() => {
    if (!mapRef.current) return;
    (async () => {
      const Lns = (await import('leaflet')).default;
      const TILE_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      if (tileRef.current) mapRef.current!.removeLayer(tileRef.current);
      tileRef.current = Lns.tileLayer(mapType === 'osm' ? TILE_OSM : TILE_SAT, {
        attribution: '',
        maxZoom: MAX_ZOOM,
        maxNativeZoom: 19,
      }).addTo(mapRef.current!);
      mapRef.current!.invalidateSize();
    })();
  }, [mapType]);

  useEffect(() => {
    if (!maskRef.current) return;
    maskRef.current.setStyle({ fillOpacity: focusOn ? DARK_FILL_OPACITY : 0 });
  }, [focusOn]);

  useEffect(() => {
    if (!mapRef.current) return;
    const clamped = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
    if (mapRef.current.getZoom() !== clamped) mapRef.current.setZoom(clamped);
  }, [zoom]);

  const recenter = () => {
    if (!mapRef.current || !outlineRef.current) return;
    const b = outlineRef.current.getBounds();
    if (b.isValid()) mapRef.current.fitBounds(b, { padding: isMobile ? [16, 16] : [20, 20], maxZoom: 8 });
  };

  return (
    <section className="mt-24">
      <div className="mb-6 text-center sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Peta Sebaran Perguruan Tinggi</h2>
        <p className="mx-auto mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-gray-600">
          Visualisasi lokasi perguruan tinggi di seluruh Indonesia.
        </p>
      </div>

      <div className="relative isolate w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg shadow-blue-500/10 h-[75vh] sm:h-auto sm:aspect-video">
        {status === 'loading' && <MapPlaceholder message="Memuat Peta, Batas Indonesia, dan Data Lokasi..." />}
        {status === 'error' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-red-700 bg-red-50 rounded-2xl">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* MAP ROOT */}
        <div ref={mapContainerRef} className="h-full w-full bg-gray-200 touch-manipulation" />

        {status === 'success' && (
          <>
            {/* Desktop controls (tetap tampil) */}
            <div className="pointer-events-none absolute z-[1000] top-4 left-4 hidden sm:flex items-center gap-2">
              <div className="pointer-events-auto inline-flex p-1 rounded-xl border border-gray-200 bg-white/90 shadow backdrop-blur">
                <button
                  onClick={() => setMapType('osm')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${mapType === 'osm' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <MapIcon className="h-4 w-4" /> Map
                </button>
                <button
                  onClick={() => setMapType('sat')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${mapType === 'sat' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Satellite className="h-4 w-4" /> Satelit
                </button>
              </div>

              {/* Zoom hanya di desktop */}
              <div className="pointer-events-auto hidden md:inline-flex items-center gap-1 p-1 rounded-xl border border-gray-200 bg-white/90 shadow backdrop-blur">
                <button onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))} className="h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100" aria-label="Zoom out">
                  <Minus className="h-4 w-4 mx-auto" />
                </button>
                <div className="px-2 text-sm text-gray-600 tabular-nums">{Math.round(zoom)}</div>
                <button onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))} className="h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100" aria-label="Zoom in">
                  <Plus className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Mobile controls: tanpa tombol zoom */}
            <div className="pointer-events-none absolute z-[1000] bottom-3 left-3 right-3 sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <div className="pointer-events-auto grid grid-cols-3 gap-2">
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
                  aria-label="Kembali ke Indonesia"
                >
                  <Crosshair className="h-5 w-5" />
                  <span className="text-sm">Pusat</span>
                </button>

                <button
                  onClick={() => setFocusOn((s) => !s)}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold shadow active:scale-[0.98] ${focusOn ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white/95 text-gray-800'}`}
                  aria-label={focusOn ? 'Nonaktifkan Fokus' : 'Aktifkan Fokus'}
                >
                  <Focus className="h-5 w-5" />
                  <span className="text-sm">{focusOn ? 'Fokus' : 'Bebas'}</span>
                </button>
              </div>
              {/* tidak ada tombol zoom di mobile */}
            </div>

            {/* FAB Fokus (desktop) */}
            <div className="pointer-events-auto absolute z-[1000] bottom-4 right-4 hidden sm:block">
              <button
                onClick={() => setFocusOn((s) => !s)}
                title={focusOn ? 'Nonaktifkan Fokus' : 'Aktifkan Fokus'}
                aria-label={focusOn ? 'Nonaktifkan Fokus' : 'Aktifkan Fokus'}
                className={`rounded-full p-3 shadow-lg transition-all backdrop-blur ${focusOn ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/90 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
              >
                <Focus className={`h-5 w-5 transition-transform ${focusOn ? 'scale-100' : 'scale-95'}`} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PtDistributionMap;
