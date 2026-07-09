'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  ErrorState,
} from '@/pkg/ui-components';
import RouteOptimizerMap from '@/components/RouteOptimizerMap';

/* ── Skeleton ── */
function SkeletonMap() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-36 rounded-xl bg-slate-50" />
        <div className="h-9 w-40 rounded-xl bg-slate-50" />
      </div>
      <div className="h-[500px] rounded-xl bg-slate-100" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-50" />
        ))}
      </div>
    </div>
  );
}

export default function RouteMapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

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

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <SkeletonMap />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Route Map</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Optimize your day&apos;s route — find the most efficient driving order between job sites
        </p>
      </div>

      <Card variant="default" padding="lg">
        <RouteOptimizerMap />
      </Card>
    </div>
  );
}
