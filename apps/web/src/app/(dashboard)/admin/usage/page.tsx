'use client';

import { useState, useMemo } from 'react';
import {
  BarChart3,
  Activity,
  Zap,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Download,
  ChevronDown,
  BrainCircuit,
  Smartphone,
  FileText,
  Calendar,
  MessageSquare,
  Package,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { featureAdoption, companies } from '@/lib/admin-data';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Constants ── */

const featureIcons: Record<string, any> = {
  'ai-quote': BrainCircuit,
  scheduling: Calendar,
  invoicing: FileText,
  sms: MessageSquare,
  inventory: Package,
  reports: BarChart3,
};

/* ── Loading State ── */

function UsageLoading() {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <Skeleton className="h-5 w-44 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
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
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Failed to load usage data</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/* ── KPI Cards ── */

function UsageKPIs() {
  const totalFeatures = featureAdoption.length;
  const avgAdoption = Math.round(featureAdoption.reduce((s, f) => s + f.adoptionRate, 0) / totalFeatures);
  const totalWau = featureAdoption.reduce((s, f) => s + f.weeklyActiveUsers, 0);
  const featuresUp = featureAdoption.filter((f) => f.trend === 'up').length;

  const cards = [
    {
      label: 'Avg Feature Adoption',
      value: `${avgAdoption}%`,
      change: `+${Math.round(avgAdoption * 0.05)}% this month`,
      trend: 'up' as const,
      icon: Zap,
      color: 'bg-violet-500',
    },
    {
      label: 'Weekly Active Users',
      value: totalWau.toLocaleString(),
      change: `+${Math.round(totalWau * 0.08)} vs last week`,
      trend: 'up' as const,
      icon: Activity,
      color: 'bg-blue-500',
    },
    {
      label: 'Features Trending Up',
      value: String(featuresUp),
      change: `of ${totalFeatures} features`,
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      label: 'Active Plumbers',
      value: companies.filter((c) => c.status === 'active').length.toLocaleString(),
      change: `${companies.filter((c) => c.health === 'green').length} healthy accounts`,
      trend: 'up' as const,
      icon: Users,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1.5">{card.value}</p>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                <ArrowUp className="w-3 h-3" />
                {card.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Daily Active Users Chart (SVG Bar) ── */

function DailyActiveUsersChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Mock daily active user counts
  const data = [1120, 1350, 1280, 1420, 1180, 890, 650];
  const maxVal = Math.max(...data);
  const chartW = 700;
  const chartH = 200;
  const padL = 0;
  const padR = 0;
  const padT = 10;
  const padB = 24;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const barWidth = innerW / data.length - 12;

  const thisWeekTotal = data.reduce((s, v) => s + v, 0);
  const prevWeekTotal = thisWeekTotal - Math.round(thisWeekTotal * 0.12);
  const pctChange = (((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-900">Daily Active Users (This Week)</h3>
            <span className="flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              <ArrowUp className="w-3 h-3" /> {pctChange}%
            </span>
          </div>
          <p className="text-xs text-slate-400">vs {prevWeekTotal.toLocaleString()} last week</p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-end justify-between gap-1" style={{ height: chartH }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" preserveAspectRatio="none">
          {data.map((val, i) => {
            const barH = (val / maxVal) * innerH;
            const x = padL + (i / data.length) * innerW + 6;
            const y = padT + innerH - barH;
            const w = barWidth;
            const isHigh = val >= 1200;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={barH}
                  rx={4}
                  fill={isHigh ? '#3B82F6' : '#93C5FD'}
                  opacity={0.85}
                />
                <text
                  x={x + w / 2}
                  y={padT + innerH + 14}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="system-ui"
                >
                  {days[i]}
                </text>
                {val === Math.max(...data) && (
                  <text
                    x={x + w / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fill="#3B82F6"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="system-ui"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center">
        Total this week: {thisWeekTotal.toLocaleString()} active sessions
      </p>
    </div>
  );
}

/* ── Feature Adoption Heatmap ── */

function FeatureAdoptionHeatmap() {
  const maxWau = Math.max(...featureAdoption.map((f) => f.weeklyActiveUsers));
  const maxEnabled = Math.max(...featureAdoption.map((f) => f.totalEnabled));

  const getHeatColor = (val: number, max: number) => {
    const ratio = val / max;
    if (ratio > 0.75) return 'bg-emerald-500';
    if (ratio > 0.5) return 'bg-emerald-400';
    if (ratio > 0.35) return 'bg-amber-400';
    if (ratio > 0.2) return 'bg-amber-300';
    return 'bg-red-300';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Feature Adoption Heatmap</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-500" />
            <span className="text-[10px] text-slate-400">Enabled</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-blue-500" />
            <span className="text-[10px] text-slate-400">WAU</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-violet-500" />
            <span className="text-[10px] text-slate-400">Adoption</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Feature</th>
              <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">Enabled</th>
              <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">WAU</th>
              <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">Trend</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Adoption</th>
            </tr>
          </thead>
          <tbody>
            {featureAdoption.map((f) => {
              const Icon = featureIcons[f.featureKey] || Activity;
              const trendIcon = f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→';
              const trendColor =
                f.trend === 'up' ? 'text-emerald-600' : f.trend === 'down' ? 'text-red-600' : 'text-slate-400';
              return (
                <tr key={f.featureKey} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{f.featureName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${getHeatColor(f.totalEnabled, maxEnabled)}`} />
                      <span className="text-xs font-semibold text-slate-700">{f.totalEnabled}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${getHeatColor(f.weeklyActiveUsers, maxWau)}`} />
                      <span className="text-xs font-semibold text-slate-700">{f.weeklyActiveUsers}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm font-semibold ${trendColor}`}>{trendIcon}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                          style={{ width: `${f.adoptionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-10 text-right">{f.adoptionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Top Active Companies ── */

function TopActiveCompanies() {
  const top = useMemo(() => {
    return [...companies]
      .filter((c) => c.status === 'active')
      .sort((a, b) => b.aiUsage - a.aiUsage)
      .slice(0, 5);
  }, []);

  const initialColors = [
    'from-violet-400 to-purple-400',
    'from-blue-400 to-cyan-400',
    'from-emerald-400 to-teal-400',
    'from-amber-400 to-orange-400',
    'from-rose-400 to-pink-400',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Top Active Companies</h3>
        <span className="text-[10px] text-slate-400">by AI Usage</span>
      </div>
      <div className="space-y-1 px-5 pb-5">
        {top.map((cust, i) => {
          const maxUsage = Math.max(...top.map((c) => c.aiUsage));
          const barWidth = (cust.aiUsage / maxUsage) * 100;
          return (
            <div key={cust.id} className="flex items-center gap-3 py-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                {i + 1}
              </span>
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${initialColors[i % initialColors.length]} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}
              >
                {cust.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-slate-800 truncate">{cust.name}</span>
                  <span className="text-xs font-semibold text-slate-600">{cust.aiUsage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── API Usage Stats ── */

function APIUsageStats() {
  const endpoints = [
    { name: 'AI Quote Generation', calls: 28450, pct: 32, color: 'bg-violet-500' },
    { name: 'Job Scheduling', calls: 18200, pct: 20, color: 'bg-blue-500' },
    { name: 'Invoice Processing', calls: 12400, pct: 14, color: 'bg-emerald-500' },
    { name: 'SMS Notifications', calls: 9800, pct: 11, color: 'bg-amber-500' },
    { name: 'Inventory Sync', calls: 7200, pct: 8, color: 'bg-red-500' },
    { name: 'Reports & Analytics', calls: 5200, pct: 6, color: 'bg-purple-500' },
    { name: 'Other', calls: 8250, pct: 9, color: 'bg-slate-400' },
  ];
  const totalCalls = endpoints.reduce((s, e) => s + e.calls, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">API Usage by Endpoint</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-3">
        {endpoints.map((ep) => (
          <div key={ep.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">{ep.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800">{ep.calls.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 w-8 text-right">{ep.pct}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${ep.color}`}
                style={{ width: `${ep.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Total API Calls (This Month)</span>
          <span className="font-bold text-slate-900">{totalCalls.toLocaleString()}</span>
        </div>
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
          <h1 className="text-2xl font-bold text-slate-900">Platform Usage</h1>
          <p className="text-sm text-slate-500 mt-1">
            {featureAdoption.length} features tracked · {featureAdoption.reduce((s, f) => s + f.weeklyActiveUsers, 0).toLocaleString()} weekly active users
          </p>
        </div>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Export</span>
        </button>
      </div>

      {/* Row 1 — KPI Cards */}
      <div className="mb-6">
        <UsageKPIs />
      </div>

      {/* Row 2 — DAU Chart + API Usage (60/40) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <DailyActiveUsersChart />
        </div>
        <div className="lg:col-span-2">
          <APIUsageStats />
        </div>
      </div>

      {/* Row 3 — Feature Adoption Heatmap + Top Companies (60/40) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <FeatureAdoptionHeatmap />
        </div>
        <div className="lg:col-span-2">
          <TopActiveCompanies />
        </div>
      </div>
    </div>
  );
}
