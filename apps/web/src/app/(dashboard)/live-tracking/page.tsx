'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { jobs, teamMembers } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/store';
import { canAccess, PLAN_PRICING } from '@/lib/feature-gates';
import {
  Button, Card, EmptyState, ErrorState,
} from '@/pkg/ui-components';
import {
  getTechLocations, getNotifications, simulateLocationUpdate,
  getTechColor, getTechStatusLabel, startJob, completeJob, getJobAddress,
} from '@/lib/trackingDb';
import type { TechLocation, ArrivalNotification } from '@/lib/trackingDb';

const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false });

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 w-48 rounded-xl bg-muted" />
      <div className="h-[400px] rounded-xl bg-muted" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map((i: any) => <div key={i} className="h-20 rounded-xl bg-muted" />)}
      </div>
    </div>
  );
}

export default function LiveTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [techLocs, setTechLocs] = useState<TechLocation[]>([]);
  const [notifs, setNotifs] = useState<ArrivalNotification[]>([]);
  const [simulating, setSimulating] = useState(false);

  const company = useAuthStore((s) => s.company);
  const tier = (company?.subscription_tier || '') as string;
  const hasAccess = canAccess(tier, 'truckGps');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    setTechLocs(getTechLocations());
    setNotifs(getNotifications());
    return () => clearTimeout(t);
  }, []);

  const handleSimulate = useCallback(() => {
    setSimulating(true);
    setTimeout(() => {
      const updated = simulateLocationUpdate();
      setTechLocs([...updated]);
      setNotifs([...getNotifications()]);
      setSimulating(false);
    }, 800);
  }, []);

  const handleStartJob = useCallback((techId: string, jobId: string) => {
    startJob(techId, jobId);
    setTechLocs([...getTechLocations()]);
    setNotifs([...getNotifications()]);
  }, []);

  const handleCompleteJob = useCallback((techId: string) => {
    completeJob(techId);
    setTechLocs([...getTechLocations()]);
    setNotifs([...getNotifications()]);
  }, []);

  const activeJobs = useMemo(() => jobs.filter(j => j.status === 'in-progress' || j.status === 'scheduled'), []);
  const availableJobs = useMemo(() => activeJobs.filter(j => !techLocs.find(l => l.currentJobId === j.id)), [techLocs, activeJobs]);

  if (!hasAccess) {
    return (
      <div className="p-4 sm:p-6">
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="Live Tracking"
            description="Upgrade to Business plan to access GPS tracking and arrival notifications."
            action={<a href="/pricing"><Button size="sm">Upgrade to Business — {PLAN_PRICING.business?.priceLabel}</Button></a>}
          />
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 sm:p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;
  }

  if (loading) {
    return <div className="p-4 sm:p-6"><Skeleton /></div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Live Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time technician locations and arrival notifications</p>
        </div>
        <Button size="sm" onClick={handleSimulate} disabled={simulating}>
          {simulating ? 'Updating...' : '🔄 Simulate Movement'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Available', value: techLocs.filter(l => l.status === 'available').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'En Route', value: techLocs.filter(l => l.status === 'en_route').length, color: 'text-primary', bg: 'bg-blue-tint' },
          { label: 'On Job', value: techLocs.filter(l => l.status === 'on_job').length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Notifications', value: notifs.length, color: 'text-muted-foreground', bg: 'bg-muted' },
        ].map((s: any) => (
          <div key={s.label} className={`rounded-xl ${s.bg} px-4 py-3`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <Card padding="none" className="overflow-hidden rounded-xl">
        <LiveMap techLocs={techLocs} onCompleteJob={handleCompleteJob} />
      </Card>

      {/* Tech cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {techLocs.map(loc => {
          const currentJob = activeJobs.find(j => j.id === loc.currentJobId);
          return (
            <div key={loc.techId} className="rounded-xl ring-1 ring-black/5 bg-white p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getTechColor(loc.status) }} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{loc.techName}</p>
                  <p className="text-xs text-muted-foreground">{getTechStatusLabel(loc.status)}</p>
                </div>
                <span className="ml-auto text-[10px] text-muted-foreground/80">🔋{loc.batteryLevel}%</span>
              </div>
              {currentJob && (
                <div className="rounded-xl bg-muted p-2.5 text-sm">
                  <p className="font-medium text-foreground">{currentJob.title}</p>
                  <p className="text-xs text-muted-foreground">{currentJob.clientName} — {getJobAddress(currentJob.id)}</p>
                </div>
              )}
              <div className="flex gap-2">
                {loc.status === 'available' && (
                  <select onChange={(e) => { if (e.target.value) handleStartJob(loc.techId, e.target.value); }} value="" className="flex-1 rounded-xl ring-1 ring-black/5 px-2.5 py-1.5 text-xs outline-none">
                    <option value="">Assign to job...</option>
                    {availableJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                )}
                {(loc.status === 'on_job' || loc.status === 'en_route') && (
                  <Button size="sm" onClick={() => handleCompleteJob(loc.techId)} className="w-full">
                    ✅ Complete Job
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/80">Updated {formatTime(loc.updatedAt)}</p>
            </div>
          );
        })}
      </div>

      {/* Notifications */}
      {notifs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Recent Notifications</h3>
          <div className="space-y-1.5">
            {notifs.slice(0, 10).map(n => (
              <div key={n.id} className="flex items-center gap-3 rounded-xl bg-muted px-3.5 py-2.5 text-sm">
                <span>{n.type === 'en_route' ? '🚗' : n.type === 'ten_min' ? '⏱️' : '📍'}</span>
                <span className="text-foreground"><strong>{n.techName}</strong> → <strong>{n.customerName}</strong></span>
                <span className="text-xs text-muted-foreground/80 ml-auto">{formatTime(n.sentAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
