'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  StatusBadge,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { jobs, teamMembers, clients, inventory, invoices, getStats } from '@/lib/mock-data';

/* ── Helpers ── */

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function diffDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

/* ── Skeleton Components ── */

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl ring-1 ring-black/5 bg-white p-5">
      <div className="h-4 w-1/3 rounded bg-white/5" />
      <div className="h-8 w-3/4 rounded bg-white/5" />
      <div className="flex gap-2">
        <div className="h-3 w-16 rounded bg-white/5" />
        <div className="h-3 w-12 rounded bg-white/5" />
      </div>
    </div>
  );
}

function SkeletonBarChart() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl ring-1 ring-black/5 bg-white p-5">
      <div className="h-4 w-1/2 rounded bg-white/5" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-4 w-28 rounded bg-white/5" />
          <div className={`h-4 rounded bg-white/5`} style={{ width: `${40 + i * 15}%` }} />
          <div className="h-4 w-16 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl ring-1 ring-black/5 bg-white p-5">
      <div className="h-4 w-1/3 rounded bg-white/5" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="h-4 w-24 rounded bg-white/5" />
          <div className="h-4 w-20 rounded bg-white/5" />
          <div className="h-4 w-16 rounded bg-white/5" />
          <div className="h-4 w-16 rounded bg-white/5" />
          <div className="h-4 w-12 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

/* ── Star Rating Component ── */

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        if (i < full) return <svg key={i} className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
        if (i === full && half) return <svg key={i} className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stopColor="currentColor" /><stop offset="50%" stopColor="transparent" /></linearGradient></defs><path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
        return <svg key={i} className="h-3.5 w-3.5 text-foreground/10" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
      })}
    </span>
  );
}

/* ── Sortable Table Header ── */

type SortDir = 'asc' | 'desc' | null;

function SortHeader({ label, active, direction, onClick }: { label: string; active: boolean; direction: SortDir; onClick: () => void }) {
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && direction && (
          <svg className={`h-3 w-3 transition-transform ${direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        )}
      </span>
    </th>
  );
}

/* ── Main Page ── */

type DateRange = '7d' | '30d' | '90d' | 'year';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [techSort, setTechSort] = useState<{ key: string; dir: SortDir }>({ key: 'revenue', dir: 'desc' });

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        getStats();
        setLoading(false);
      } catch {
        setError('Failed to load report data.');
        setLoading(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        getStats();
        setLoading(false);
      } catch {
        setError('Failed to load report data.');
        setLoading(false);
      }
    }, 1200);
  };

  /* ── Derived Report Data ── */

  const reportData = useMemo(() => {
    if (loading || error) return null;

    // 1. Revenue by Technician
    const revenueByTech: Record<string, number> = {};
    teamMembers.forEach((t) => { revenueByTech[t.name] = 0; });

    const completedJobs = jobs.filter((j) => j.status === 'completed' && j.actualCost);
    completedJobs.forEach((j) => {
      j.assignedTo.forEach((techId: string) => {
        const tech = teamMembers.find((t) => t.id === techId);
        if (tech) {
          revenueByTech[tech.name] = (revenueByTech[tech.name] || 0) + (j.actualCost || j.estimatedCost);
        }
      });
    });

    const sortedTechRevenue = Object.entries(revenueByTech)
      .filter(([, rev]) => rev > 0)
      .sort(([, a], [, b]) => b - a);

    const maxRevenue = Math.max(...sortedTechRevenue.map(([, v]) => v), 1);

    // 2. Average Job Duration
    const completedWithDates = jobs.filter((j) => j.status === 'completed' && j.completedDate);
    const durations = completedWithDates.map((j) => ({
      days: diffDays(j.scheduledDate, j.completedDate!),
      title: j.title,
    }));

    const avgDays =
      durations.length > 0
        ? Math.round(durations.reduce((sum, d) => sum + d.days, 0) / durations.length)
        : 0;

    // Most common job type
    const titleWords: Record<string, number> = {};
    completedJobs.forEach((j) => {
      const key = j.title.split(' ').slice(0, 2).join(' ');
      titleWords[key] = (titleWords[key] || 0) + 1;
    });
    const mostCommonType = Object.entries(titleWords).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    // Fastest completed category
    const categories = ['Water Heater', 'Drain', 'Sewer', 'Faucet', 'Toilet', 'Pipe', 'Sump Pump', 'Disposal', 'Spigot', 'Leak'];
    const catDurations: Record<string, number[]> = {};
    completedWithDates.forEach((j) => {
      for (const cat of categories) {
        if (j.title.toLowerCase().includes(cat.toLowerCase())) {
          if (!catDurations[cat]) catDurations[cat] = [];
          catDurations[cat].push(diffDays(j.scheduledDate, j.completedDate!));
          break;
        }
      }
    });
    let fastestCat = { name: 'N/A', days: Infinity };
    Object.entries(catDurations).forEach(([name, days]) => {
      const avg = days.reduce((s, d) => s + d, 0) / days.length;
      if (avg < fastestCat.days) {
        fastestCat = { name, days: Math.round(avg) };
      }
    });

    // 3. First-Time Fix Rate
    const nonScheduled = jobs.filter((j) => j.status !== 'scheduled');
    const completedCount = jobs.filter((j) => j.status === 'completed').length;
    const fixRate = nonScheduled.length > 0
      ? Math.round((completedCount / nonScheduled.length) * 100)
      : 0;

    const recentJobs = jobs.filter((j) => j.status === 'completed' && j.completedDate && j.completedDate >= '2024-07-01');
    const olderJobs = jobs.filter((j) => j.status === 'completed' && j.completedDate && j.completedDate < '2024-07-01');
    const recentRate = recentJobs.length / Math.max(jobs.filter((j) => j.status !== 'scheduled' && j.completedDate && j.completedDate >= '2024-07-01').length, 1);
    const olderRate = olderJobs.length / Math.max(jobs.filter((j) => j.status !== 'scheduled' && j.completedDate && j.completedDate < '2024-07-01').length, 1);
    const trendUp = recentRate >= olderRate;

    // === NEW: Revenue Overview ===
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly revenue (last 12 months)
    const monthlyRevenue: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const m = (currentMonth - i + 12) % 12;
      const y = currentYear - (currentMonth - i < 0 ? 1 : 0);
      const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;
      // Simple approach: use paid invoices this month from actual data + some mock extrapolation
      const monthRevenue = invoices
        .filter(inv => inv.status === 'paid' && inv.paidDate && inv.paidDate.startsWith(monthStr))
        .reduce((sum, inv) => sum + (inv.paidAmount ?? inv.amount), 0);
      monthlyRevenue.push(monthRevenue || Math.round(15000 + Math.random() * 20000));
    }

    const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1];
    const lastMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2] || 0;
    const revenueChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // === NEW: Technician Performance ===
    interface TechPerf {
      name: string;
      jobsCompleted: number;
      revenue: number;
      rating: number;
      onTime: number;
    }
    const techPerformance: TechPerf[] = teamMembers.map(tech => {
      const techJobs = jobs.filter(j => j.assignedTo.includes(tech.id));
      const completed = techJobs.filter(j => j.status === 'completed');
      const techRevenue = completed.reduce((sum, j) => sum + (j.actualCost || j.estimatedCost), 0);
      const onTimeCount = completed.filter(j => !j.completedDate || !j.scheduledDate || new Date(j.completedDate) <= new Date(j.scheduledDate)).length;
      const onTimePct = completed.length > 0 ? Math.round((onTimeCount / completed.length) * 100) : 0;
      return {
        name: tech.name,
        jobsCompleted: completed.length,
        revenue: techRevenue,
        rating: tech.rating,
        onTime: onTimePct,
      };
    });

    // === NEW: Customer Acquisition ===
    const newThisMonth = clients.filter((c: any) => {
      const d = new Date(c.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const repeatClients = clients.filter((c: any) => c.totalJobs > 1).length;
    const repeatRate = clients.length > 0 ? Math.round((repeatClients / clients.length) * 100) : 0;

    // Acquisition trend (last 6 months)
    const acquisitionTrend: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = (currentMonth - i + 12) % 12;
      const y = currentYear - (currentMonth - i < 0 ? 1 : 0);
      const count = clients.filter((c: any) => {
        const d = new Date(c.createdAt);
        return d.getMonth() === m && d.getFullYear() === y;
      }).length;
      acquisitionTrend.push(count);
    }

    // === NEW: Inventory Turnover ===
    // Estimate parts used from completed jobs (materialsCost / 100 avg per part)
    const totalPartsUsed = completedJobs.reduce((sum, j) => sum + (j.materialsCost ? Math.round(j.materialsCost / 100) : 0), 0);
    const totalInventory = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const turnoverRate = totalInventory > 0 ? (totalPartsUsed / totalInventory) : 0;

    // Most/least used parts (use inventory items sorted by quantity as proxy)
    const sortedByUsage = [...inventory].sort((a, b) => a.quantity - b.quantity);
    const mostUsedPart = sortedByUsage[0]?.name || 'N/A';
    const leastUsedPart = sortedByUsage[sortedByUsage.length - 1]?.name || 'N/A';

    // Top 5 most used
    const top5Parts = sortedByUsage.slice(0, 5).map((item: any) => ({
      name: item.name,
      uses: Math.round(item.quantity * 0.7 + Math.random() * 10),
    }));

    const maxUses = Math.max(...top5Parts.map(p => p.uses), 1);

    return {
      sortedTechRevenue,
      maxRevenue,
      avgDays,
      mostCommonType,
      fastestCat,
      fixRate,
      trendUp,
      monthlyRevenue,
      currentMonthRevenue,
      lastMonthRevenue,
      revenueChange,
      techPerformance,
      newThisMonth,
      totalCustomers: clients.length,
      repeatRate,
      acquisitionTrend,
      totalPartsUsed,
      mostUsedPart,
      leastUsedPart,
      turnoverRate: Math.round(turnoverRate * 100) / 100,
      top5Parts,
      maxUses,
    };
  }, [loading, error]);

  /* ── Empty Check ── */
  const hasData = jobs.length > 0 && teamMembers.length > 0;

  /* ── Sort Tech Performance ── */
  const sortedTech = useMemo(() => {
    if (!reportData) return [];
    const data = [...reportData.techPerformance];
    const { key, dir } = techSort;
    if (!dir) return data;
    data.sort((a, b) => {
      const aVal = a[key as keyof typeof a];
      const bVal = b[key as keyof typeof b];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return dir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return data;
  }, [reportData, techSort]);

  const handleSort = (key: string) => {
    setTechSort(prev => ({
      key,
      dir: prev.key === key ? (prev.dir === 'asc' ? 'desc' : prev.dir === 'desc' ? null : 'asc') : 'asc',
    }));
  };

  /* ── Export Handlers ── */
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Section,Metric,Value,Date'];
    const rows: string[] = [];
    if (reportData) {
      rows.push(`Revenue Overview,Total Revenue,${reportData.currentMonthRevenue},${new Date().toISOString()}`);
      rows.push(`Revenue Overview,vs Last Month,${reportData.lastMonthRevenue},${new Date().toISOString()}`);
      rows.push(`Revenue Overview,Change %,${reportData.revenueChange.toFixed(1)}%,${new Date().toISOString()}`);
      reportData.techPerformance.forEach(t => {
        rows.push(`Technician,${t.name},${t.jobsCompleted} jobs / ${t.revenue} revenue,${new Date().toISOString()}`);
      });
      rows.push(`Acquisition,New Customers,${reportData.newThisMonth},${new Date().toISOString()}`);
      rows.push(`Acquisition,Repeat Rate,${reportData.repeatRate}%,${new Date().toISOString()}`);
      rows.push(`Inventory,Total Parts Used,${reportData.totalPartsUsed},${new Date().toISOString()}`);
      rows.push(`Inventory,Turnover Rate,${reportData.turnoverRate},${new Date().toISOString()}`);
    }
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plumbcore-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentMonth = now.getMonth();

  /* ── Render ── */

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState
            title="Failed to load reports"
            message={error}
            onRetry={handleRetry}
          />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkeletonBarChart />
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <SkeletonTable />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="Not enough data yet"
            description="Reports will populate as you complete more jobs."
          />
        </Card>
      </div>
    );
  }

  const maxMonthlyVal = Math.max(...reportData!.monthlyRevenue, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <div className="flex rounded-xl ring-1 ring-black/5 overflow-hidden">
            {(['7d', '30d', '90d', 'year'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground/80 hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'This Year'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>Export as PDF</Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>Export as CSV</Button>
        </div>
      </div>

      {/* Original Report Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue by Technician (original) */}
        <Card variant="default" padding="lg">
          <h2 className="mb-4 text-base font-semibold text-foreground">Revenue by Technician</h2>
          {reportData!.sortedTechRevenue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed jobs with revenue data.</p>
          ) : (
            <div className="space-y-3">
              {reportData!.sortedTechRevenue.map(([name, revenue]) => {
                const pct = (revenue / reportData!.maxRevenue) * 100;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-muted-foreground/80 font-medium truncate" title={name}>
                      {name}
                    </span>
                    <div className="flex-1 h-6 rounded-md bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-md bg-primary transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Original Stats Cards */}
        <div className="space-y-4">
          <Card variant="default" padding="lg">
            <h2 className="mb-3 text-base font-semibold text-foreground">Average Job Duration</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{reportData!.avgDays}</span>
              <span className="text-sm text-muted-foreground">days (completed jobs)</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Most Common Job Type</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{reportData!.mostCommonType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fastest Completed</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {reportData!.fastestCat.name}
                  <span className="ml-1 text-xs text-muted-foreground font-normal">({reportData!.fastestCat.days}d avg)</span>
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">First-Time Fix Rate</h2>
                <p className="mt-1 text-xs text-muted-foreground">Jobs completed on first visit</p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  reportData!.trendUp
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {reportData!.trendUp ? '↑' : '↓'} {reportData!.trendUp ? '+2.1%' : '-1.3%'}
              </span>
            </div>
            <p className="mt-2 text-4xl font-bold text-primary">{reportData!.fixRate}%</p>
          </Card>
        </div>
      </div>

      {/* === REVENUE OVERVIEW === */}
      <Card variant="default" padding="lg">
        <h2 className="mb-5 text-base font-semibold text-foreground">Revenue Overview</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Revenue (Current Month)</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(reportData!.currentMonthRevenue)}</p>
          </div>
          <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-4">
            <p className="text-xs text-muted-foreground mb-1">vs Last Month</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(reportData!.lastMonthRevenue)}</p>
          </div>
          <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-4">
            <p className="text-xs text-muted-foreground mb-1">% Change</p>
            <p className={`text-2xl font-bold ${reportData!.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {reportData!.revenueChange >= 0 ? '+' : ''}{reportData!.revenueChange.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* SVG Line Chart */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Monthly Revenue Trend (12 months)</p>
          <div className="w-full h-48">
            <svg viewBox="0 0 600 160" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3].map((i: any) => (
                <line key={`grid-${i}`} x1="0" y1={40 + i * 30} x2="600" y2={40 + i * 30} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}
              {/* Line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={reportData!.monthlyRevenue.map((val, i) => {
                  const x = 25 + (i / 11) * 550;
                  const y = 150 - (val / maxMonthlyVal) * 110;
                  return `${x},${y}`;
                }).join(' ')}
              />
              {/* Area fill */}
              <polygon
                fill="url(#gradient)"
                points={
                  reportData!.monthlyRevenue.map((val, i) => {
                    const x = 25 + (i / 11) * 550;
                    const y = 150 - (val / maxMonthlyVal) * 110;
                    return `${x},${y}`;
                  }).join(' ') + ` 25,150 575,150`
                }
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Data points */}
              {reportData!.monthlyRevenue.map((val, i) => {
                const x = 25 + (i / 11) * 550;
                const y = 150 - (val / maxMonthlyVal) * 110;
                return (
                  <circle key={`dot-${i}`} cx={x} cy={y} r="3" fill="#3b82f6" stroke="#0a0e2a" strokeWidth="1.5" />
                );
              })}
            </svg>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between mt-1 px-1">
            {reportData!.monthlyRevenue.map((_, i) => {
              const m = (currentMonth - 11 + i + 12) % 12;
              return (
                <span key={i} className="text-[10px] text-muted-foreground">{monthLabels[m]}</span>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue Bars */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Monthly Revenue Breakdown</p>
          <div className="flex items-end gap-1.5 h-24">
            {reportData!.monthlyRevenue.map((val, i) => {
              const pct = (val / maxMonthlyVal) * 100;
              const m = (currentMonth - 11 + i + 12) % 12;
              const isCurrent = i === reportData!.monthlyRevenue.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground/80 font-medium">{formatCurrency(val)}</span>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${isCurrent ? 'bg-primary' : 'bg-primary/60'}`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                    title={`${monthLabels[m]}: ${formatCurrency(val)}`}
                  />
                  <span className={`text-[10px] ${isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{monthLabels[m]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* === TECHNICIAN PERFORMANCE === */}
      <Card variant="default" padding="lg">
        <h2 className="mb-4 text-base font-semibold text-foreground">Technician Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <SortHeader label="Tech Name" active={techSort.key === 'name'} direction={techSort.key === 'name' ? techSort.dir : null} onClick={() => handleSort('name')} />
                <SortHeader label="Jobs Completed" active={techSort.key === 'jobsCompleted'} direction={techSort.key === 'jobsCompleted' ? techSort.dir : null} onClick={() => handleSort('jobsCompleted')} />
                <SortHeader label="Revenue Generated" active={techSort.key === 'revenue'} direction={techSort.key === 'revenue' ? techSort.dir : null} onClick={() => handleSort('revenue')} />
                <SortHeader label="Avg Rating" active={techSort.key === 'rating'} direction={techSort.key === 'rating' ? techSort.dir : null} onClick={() => handleSort('rating')} />
                <SortHeader label="On-Time %" active={techSort.key === 'onTime'} direction={techSort.key === 'onTime' ? techSort.dir : null} onClick={() => handleSort('onTime')} />
              </tr>
            </thead>
            <tbody>
              {sortedTech.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No technician data available.</td>
                </tr>
              ) : (
                sortedTech.map((tech, i) => (
                  <tr key={tech.name} className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${i === 0 ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-tint text-[10px] font-semibold text-primary">
                          {tech.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-foreground">{tech.name}</span>
                        {i === 0 && <span className="text-[10px] text-primary/70 font-semibold">TOP</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{tech.jobsCompleted}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{formatCurrency(tech.revenue)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating rating={tech.rating} />
                        <span className="text-xs text-muted-foreground/80">{tech.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        tech.onTime >= 90 ? 'text-green-600' : tech.onTime >= 75 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {tech.onTime}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* === CUSTOMER ACQUISITION + INVENTORY TURNOVER Row === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Customer Acquisition */}
        <Card variant="default" padding="lg">
          <h2 className="mb-4 text-base font-semibold text-foreground">Customer Acquisition</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-3 text-center">
              <p className="text-2xl font-bold text-primary">{reportData!.newThisMonth}</p>
              <p className="text-[10px] text-muted-foreground">New This Month</p>
            </div>
            <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{reportData!.totalCustomers}</p>
              <p className="text-[10px] text-muted-foreground">Total Customers</p>
            </div>
            <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{reportData!.repeatRate}%</p>
              <p className="text-[10px] text-muted-foreground">Repeat Rate</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3">Acquisition Trend (Last 6 Months)</p>
          <div className="flex items-end gap-2 h-24">
            {reportData!.acquisitionTrend.map((val, i) => {
              const maxAcq = Math.max(...reportData!.acquisitionTrend, 1);
              const pct = (val / maxAcq) * 100;
              const m = (currentMonth - 5 + i + 12) % 12;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground/80">{val}</span>
                  <div
                    className="w-full rounded-t-sm bg-primary transition-all duration-500"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{monthLabels[m]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Inventory Turnover */}
        <Card variant="default" padding="lg">
          <h2 className="mb-4 text-base font-semibold text-foreground">Inventory Turnover</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-3 text-center">
              <p className="text-xl font-bold text-foreground">{reportData!.totalPartsUsed}</p>
              <p className="text-[10px] text-muted-foreground">Total Parts Used</p>
            </div>
            <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-3 text-center">
              <p className="text-xl font-bold text-foreground">{reportData!.turnoverRate}</p>
              <p className="text-[10px] text-muted-foreground">Turnover Rate</p>
            </div>
            <div className="rounded-xl ring-1 ring-black/5 bg-white/[0.02] p-3 text-center">
              <p className="text-xl font-bold text-foreground">{inventory.length}</p>
              <p className="text-[10px] text-muted-foreground">Total SKUs</p>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Most Used:</span>
              <span className="text-foreground font-medium">{reportData!.mostUsedPart}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Least Used:</span>
              <span className="text-foreground font-medium">{reportData!.leastUsedPart}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2">Top 5 Most Used Parts</p>
          <div className="space-y-2">
            {reportData!.top5Parts.map((part) => (
              <div key={part.name} className="flex items-center gap-2">
                <span className="w-1/3 text-xs text-muted-foreground/80 truncate" title={part.name}>{part.name}</span>
                <div className="flex-1 h-4 rounded bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded bg-primary/70 transition-all"
                    style={{ width: `${(part.uses / reportData!.maxUses) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs text-foreground font-medium">{part.uses}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Original Recent Reports + Export */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="default" padding="lg">
          <h2 className="mb-3 text-base font-semibold text-foreground">Recent Reports</h2>
          <div className="space-y-2">
            {[
              { name: 'Monthly Revenue Summary', date: 'Jul 2026', status: 'Ready' },
              { name: 'Technician Performance', date: 'Q2 2026', status: 'Ready' },
              { name: 'Inventory Valuation', date: 'Jun 2026', status: 'Ready' },
              { name: 'Job Completion Trends', date: 'Weekly', status: 'Generating' },
            ].map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between rounded-xl ring-1 ring-black/5 px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    r.status === 'Ready'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="default" padding="lg" className="flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-4">Download full report data</p>
          <div className="flex gap-3">
            <Button variant="outline" size="md" onClick={handleExportPDF}>Export as PDF</Button>
            <Button variant="outline" size="md" onClick={handleExportCSV}>Export as CSV</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}