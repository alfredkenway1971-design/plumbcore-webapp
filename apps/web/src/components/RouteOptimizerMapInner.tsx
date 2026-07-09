'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Job } from '@/lib/mock-data';

interface OptimizedStop {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  stopOrder: number;
  durationFromPrev: number;
  distanceFromPrev: number;
  cumulativeDuration: number;
  cumulativeDistance: number;
}

interface RouteData {
  stops: OptimizedStop[];
  totalDuration: number;
  totalDistance: number;
  routeGeometry: number[][] | null;
  optimized: boolean;
}

interface Props {
  routeData: RouteData | null;
  jobs: Job[];
  filteredJobIds: string[];
}

/* ── Custom icon factories ── */
function createNumberIcon(num: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:50%;
      background:${color};color:white;
      font-size:12px;font-weight:700;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  });
}

function createJobIcon(job: Job, isHighlighted: boolean): L.DivIcon {
  const bg = job.status === 'urgent' ? '#EF4444' : '#3B82F6';
  const size = isHighlighted ? 32 : 24;
  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};color:white;
      font-size:9px;font-weight:700;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      transition:all 0.2s;
    ">$${job.estimatedCost >= 1000 ? Math.round(job.estimatedCost / 100) / 10 + 'k' : Math.round(job.estimatedCost / 100) * 100}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 6],
  });
}

function getJobStatusBadge(status: string): string {
  switch (status) {
    case 'in-progress': return '🔄 In Progress';
    case 'scheduled': return '📅 Scheduled';
    case 'urgent': return '🚨 Urgent';
    case 'completed': return '✅ Completed';
    default: return status;
  }
}

export default function RouteOptimizerMapInner({ routeData, jobs, filteredJobIds }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(L.layerGroup());
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [30.2672, -97.7431], // Austin, TX
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current.addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers and route when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.clearLayers();

    // ── Route stops (optimized numbered markers) ──
    if (routeData && routeData.stops.length > 0) {
      routeData.stops.forEach((stop) => {
        const job = jobs.find((j) => j.id === stop.id);
        const color = stop.stopOrder === 0 ? '#22C55E' : '#3B82F6';

        const marker = L.marker([stop.lat, stop.lng], {
          icon: createNumberIcon(stop.stopOrder + 1, color),
        });

        const popupHtml = `
          <div style="font-family:Inter,system-ui,sans-serif;min-width:160px;">
            <p style="font-size:13px;font-weight:600;margin:0 0 2px;">${job?.title || 'Stop ' + (stop.stopOrder + 1)}</p>
            <p style="font-size:11px;color:#64748B;margin:0;">${stop.address}, ${stop.city}</p>
            ${stop.durationFromPrev > 0 ? `
              <div style="margin-top:6px;padding-top:6px;border-top:1px solid #E2E8F0;font-size:11px;color:#475569;">
                <p style="margin:0;">Drive: <strong>${Math.round(stop.durationFromPrev / 60)} min</strong></p>
                <p style="margin:0;">Total: <strong>${Math.round(stop.cumulativeDuration / 60)} min</strong> (${(stop.cumulativeDistance / 1000).toFixed(1)} km)</p>
              </div>
            ` : '<p style="font-size:11px;color:#22C55E;margin-top:4px;">🟢 Starting point</p>'}
          </div>
        `;
        marker.bindPopup(popupHtml, { closeButton: true, className: 'leaflet-popup-plumbcore' });
        markersRef.current.addLayer(marker);
      });

      // Fit bounds to all stops
      const bounds = L.latLngBounds(
        routeData.stops.map((s) => [s.lat, s.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // ── Show all job locations as pins (no optimization yet) ──
      const jobMarkers = jobs
        .filter((j) => filteredJobIds.includes(j.id))
        .map((job) => {
          // We don't have lat/lng for jobs not yet geocoded
          // The initial load should have geocoded them, but if not, skip
          return null;
        })
        .filter(Boolean);

      // If we got here with no routeData, show a default Austin view
      if (routeData === null) {
        map.setView([30.2672, -97.7431], 11);
      }
    }

    // ── Route line ──
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (routeData?.routeGeometry && routeData.routeGeometry.length > 0) {
      const latlngs = routeData.routeGeometry.map(
        (coord) => [coord[1], coord[0]] as [number, number]
      );

      routeLineRef.current = L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 8',
      }).addTo(map);
    }
  }, [routeData, jobs, filteredJobIds, mapInstanceRef]);

  return <div ref={mapRef} className="h-[400px] sm:h-[500px] w-full" />;
}
