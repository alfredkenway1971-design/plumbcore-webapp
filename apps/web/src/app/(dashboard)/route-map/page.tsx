'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Input,
  StatusBadge,
  Avatar,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { teamMembers, jobs } from '@/lib/mock-data';
import type { TeamMember, Job } from '@/lib/mock-data';

/* ── Tech Position Data (simulated GPS coordinates on a CSS grid) ── */
interface TechPosition {
  techId: string;
  x: number; // percentage from left
  y: number; // percentage from top
  area: string;
}

const techPositions: TechPosition[] = [
  { techId: 'TECH-001', x: 22, y: 28, area: 'Downtown Austin' },
  { techId: 'TECH-002', x: 48, y: 45, area: 'South Congress' },
  { techId: 'TECH-003', x: 72, y: 22, area: 'North Burnet' },
  { techId: 'TECH-004', x: 35, y: 65, area: 'East Riverside' },
  { techId: 'TECH-005', x: 58, y: 38, area: 'Zilker' },
  { techId: 'TECH-006', x: 78, y: 60, area: 'Airport Blvd' },
];

/* ── Job positions (placed near their assigned tech) ── */
interface JobPosition {
  jobId: string;
  x: number;
  y: number;
}

function generateJobPositions(): JobPosition[] {
  return jobs.map((job, i) => {
    // Use a deterministic but scattered offset relative to tech positions
    const assignedTech = job.assignedTo[0];
    const techPos = techPositions.find((tp) => tp.techId === assignedTech);
    const baseX = techPos ? techPos.x : 50;
    const baseY = techPos ? techPos.y : 50;
    const offsetX = ((i * 13) % 17) - 8;
    const offsetY = ((i * 7) % 15) - 7;
    return {
      jobId: job.id,
      x: Math.max(2, Math.min(98, baseX + offsetX)),
      y: Math.max(2, Math.min(98, baseY + offsetY)),
    };
  });
}

/* ── Status colors ── */
const TECH_STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-500 shadow-status-success/30',
  busy: 'bg-amber-500 shadow-status-warning/30',
  away: 'bg-amber-500/60 shadow-status-warning/20',
  offline: 'bg-steel-dark shadow-black/30',
};

const TECH_PIN_COLORS: Record<string, string> = {
  online: 'bg-green-500',
  busy: 'bg-amber-500',
  away: 'bg-amber-500/60',
  offline: 'bg-steel-dark',
};

const TECH_PIN_CALM: Record<string, string> = {
  online: 'border-status-success',
  busy: 'border-status-warning',
  away: 'border-status-warning/40',
  offline: 'border-steel-dark',
};

/* ── Tech color for legend ── */
const TECH_LEGEND_COLORS = [
  'bg-blue-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-teal-500',
];

function getTechColor(index: number): string {
  return TECH_LEGEND_COLORS[index % TECH_LEGEND_COLORS.length];
}

function getTechInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDateTime(d: string) {
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' });
}

/* ── Status label ── */
function getTechStatusLabel(status: TeamMember['status']): string {
  switch (status) {
    case 'online': return 'Available';
    case 'busy': return 'On Job';
    case 'away': return 'Away';
    case 'offline': return 'Offline';
    default: return status;
  }
}

/* ── Skeleton ── */
function SkeletonMap() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-36 rounded-lg bg-gray-50" />
        <div className="h-9 w-40 rounded-lg bg-gray-50" />
      </div>
      <div className="h-[400px] rounded-xl bg-gray-100" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-gray-50" />
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function RouteMapPage() {
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedTech, setHighlightedTech] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  // Generate job positions once
  const jobPositions = useMemo(() => generateJobPositions(), []);

  // Get current job for a tech
  const getTechCurrentJob = useMemo(() => {
    const map: Record<string, Job | undefined> = {};
    teamMembers.forEach((tm) => {
      const currentJob = jobs.find(
        (j) => j.assignedTo.includes(tm.id) && (j.status === 'in-progress' || j.status === 'scheduled')
      );
      map[tm.id] = currentJob;
    });
    return map;
  }, []);

  // Tech + job pins
  const mapPins = useMemo(() => {
    const techPins = teamMembers.map((tm, idx) => {
      const pos = techPositions.find((tp) => tp.techId === tm.id);
      return {
        type: 'tech' as const,
        tech: tm,
        x: pos?.x ?? 50,
        y: pos?.y ?? 50,
        color: getTechColor(idx),
        initials: getTechInitials(tm.name),
        area: pos?.area ?? 'Unknown',
      };
    });

    const jobPinData = jobs
      .filter((j) => j.status === 'in-progress' || j.status === 'scheduled')
      .map((j) => {
        const pos = jobPositions.find((jp) => jp.jobId === j.id);
        return {
          type: 'job' as const,
          job: j,
          x: pos?.x ?? 50,
          y: pos?.y ?? 50,
          amount: j.estimatedCost,
        };
      });

    return [...techPins, ...jobPinData];
  }, [jobPositions]);

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load route map"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <SkeletonMap />
      </div>
    );
  }

  // Empty state — no team members would be extremely unusual but handle it
  if (teamMembers.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="No team members"
            description="Add team members to see them on the route map."
            action={<Button size="sm">Add Team Member</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Route Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">View technician locations and job sites in real time</p>
        </div>
        <Button
          size="sm"
          icon={
            <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          }
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Locations'}
        </Button>
      </div>

      {/* ── Map ── */}
      <Card variant="default" padding="none">
        <div className="relative w-full h-[300px] sm:h-[420px] overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/50">
          {/* Street grid overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Horizontal streets */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 11.11}
                x2="100"
                y2={i * 11.11}
                stroke="rgba(148,163,184,0.15)"
                strokeWidth="0.3"
              />
            ))}
            {/* Vertical streets */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 11.11}
                y1="0"
                x2={i * 11.11}
                y2="100"
                stroke="rgba(148,163,184,0.15)"
                strokeWidth="0.3"
              />
            ))}
            {/* Major roads */}
            <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(148,163,184,0.25)" strokeWidth="0.6" />
            <line x1="0" y1="65" x2="100" y2="65" stroke="rgba(148,163,184,0.25)" strokeWidth="0.6" />
            <line x1="30" y1="0" x2="30" y2="100" stroke="rgba(148,163,184,0.25)" strokeWidth="0.6" />
            <line x1="60" y1="0" x2="60" y2="100" stroke="rgba(148,163,184,0.25)" strokeWidth="0.6" />
            {/* Highway */}
            <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(100,116,139,0.3)" strokeWidth="0.8" />
            <line x1="0" y1="85" x2="100" y2="85" stroke="rgba(100,116,139,0.3)" strokeWidth="0.8" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(100,116,139,0.3)" strokeWidth="0.8" />
            {/* Highway shield marker */}
            <text x="52" y="13" fill="rgba(100,116,139,0.4)" fontSize="2" fontWeight="bold" fontFamily="monospace">Mopac Expy</text>
            <text x="38" y="87" fill="rgba(100,116,139,0.4)" fontSize="2" fontWeight="bold" fontFamily="monospace">IH-35</text>
            <text x="83" y="13" fill="rgba(100,116,139,0.4)" fontSize="2" fontWeight="bold" fontFamily="monospace">US-183</text>
          </svg>

          {/* Grid pattern dots */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />

          {/* Pins */}
          {mapPins.map((pin) => {
            if (pin.type === 'tech') {
              const isHighlighted = highlightedTech === pin.tech.id;
              const statusColor = TECH_PIN_COLORS[pin.tech.status] || 'bg-steel-dark';
              return (
                <div
                  key={`tech-${pin.tech.id}`}
                  className="absolute transition-all duration-300 cursor-pointer"
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isHighlighted ? 30 : 20,
                  }}
                  onClick={() => setHighlightedTech(highlightedTech === pin.tech.id ? null : pin.tech.id)}
                  title={`${pin.tech.name} — ${getTechStatusLabel(pin.tech.status)}`}
                >
                  {/* Pulse ring */}
                  {pin.tech.status === 'online' && !isHighlighted && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-green-500" style={{ width: 44, height: 44, left: -6, top: -6 }} />
                  )}
                  {/* Tech pin circle */}
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/80 text-[11px] font-bold text-gray-900 shadow-lg transition-all duration-200 ${
                      pin.color
                    } ${
                      isHighlighted
                        ? 'scale-125 ring-4 ring-electric/40 shadow-electric/30'
                        : 'hover:scale-110'
                    }`}
                  >
                    {pin.initials}
                    {/* Status dot */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        TECH_STATUS_COLORS[pin.tech.status] || 'bg-steel-dark'
                      }`}
                    />
                  </div>
                  {/* Tech name label */}
                  <div className={`absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap transition-opacity ${
                    isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <span className="px-1.5 py-0.5 rounded bg-white/90 text-[10px] font-medium text-gray-900 shadow-sm">
                      {pin.tech.name}
                    </span>
                  </div>
                </div>
              );
            }

            // Job pin
            const isHighlighted = pin.job.assignedTo.some((tid) => tid === highlightedTech);
            return (
              <div
                key={`job-${pin.job.id}`}
                className="absolute transition-all duration-300 cursor-pointer"
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHighlighted ? 25 : 10,
                }}
                onClick={() => router.push(`/jobs/${pin.job.id}`)}
                title={`${pin.job.title} — ${formatCurrency(pin.amount)}`}
              >
                <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 border-white/70 text-[9px] font-bold text-gray-900 shadow-md transition-all duration-200 ${
                  pin.job.status === 'urgent' ? 'bg-red-500' : 'bg-electric/80'
                } ${
                  isHighlighted ? 'scale-125 ring-2 ring-electric/30' : 'hover:scale-110'
                }`}>
                  <span className="truncate">${pin.amount >= 1000 ? Math.round(pin.amount / 100) / 10 + 'k' : pin.amount}</span>
                </div>
              </div>
            );
          })}

          {/* Center compass */}
          <div className="absolute top-3 left-3 pointer-events-none z-10">
            <div className="flex items-center gap-1 rounded-lg bg-white/80 backdrop-blur-sm px-2 py-1.5 border border-gray-200/30">
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7-3 3-3-3 3-7zM12 22l-3-7 3-3 3 3-3 7z" />
              </svg>
              <span className="text-[10px] text-gray-400 font-mono">Austin, TX</span>
            </div>
          </div>

          {/* Zoom controls — mobile-friendly 40px+ touch targets */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
            <button className="flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200/30 text-gray-400 hover:text-gray-900 hover:bg-white/90 transition-colors">
              <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200/30 text-gray-400 hover:text-gray-900 hover:bg-white/90 transition-colors">
              <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
          </div>

          {/* Legend overlay — hide on very small screens, show on sm+ */}
          <div className="hidden sm:block absolute top-3 right-3 pointer-events-none z-10">
            <div className="rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 border border-gray-200/30 max-w-[180px]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Technicians</p>
              <div className="space-y-1">
                {teamMembers.map((tm, idx) => (
                  <div key={tm.id} className="flex items-center gap-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${getTechColor(idx)}`} />
                    <span className="text-[10px] text-gray-400 truncate">{tm.name}</span>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ml-auto ${
                      TECH_PIN_CALM[tm.status]
                    }`} />
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-1.5 border-t border-gray-200/20">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-electric/80 border border-white/50" />
                  <span className="text-[10px] text-gray-400">Job Site</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Tech List: Desktop table, mobile cards ── */}
      {/* Desktop table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Technician</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Current Job</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teamMembers.map((tm, idx) => {
              const currentJob = getTechCurrentJob[tm.id];
              const pos = techPositions.find((tp) => tp.techId === tm.id);
              const isHighlighted = highlightedTech === tm.id;

              return (
                <tr
                  key={tm.id}
                  onClick={() => setHighlightedTech(highlightedTech === tm.id ? null : tm.id)}
                  className={`cursor-pointer transition-colors ${
                    isHighlighted
                      ? 'bg-electric/8 ring-1 ring-electric/40 ring-inset'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-gray-900 ${getTechColor(idx)}`}>
                        {getTechInitials(tm.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tm.name}</p>
                        <p className="text-[11px] text-gray-500 capitalize">{tm.role.replace('-', ' ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${TECH_PIN_COLORS[tm.status]}`} />
                      <span className="text-sm text-gray-400">{getTechStatusLabel(tm.status)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {currentJob ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/jobs/${currentJob.id}`);
                        }}
                        className="text-sm text-blue-600 hover:underline text-left"
                      >
                        {currentJob.title}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">{pos?.area || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">{formatDateTime(tm.joinedAt)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile tech cards — shown only below sm */}
      <div className="sm:hidden space-y-2">
        {teamMembers.map((tm, idx) => {
          const currentJob = getTechCurrentJob[tm.id];
          const pos = techPositions.find((tp) => tp.techId === tm.id);
          const isHighlighted = highlightedTech === tm.id;

          return (
            <div
              key={tm.id}
              onClick={() => setHighlightedTech(highlightedTech === tm.id ? null : tm.id)}
              className={`rounded-xl border bg-white p-3 cursor-pointer transition-all ${
                isHighlighted
                  ? 'border-electric/40 ring-1 ring-electric/30 bg-electric/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Top row: avatar + name + status badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold text-gray-900 ${getTechColor(idx)}`}>
                    {getTechInitials(tm.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{tm.name}</p>
                    <p className="text-[11px] text-gray-500 capitalize">{tm.role.replace('-', ' ')}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  tm.status === 'online'
                    ? 'bg-green-50 text-green-700'
                    : tm.status === 'busy'
                    ? 'bg-amber-50 text-amber-700'
                    : tm.status === 'away'
                    ? 'bg-amber-50/60 text-amber-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${TECH_PIN_COLORS[tm.status]}`} />
                  {getTechStatusLabel(tm.status)}
                </span>
              </div>
              {/* Bottom row: job, location, updated */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                {currentJob ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/jobs/${currentJob.id}`);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    {currentJob.title}
                  </button>
                ) : (
                  <span>No current job</span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {pos?.area || 'Unknown'}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDateTime(tm.joinedAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status summary bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-white px-4 py-3 border border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-gray-500">Team Status:</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            {teamMembers.filter((m) => m.status === 'online').length} Available
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            {teamMembers.filter((m) => m.status === 'busy').length} On Job
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
            {teamMembers.filter((m) => m.status === 'offline' || m.status === 'away').length} Away/Offline
          </span>
        </div>
        <span className="text-[11px] text-gray-500 whitespace-nowrap">{teamMembers.length} technicians</span>
      </div>
    </div>
  );
}
