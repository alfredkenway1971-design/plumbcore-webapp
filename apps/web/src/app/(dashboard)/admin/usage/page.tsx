'use client';

import { useState } from 'react';
import {
  BarChart3,
  Activity,
  Zap,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Loading State ── */

function UsageLoading() {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 rounded-2xl bg-white ring-1 ring-border p-5 shadow-lg shadow-black/30">
          <Skeleton className="h-5 w-44 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-border p-5 shadow-lg shadow-black/30">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
      <div className="rounded-2xl bg-white ring-1 ring-border shadow-lg shadow-black/30">
        <Skeleton className="h-5 w-44 m-5" />
        <div className="overflow-x-auto px-5 pb-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3 w-28 mb-1" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Error State ── */

function UsageError({ error }: { error: string }) {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="bg-white rounded-2xl border border-red-100 shadow-lg shadow-black/30 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Failed to load usage data</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function AdminUsagePage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) return <UsageLoading />;
  if (error) return <UsageError error={error} />;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Usage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            0 features tracked · 0 weekly active users
          </p>
        </div>
      </div>

      {/* KPI Cards - all zeros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Feature Adoption', value: '0%', icon: Zap, color: 'bg-violet-500' },
          { label: 'Weekly Active Users', value: '0', icon: Activity, color: 'bg-primary' },
          { label: 'Features Trending Up', value: '0', icon: TrendingUp, color: 'bg-emerald-500' },
          { label: 'Active Plumbers', value: '0', icon: Users, color: 'bg-amber-500' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-white ring-1 ring-border p-5 shadow-lg shadow-black/30"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1.5">{card.value}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Data will appear once plumbers start using the platform</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      <div className="rounded-2xl bg-white ring-1 ring-border p-16 text-center shadow-lg shadow-black/30">
        <div className="w-16 h-16 rounded-2xl bg-blue-tint flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No usage data yet</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Feature adoption rates, daily active users, API usage stats, and top active companies will appear here once plumbers start using the platform's features.
        </p>
      </div>
    </div>
  );
}
