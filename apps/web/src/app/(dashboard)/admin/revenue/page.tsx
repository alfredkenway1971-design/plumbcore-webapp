'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Loading State ── */

function RevenueLoading() {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm ring-1 ring-black/5">
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Error State ── */

function RevenueError({ error }: { error: string }) {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="bg-white rounded-2xl border border-red-500/10 shadow-sm ring-1 ring-black/5 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Failed to load revenue data</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-tint0 text-white text-sm font-medium hover:bg-primary transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function AdminRevenuePage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) return <RevenueLoading />;
  if (error) return <RevenueError error={error} />;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            $0 MRR · $0 ARR · 0 active accounts
          </p>
        </div>
      </div>

      {/* KPI Cards - all zeros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Monthly Recurring Revenue', value: '$0', icon: DollarSign, color: 'bg-blue-tint0' },
          { label: 'Annual Run Rate (ARR)', value: '$0', icon: TrendingUp, color: 'bg-violet-500' },
          { label: 'Avg Rev / Customer', value: '$0', icon: Users, color: 'bg-emerald-500' },
          { label: 'Churn Rate', value: '0%', icon: TrendingDown, color: 'bg-red-500' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1.5">{kpi.value}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Data will appear once revenue is tracked</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5 p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-tint flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No revenue data yet</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Revenue analytics, MRR charts, plan breakdowns, and lead revenue reports will appear here once plumbers start subscribing and generating revenue on the platform.
        </p>
      </div>
    </div>
  );
}
