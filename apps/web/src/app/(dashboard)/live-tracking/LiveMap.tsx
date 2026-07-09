'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TechLocation } from '@/lib/trackingDb';
import { getTechColor, getTechStatusLabel, getJobAddress } from '@/lib/trackingDb';
import { jobs } from '@/lib/mock-data';

interface Props {
  techLocs: TechLocation[];
  onCompleteJob: (techId: string) => void;
}

function createTechIcon(color: string, status: string): L.DivIcon {
  const pulse = status === 'on_job' ? '<span style="position:absolute;inset:-4px;border-radius:50%;background:' + color + '40;animation:pulse 2s infinite"></span>' : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${color};color:white;font-size:14px;font-weight:700;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);">${pulse}<span style="position:relative;z-index:1;">⚡</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

export default function LiveMap({ techLocs, onCompleteJob }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(L.layerGroup());

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [30.2672, -97.7431],
      zoom: 12,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapInstanceRef.current = map;
    markersRef.current.addTo(map);
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    markersRef.current.clearLayers();

    techLocs.forEach(loc => {
      const job = jobs.find(j => j.id === loc.currentJobId);
      const color = getTechColor(loc.status);

      const marker = L.marker([loc.lat, loc.lng], {
        icon: createTechIcon(color, loc.status),
      });

      const popupHtml = `
        <div style="font-family:Inter,sans-serif;min-width:180px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;"></span>
            <strong style="font-size:14px;">${loc.techName}</strong>
          </div>
          <p style="font-size:12px;color:#64748B;margin:0 0 4px;">${getTechStatusLabel(loc.status)}</p>
          ${job ? `
            <div style="background:#F8FAFC;border-radius:8px;padding:8px;margin:6px 0;font-size:12px;">
              <p style="margin:0;font-weight:600;">${job.title}</p>
              <p style="margin:2px 0 0;color:#64748B;">${job.clientName}</p>
              <p style="margin:2px 0 0;color:#64748B;">${getJobAddress(job.id)}</p>
            </div>
          ` : '<p style="font-size:11px;color:#22C55E;">Available</p>'}
          <p style="font-size:10px;color:#94A3B8;">🔋 ${loc.batteryLevel}% • ${new Date(loc.updatedAt).toLocaleTimeString()}</p>
        </div>
      `;
      marker.bindPopup(popupHtml, { closeButton: true });
      markersRef.current.addLayer(marker);
    });

    if (techLocs.length > 0) {
      const bounds = L.latLngBounds(techLocs.map(l => [l.lat, l.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [techLocs]);

  return <div ref={mapRef} className="h-[350px] sm:h-[450px] w-full" />;
}
