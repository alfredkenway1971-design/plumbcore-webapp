'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { jobs, teamMembers } from '@/lib/mock-data';
import type { Job } from '@/lib/mock-data';
import dynamic from 'next/dynamic';

// ── Dynamic import (no SSR for Leaflet) ──
const MapContent = dynamic(() => import('./RouteOptimizerMapInner'), { ssr: false });

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

/* ── Helpers ── */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function getStopIcon(stopOrder: number): string {
  return ['🟢', '🟡', '🟠', '🔴', '🔵', '🟣'][stopOrder] || `${stopOrder + 1}.`;
}

export default function RouteOptimizerMap() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [selectedTechFilter, setSelectedTechFilter] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState<'home' | 'business' | 'custom'>('business');
  const [customStart, setCustomStart] = useState('');

  // Filter jobs for route optimization
  const activeJobs = jobs.filter(
    (j) => j.status === 'in-progress' || j.status === 'scheduled'
  );

  const filteredJobs = selectedTechFilter
    ? activeJobs.filter((j) => j.assignedTo.includes(selectedTechFilter))
    : activeJobs;

  const handleOptimize = useCallback(async () => {
    const jobsToRoute = showAllJobs ? activeJobs : filteredJobs;
    if (jobsToRoute.length < 2) {
      setError('Need at least 2 jobs to optimize a route');
      return;
    }

    setOptimizing(true);
    setError(null);

    try {
      const stops = jobsToRoute.map((j) => ({
        id: j.id,
        address: j.address,
        city: j.city,
        state: j.state,
        zip: j.zip,
      }));

      const res = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stops, startPoint, customStart }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Optimization failed');
        setOptimizing(false);
        return;
      }

      setRouteData({
        stops: data.stops,
        totalDuration: data.totalDuration,
        totalDistance: data.totalDistance,
        routeGeometry: data.routeGeometry,
        optimized: data.optimized,
      });
    } catch (e: any) {
      setError(e.message || 'Network error');
    }

    setOptimizing(false);
  }, [showAllJobs, filteredJobs, activeJobs]);

  // Initial load — show locations without optimization
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const stops = activeJobs.map((j) => ({
          id: j.id,
          address: j.address,
          city: j.city,
          state: j.state,
          zip: j.zip,
        }));

        // Just geocode to show pins initially (no OSRM optimize)
        const res = await fetch('/api/optimize-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stops }),
        });

        const data = await res.json();
        if (data.success) {
          setRouteData({
            stops: data.stops,
            totalDuration: data.totalDuration,
            totalDistance: data.totalDistance,
            routeGeometry: null,
            optimized: false,
          });
        }
      } catch {
        // Silently fail — map will show empty
      }
      setLoading(false);
    };

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tech filter */}
          <select
            value={selectedTechFilter || ''}
            onChange={(e) => setSelectedTechFilter(e.target.value || null)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-gray-600 outline-none focus:border-electric/50"
          >
            <option value="">All Technicians</option>
            {teamMembers.map((tm) => (
              <option key={tm.id} value={tm.id}>{tm.name}</option>
            ))}
          </select>

          {/* Starting point */}
          <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5">
            <span className="text-[10px] font-medium text-gray-500 mr-1">From:</span>
            {(['business', 'home', 'custom'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => { setStartPoint(opt); if (opt !== 'custom') setCustomStart(''); }}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  startPoint === opt && (opt !== 'custom' || customStart)
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt === 'business' ? '🏢 Biz' : opt === 'home' ? '🏠 Home' : '📍 Custom'}
              </button>
            ))}
            {startPoint === 'custom' && (
              <input
                type="text"
                placeholder="Address..."
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-28 ml-1 px-2 py-0.5 rounded border border-border text-[10px] outline-none"
              />
            )}
          </div>

          {/* Toggle all jobs */}
          <button
            onClick={() => setShowAllJobs(!showAllJobs)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              showAllJobs
                ? 'bg-electric text-[#0a0e2a] border-electric'
                : 'text-gray-500 border-border hover:border-gray-300'
            }`}
          >
            {showAllJobs ? 'All Jobs' : `${filteredJobs.length} Jobs`}
          </button>
        </div>

        <button
          onClick={handleOptimize}
          disabled={optimizing || activeJobs.length < 2}
          className="rounded-lg bg-electric px-4 py-2 text-xs font-semibold text-[#0a0e2a] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1.5"
        >
          {optimizing ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Optimizing...
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Optimize Route
            </>
          )}
        </button>
      </div>

      {/* ── Route summary ── */}
      {routeData && routeData.optimized && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-blue-tint/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Stops</p>
            <p className="text-lg font-bold text-foreground">{routeData.stops.length}</p>
          </div>
          <div className="rounded-lg bg-green-50/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Total Time</p>
            <p className="text-lg font-bold text-foreground">{formatDuration(routeData.totalDuration)}</p>
          </div>
          <div className="rounded-lg bg-amber-50/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Total Distance</p>
            <p className="text-lg font-bold text-foreground">{formatDistance(routeData.totalDistance)}</p>
          </div>
          <div className="rounded-lg bg-purple-50/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Optimized</p>
            <p className="text-lg font-bold text-green-600">Yes ✓</p>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ── Map ── */}
      <div className="rounded-xl overflow-hidden border border-border">
        {loading ? (
          <div className="h-[400px] sm:h-[500px] flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-6 w-6 text-gray-300" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm text-muted-foreground/80">Loading map...</p>
            </div>
          </div>
        ) : (
          <MapContent
            routeData={routeData}
            jobs={activeJobs}
            filteredJobIds={showAllJobs ? activeJobs.map(j => j.id) : filteredJobs.map(j => j.id)}
          />
        )}
      </div>

      {/* ── Stop list ── */}
      {routeData && routeData.stops.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {routeData.optimized ? 'Optimized Route Order' : 'Stop Locations'}
          </h3>
          <div className="divide-y divide-gray-100 border border-border rounded-xl overflow-hidden bg-white">
            {routeData.stops.map((stop) => {
              const job = jobs.find((j) => j.id === stop.id);
              return (
                <div key={stop.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-electric/10 text-xs font-bold text-electric shrink-0 mt-0.5">
                    {stop.stopOrder + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {job?.title || 'Unknown Job'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {stop.address}, {stop.city}
                    </p>
                    {stop.durationFromPrev > 0 && (
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        ← {formatDuration(stop.durationFromPrev)} drive ({formatDistance(stop.distanceFromPrev)})
                      </p>
                    )}
                  </div>
                  {stop.stopOrder > 0 && (
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-gray-700">{formatDuration(stop.cumulativeDuration)}</p>
                      <p className="text-[10px] text-muted-foreground/80">{formatDistance(stop.cumulativeDistance)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
