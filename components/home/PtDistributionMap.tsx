// components/home/PtDistributionMap.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Focus } from 'lucide-react';
import type * as L from 'leaflet';

import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface PddiktiLocationRaw {
  id_sp: string;
  nama: string;
  lintang: string | number;
  bujur: string | number;
}

const MapPlaceholder = ({ message }: { message: string }) => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4 text-gray-600">
      <Loader2 size={40} className="animate-spin text-blue-600" />
      <p className="font-semibold">{message}</p>
    </div>
  </div>
);

// Mask lebih terang (tetap kontras)
const DARK_FILL_COLOR = '#0f172a'; // slate-900
const DARK_FILL_OPACITY = 0.32;    // turunkan sedikit dari versi gelap

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

  // Lazy-load saat terlihat
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
    if (!isVisible || !mapContainerRef.current || mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const Lns = (await import('leaflet')).default;
        await import('leaflet.markercluster');

        // Inject CSS Leaflet jika belum ada
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

        const map = Lns.map(mapContainerRef.current, {
          center: [-2.548926, 118.0148634],
          zoom,
          zoomControl: false,
          scrollWheelZoom: true,
          attributionControl: false,
          minZoom: 3,
        });
        mapRef.current = map;

        // Panes (z-index)
        map.createPane('pane-mask');    map.getPane('pane-mask')!.style.zIndex = '300';
        map.createPane('pane-outline'); map.getPane('pane-outline')!.style.zIndex = '350';
        map.createPane('pane-markers'); map.getPane('pane-markers')!.style.zIndex = '400';

        const TILE_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        tileRef.current = Lns.tileLayer(mapType === 'osm' ? TILE_OSM : TILE_SAT, { attribution: '' }).addTo(map);

        map.on('zoomend', () => setZoom(map.getZoom()));

        // Baca batas Indonesia
        const gjRes = await fetch('/data/indonesia.geojson');
        if (!gjRes.ok) throw new Error('Gagal memuat /data/indonesia.geojson');
        const indoGeoJSON = await gjRes.json();

        // Glow halus
        outlineGlowRef.current = Lns.geoJSON(indoGeoJSON, {
          style: () => ({
            color: '#0ea5e9',
            weight: 6,
            opacity: 0.18,
            fillOpacity: 0,
            pane: 'pane-outline',
          }),
          interactive: false,
        }).addTo(map);

        // Outline tipis
        outlineRef.current = Lns.geoJSON(indoGeoJSON, {
          style: () => ({
            color: '#2563eb',
            weight: 1.6,
            opacity: 0.9,
            fillOpacity: 0,
            pane: 'pane-outline',
          }),
          interactive: false,
        }).addTo(map);

        const bounds = outlineRef.current.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });

        // MASK: poligon dunia berlubang Indonesia
        const worldRing: [number, number][] = [
          [-89.999, -179.999],
          [-89.999, 179.999],
          [89.999, 179.999],
          [89.999, -179.999],
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

        // Marker PT
        const res = await fetch('/pt-locations.json');
        if (!res.ok) throw new Error('Gagal memuat /pt-locations.json');
        const pts: PddiktiLocationRaw[] = await res.json();

        const clusters = (Lns as any).markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          maxClusterRadius: 50,
          pane: 'pane-markers',
        });

        pts.forEach((pt) => {
          const lat = parseFloat(String(pt.lintang));
          const lng = parseFloat(String(pt.bujur));
          const inIndonesia = lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141;
          if (!isNaN(lat) && !isNaN(lng) && inIndonesia) {
            const popup = `
              <div style="font-family: ui-sans-serif; font-size: 14px;">
                <p style="font-weight:600; margin:0 0 6px;">${pt.nama}</p>
                <a href="/pt/detail/${encodeURIComponent(pt.id_sp)}"
                   style="display:block;text-align:center;background:#2563EB;color:white;padding:6px;border-radius:6px;text-decoration:none">
                   Lihat Detail
                </a>
              </div>`;
            clusters.addLayer(Lns.marker([lat, lng]).bindPopup(popup));
          }
        });

        clusters.addTo(map);
        markersRef.current = clusters;

        setStatus('success');
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        setStatus('error');
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isVisible]);

  // Ganti tile (Map/Satelit)
  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    const TILE_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    tileRef.current.setUrl(mapType === 'osm' ? TILE_OSM : TILE_SAT);
  }, [mapType]);

  // Toggle fokus (ubah opacity mask)
  useEffect(() => {
    if (!maskRef.current) return;
    maskRef.current.setStyle({ fillOpacity: focusOn ? DARK_FILL_OPACITY : 0 });
  }, [focusOn]);

  return (
    <section className="mt-24">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Peta Sebaran Perguruan Tinggi</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
          Visualisasi lokasi perguruan tinggi di seluruh Indonesia.
        </p>
      </div>

      <div className="relative isolate aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg shadow-blue-500/10">
        {status === 'loading' && <MapPlaceholder message="Memuat Peta, Batas Indonesia, dan Data Lokasi..." />}
        {status === 'error' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-red-700 bg-red-50 rounded-2xl">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div ref={mapContainerRef} className="h-full w-full bg-gray-200" />

        {status === 'success' && (
          <>
            {/* Kontrol kiri atas */}
            <div className="absolute z-[1000] top-4 left-4 flex items-center gap-2">
              <div className="inline-flex p-1 rounded-xl border border-gray-200 bg-white/90 shadow pointer-events-auto backdrop-blur">
                <button
                  onClick={() => setMapType('osm')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    mapType === 'osm' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapType('sat')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    mapType === 'sat' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Satelit
                </button>
              </div>
            </div>

            {/* FAB Fokus kanan-bawah */}
            <div className="absolute z-[1000] bottom-4 right-4">
              <button
                onClick={() => setFocusOn((s) => !s)}
                title={focusOn ? 'Nonaktifkan Fokus' : 'Aktifkan Fokus'}
                aria-label={focusOn ? 'Nonaktifkan Fokus' : 'Aktifkan Fokus'}
                className={`rounded-full p-3 shadow-lg transition-all pointer-events-auto backdrop-blur
                  ${focusOn
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white/90 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
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
