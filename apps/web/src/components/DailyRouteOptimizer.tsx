'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { jobs, teamMembers } from '@/lib/mock-data';
import type { Job } from '@/lib/mock-data';

/* ── Haversine distance (km) between lat/lng points ── */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Geocode address via Nominatim ── */
async function geocode(address: string, city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  const q = encodeURIComponent(`${address}, ${city}, ${state}`);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=us,ca&limit=1`,
      { headers: { 'User-Agent': 'PlumbCoreAI/1.0' } }
    );
    const data = await res.json();
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

/* ── Types ── */
interface RouteStop {
  job: Job;
  order: number;
  driveKm?: number;
  driveMin?: number;
}

type StartPoint = 'home' | 'business' | 'custom';

/* ── Nearest-neighbor route optimizer ── */
function optimizeRoute(stops: { job: Job; lat: number; lng: number }[], startLat: number, startLng: number): RouteStop[] {
  const unvisited = stops.map(s => ({ ...s }));
  const ordered: RouteStop[] = [];
  let currentLat = startLat;
  let currentLng = startLng;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const d = haversineKm(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    const stop = unvisited[nearestIdx];
    ordered.push({
      job: stop.job,
      order: ordered.length + 1,
      driveKm: Math.round(nearestDist * 10) / 10,
      driveMin: Math.max(1, Math.round(nearestDist / 0.8)), // ~48 km/h avg speed
    });
    currentLat = stop.lat;
    currentLng = stop.lng;
    unvisited.splice(nearestIdx, 1);
  }

  return ordered;
}

export default function DailyRouteOptimizer() {
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [startPoint, setStartPoint] = useState<StartPoint>('business');
  const [customStart, setCustomStart] = useState('');
  const [route, setRoute] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [error, setError] = useState('');

  // Get today's scheduled + in-progress jobs
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayJobs = jobs.filter(j => {
      const d = new Date(j.scheduledDate);
      return d >= today && d < tomorrow && (j.status === 'scheduled' || j.status === 'in-progress');
    });
    setTodayJobs(dayJobs);
  }, []);

  const handleOptimize = useCallback(async () => {
    if (todayJobs.length === 0) return;
    setLoading(true);
    setError('');
    setOptimized(false);

    // Geocode all job addresses
    const geoResults = await Promise.all(
      todayJobs.map(async (job) => {
        const coords = await geocode(job.address, job.city, job.state);
        return { job, lat: coords?.lat || 0, lng: coords?.lng || 0 };
      })
    );

    const validStops = geoResults.filter(s => s.lat !== 0 && s.lng !== 0);
    if (validStops.length === 0) {
      setError('Could not find addresses. Please check your job locations.');
      setLoading(false);
      return;
    }

    // Determine start point
    let startLat = 30.2672; // Default: Austin, TX
    let startLng = -97.7431;
    const startLabel = customStart || 'Business';

    if (customStart) {
      const geo = await geocode(customStart, '', '');
      if (geo) { startLat = geo.lat; startLng = geo.lng; }
    }

    const ordered = optimizeRoute(validStops, startLat, startLng);
    setRoute(ordered);
    setOptimized(true);
    setLoading(false);
  }, [todayJobs, customStart]);

  const totalDriveTime = useMemo(
    () => route.reduce((s, r) => s + (r.driveMin || 0), 0),
    [route]
  );

  const totalDriveKm = useMemo(
    () => route.reduce((s, r) => s + (r.driveKm || 0), 0),
    [route]
  );

  const totalDriveMin = totalDriveTime;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-bright flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Daily Route Optimizer</h3>
            <p className="text-[11px] text-muted-foreground">
              {todayJobs.length} job{todayJobs.length !== 1 ? 's' : ''} today
              {optimized && ` · ${totalDriveKm} km · ~${totalDriveMin} min driving`}
            </p>
          </div>
        </div>
        {optimized && (
          <button
            onClick={() => { setOptimized(false); setRoute([]); }}
            className="text-xs text-muted-foreground/80 hover:text-muted-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {todayJobs.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-muted-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No jobs scheduled today</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add jobs to get route suggestions</p>
        </div>
      ) : !optimized ? (
        <div className="space-y-3">
          {/* Start point selector */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Where are you starting from?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setStartPoint('business'); setCustomStart(''); }}
                className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-all ${
                  startPoint === 'business' && !customStart
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                🏢 Business
              </button>
              <button
                onClick={() => { setStartPoint('home'); setCustomStart(''); }}
                className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-all ${
                  startPoint === 'home' && !customStart
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                🏠 Home
              </button>
            </div>
          </div>

          {/* Custom address input */}
          <div>
            <input
              type="text"
              placeholder="Or type a custom starting address..."
              value={customStart}
              onChange={e => { setCustomStart(e.target.value); setStartPoint('custom'); }}
              className="w-full h-9 px-3 rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-all"
            />
          </div>

          {/* Today's jobs preview */}
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {todayJobs.map((job, i) => (
              <div key={job.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{job.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{job.address}, {job.city}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  job.status === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-tint text-primary'
                }`}>
                  {job.status === 'urgent' ? 'URGENT' : job.status}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">{error}</div>
          )}

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                Optimize My Route
              </>
            )}
          </button>
        </div>
      ) : (
        /* ── Optimized Route Display ── */
        <div className="space-y-1">
          {/* Summary bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {todayJobs.length} stops
            </div>
            <span className="text-emerald-300">·</span>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              {totalDriveKm} km
            </div>
            <span className="text-emerald-300">·</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ~{totalDriveTime} min driving
            </div>
          </div>

          {/* Stops list */}
          {route.map((stop, i) => (
            <div key={stop.job.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors">
              {/* Order badge */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                i === 0 ? 'bg-emerald-500 text-white' : 'bg-primary text-white'
              }`}>
                {stop.order}
              </div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{stop.job.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{stop.job.address}, {stop.job.city}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">{stop.job.clientName}</p>
              </div>

              {/* Drive info */}
              <div className="text-right shrink-0">
                {i > 0 && (
                  <>
                    <p className="text-xs font-semibold text-foreground">{stop.driveKm} km</p>
                    <p className="text-[10px] text-muted-foreground">{stop.driveMin} min</p>
                  </>
                )}
                {i === 0 && (
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Start
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
