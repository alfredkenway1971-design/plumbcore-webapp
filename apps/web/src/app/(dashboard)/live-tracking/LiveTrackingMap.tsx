'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TechPin {
  id: string;
  name: string;
  role: string;
  status: string;
  lat: number;
  lng: number;
  batteryLevel: number | null;
  gpsEnabled: boolean;
  currentJob: string | null;
  currentJobId: string | null;
  currentJobAddress: string | null;
  eta: string | null;
}

interface Props {
  techPins: TechPin[];
  selectedTechId: string | null;
}

/* ── Color-coded pin factory ── */
function createTechIcon(tech: TechPin, isSelected: boolean): L.DivIcon {
  let bgColor: string;
  switch (tech.status) {
    case 'online':
      bgColor = '#10B981'; // emerald — available
      break;
    case 'busy':
      bgColor = '#3B82F6'; // blue — en route / on job
      break;
    case 'away':
      bgColor = '#F59E0B'; // amber — away
      break;
    default:
      bgColor = '#94A3B8'; // slate — offline
  }

  // If on a job and GPS is enabled, show red to indicate "on job"
  if (tech.currentJob && tech.gpsEnabled && tech.status === 'busy') {
    bgColor = '#EF4444'; // red — actively on a job
  }

  const size = isSelected ? 40 : 32;
  const initials = tech.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const pulseRing = tech.gpsEnabled
    ? `<div style="
        position:absolute;top:50%;left:50%;
        width:${size + 12}px;height:${size + 12}px;
        transform:translate(-50%,-50%);
        border-radius:50%;
        background:${bgColor}30;
        animation:pulse-ring 2s infinite;
      "></div>`
    : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        ${pulseRing}
        <div style="
          display:flex;align-items:center;justify-content:center;
          width:${size}px;height:${size}px;border-radius:50%;
          background:${bgColor};color:white;
          font-size:${isSelected ? 11 : 10}px;font-weight:700;
          border:${isSelected ? 3 : 2}px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transition:all 0.2s;
          position:relative;z-index:2;
        ">${initials}</div>
      </div>
    `,
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, (size + 12) / 2],
    popupAnchor: [0, -(size + 12) / 2 - 6],
  });
}

export default function LiveTrackingMap({ techPins, selectedTechId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(L.layerGroup());

  // ── Init map ──
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [30.2672, -97.7431], // Austin, TX
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current.addTo(map);

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.id = 'leaflet-pulse-style';
    style.textContent = `
      @keyframes pulse-ring {
        0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.6; }
        70% { transform: translate(-50%,-50%) scale(1.2); opacity: 0.2; }
        100% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      const s = document.getElementById('leaflet-pulse-style');
      if (s) s.remove();
    };
  }, []);

  // ── Update markers when data changes ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.clearLayers();

    if (techPins.length === 0) {
      map.setView([30.2672, -97.7431], 12);
      return;
    }

    const bounds = L.latLngBounds(
      techPins.map(p => [p.lat, p.lng] as [number, number])
    );

    techPins.forEach((tech) => {
      const marker = L.marker([tech.lat, tech.lng], {
        icon: createTechIcon(tech, tech.id === selectedTechId),
      });

      // Build popup
      const statusLabel =
        tech.status === 'online' ? '🟢 Available' :
        tech.status === 'busy' ? (tech.currentJob ? '🔴 On Job' : '🔵 En Route') :
        tech.status === 'away' ? '🟡 Away' :
        '⚪ Offline';

      const popupHtml = `
        <div style="font-family:Inter,system-ui,sans-serif;min-width:180px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="
              width:32px;height:32px;border-radius:50%;
              background:linear-gradient(135deg,#3B82F6,#06B6D4);
              display:flex;align-items:center;justify-content:center;
              color:white;font-size:10px;font-weight:700;
              flex-shrink:0;
            ">${tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div>
              <p style="font-size:13px;font-weight:600;margin:0;">${tech.name}</p>
              <p style="font-size:11px;color:#64748B;margin:0;">${tech.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569;">
            <span>Status: ${statusLabel}</span>
            <span>GPS: ${tech.gpsEnabled ? '✅ Active' : '❌ Disabled'}</span>
            ${tech.batteryLevel !== null ? `<span>🔋 ${Math.round(tech.batteryLevel)}% battery</span>` : ''}
            ${tech.currentJob ? `
              <div style="margin-top:6px;padding-top:6px;border-top:1px solid #E2E8F0;">
                <p style="margin:0 0 2px;font-weight:500;">Current Job:</p>
                <p style="margin:0;color:#0F172A;">${tech.currentJob}</p>
                ${tech.currentJobAddress ? `<p style="margin:0;color:#64748B;font-size:10px;">📍 ${tech.currentJobAddress}</p>` : ''}
              </div>
            ` : ''}
            ${tech.eta ? `
              <div style="margin-top:4px;padding-top:4px;border-top:1px solid #E2E8F0;">
                <span style="color:#3B82F6;font-weight:500;">🚚 ETA: ${tech.eta}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'leaflet-popup-plumbcore',
      });

      markersRef.current.addLayer(marker);
    });

    // Fit bounds with padding, but don't zoom in too far
    if (techPins.length > 1) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else {
      map.setView([techPins[0].lat, techPins[0].lng], 14);
    }
  }, [techPins, selectedTechId]);

  return <div ref={mapRef} className="h-[500px] w-full" />;
}
