'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Building2,
  Download,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { platformKPIs, revenueBreakdown } from '@/lib/admin-data';
import { downloadCSV } from '@/lib/csv-export';
import { Skeleton } from '@/components/ui/skeleton';



/* ── Constants ── */

const planColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
const planLabels: Record<string, string> = {
  solo: 'Solo',
  team: 'Team',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};

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
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5">
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5">
          <Skeleton className="h-5 w-44 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
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
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Failed to load revenue data</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/* ── KPI Cards ── */

function RevenueKPIs() {
  const annualMrr = platformKPIs.totalMRR * 12;
  const avgRevPerCustomer = Math.round(platformKPIs.totalMRR / platformKPIs.activePlumbers);

  const kpis = [
    {
      label: 'Monthly Recurring Revenue',
      value: `$${(platformKPIs.totalMRR / 1000).toFixed(1)}K`,
      change: `+${platformKPIs.mrrGrowth}%`,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      label: 'Annual Run Rate (ARR)',
      value: `$${(annualMrr / 1000).toFixed(0)}K`,
      change: `+${(platformKPIs.mrrGrowth * 1.1).toFixed(1)}%`,
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'bg-violet-500',
    },
    {
      label: 'Avg Rev / Customer',
      value: `$${avgRevPerCustomer.toLocaleString()}`,
      change: `$${Math.round(avgRevPerCustomer * 0.08)} vs last month`,
      trend: 'up' as const,
      icon: Building2,
      color: 'bg-emerald-500',
    },
    {
      label: 'Churn Rate',
      value: `${platformKPIs.churnRate}%`,
      change: platformKPIs.churnTrend === 'down' ? '-0.3%' : '+0.2%',
      trend: platformKPIs.churnTrend === 'down' ? ('down' as const) : ('up' as const),
      icon: TrendingDown,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isGoodDown = kpi.label === 'Churn Rate' && kpi.trend === 'down';
        const isPositive = kpi.trend === 'up';
        return (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1.5">{kpi.value}</p>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  isGoodDown || (!isPositive && kpi.label !== 'Churn Rate')
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-emerald-600'
                }`}
              >
                {isPositive || isGoodDown ? (
                  <ArrowUp className={`w-3 h-3 ${isGoodDown ? 'rotate-180' : ''}`} />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {kpi.change}
              </span>
              <span className="text-xs text-slate-600">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── MRR Growth Chart (SVG) ── */

function MRRChart() {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const base = platformKPIs.totalMRR * 0.8;
  const growthPerMonth = (platformKPIs.totalMRR - base) / 11;
  const prevBase = base * 0.85;

  const data = months.map((month, i) => ({
    month,
    value: Math.round(base + growthPerMonth * i),
    prevYear: Math.round(prevBase + growthPerMonth * i * 0.75),
  }));

  const maxVal = Math.max(...data.map((d) => d.value), ...data.map((d) => d.prevYear));
  const width = 700;
  const height = 220;
  const padTop = 10;
  const padBottom = 20;
  const chartH = height - padTop - padBottom;

  const toPoint = (v: number, i: number) => {
    const x = (i / (data.length - 1)) * width;
    const y = padTop + chartH - (v / maxVal) * chartH * 0.85;
    return { x, y };
  };

  const thisPoints = data.map((d, i) => toPoint(d.value, i));
  const prevPoints = data.map((d, i) => toPoint(d.prevYear, i));
  const thisPath = thisPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const prevPath = prevPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `M${thisPoints[0].x},${height} ${thisPath} L${thisPoints[thisPoints.length - 1].x},${height} Z`;

  const totalThis = data.reduce((s, d) => s + d.value, 0);
  const totalPrev = data.reduce((s, d) => s + d.prevYear, 0);
  const pctChange = ((totalThis - totalPrev) / totalPrev * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-900">MRR Trend (12 Months)</h3>
            <span
              className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                +pctChange >= 0 ? 'bg-green-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}
            >
              <ArrowUp className={`w-3 h-3 ${+pctChange < 0 ? 'rotate-180' : ''}`} /> {pctChange}%
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalThis.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-0.5">vs ${totalPrev.toLocaleString()} last year</p>
        </div>
        <button className="text-slate-600 hover:text-slate-400 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revMrrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={prevPath} fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d={areaPath} fill="url(#revMrrGrad)" />
        <path d={thisPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {thisPoints.map(
          (p, i) => i % 2 === 0 && <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
        )}
        {data.map(
          (d, i) =>
            i % 2 === 0 && (
              <text key={i} x={thisPoints[i].x} y={height - 3} textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="system-ui">
                {d.month}
              </text>
            )
        )}
      </svg>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-500 rounded-full" />
          <span className="text-[10px] text-slate-600">This Year</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-400 rounded-full" style={{ borderTop: '2px dashed #64748B', height: 0 }} />
          <span className="text-[10px] text-slate-600">Last Year</span>
        </div>
      </div>
    </div>
  );
}

/* ── Monthly Comparison Table ── */

function MonthlyComparison() {
  const months = [
    { month: 'Feb', value: 245000, prev: 219000 },
    { month: 'Mar', value: 252000, prev: 224000 },
    { month: 'Apr', value: 258000, prev: 231000 },
    { month: 'May', value: 262000, prev: 238000 },
    { month: 'Jun', value: 271000, prev: 242000 },
    { month: 'Jul', value: 284500, prev: 249000 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Monthly Comparison</h3>
        <button className="text-slate-600 hover:text-slate-400 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-5 py-3">Month</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">Current</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Previous</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Change</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m, i) => {
              const diff = m.value - m.prev;
              const pct = ((diff / m.prev) * 100).toFixed(1);
              const isPositive = diff >= 0;
              return (
                <tr key={m.month} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-slate-900">{m.month}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-semibold text-slate-900">${(m.value / 1000).toFixed(0)}K</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <span className="text-sm text-slate-500">${(m.prev / 1000).toFixed(0)}K</span>
                  </td>
                  <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                        isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {pct}%
                    </span>
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

/* ── Revenue by Plan Donut (SVG) ── */

function RevenueByPlanDonut() {
  const plans = revenueBreakdown;
  const total = plans.reduce((s, p) => s + p.totalMrr, 0);
  const cx = 100;
  const cy = 100;
  const r = 72;
  const sw = 28;

  let cumulative = 0;
  const slices = plans.map((seg, idx) => {
    const startAngle = (cumulative / total) * 360 - 90;
    cumulative += seg.totalMrr;
    const endAngle = (cumulative / total) * 360 - 90;
    const large = endAngle - startAngle > 180 ? 1 : 0;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    return {
      label: planLabels[seg.planTier] || seg.planTier,
      value: seg.totalMrr,
      pct: seg.percentageOfTotal,
      count: seg.companyCount,
      color: planColors[idx % planColors.length],
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">Revenue by Plan</h3>
        <button className="text-slate-600 hover:text-slate-400 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 200 200">
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill="none" stroke={s.color} strokeWidth={sw} strokeLinecap="round" />
            ))}
            <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central" fill="#FFFFFF" fontFamily="system-ui" fontSize="24" fontWeight="700">
              ${(total / 1000).toFixed(0)}K
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central" fill="#94A3B8" fontFamily="system-ui" fontSize="11">
              MRR
            </text>
          </svg>
        </div>
        <div className="flex-1 space-y-2 pt-2">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600">{s.count} accts</span>
                <span className="text-xs font-semibold text-slate-900">{s.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Revenue Table ── */

function RevenueBreakdownTable() {
  const total = revenueBreakdown.reduce((s, p) => s + p.totalMrr, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Plan Breakdown</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-600">View All →</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-5 py-3">Plan</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">MRR</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">% of Total</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Companies</th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Avg MRR</th>
            </tr>
          </thead>
          <tbody>
            {revenueBreakdown.map((plan, i) => {
              const color = planColors[i % planColors.length];
              const avgMrr = Math.round(plan.totalMrr / plan.companyCount);
              const barWidth = (plan.totalMrr / total) * 100;
              return (
                <tr key={plan.planTier} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium text-slate-900">{planLabels[plan.planTier] || plan.planTier}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-semibold text-slate-900">${plan.totalMrr.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${barWidth}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-400 w-8 text-right">{plan.percentageOfTotal.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right hidden md:table-cell">
                    <span className="text-sm text-slate-400">{plan.companyCount}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-slate-500">${avgMrr.toLocaleString()}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-5 py-3.5">
                <span className="text-sm font-semibold text-slate-900">Total</span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <span className="text-sm font-bold text-slate-900">${total.toLocaleString()}</span>
              </td>
              <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                <span className="text-xs font-semibold text-slate-500">100%</span>
              </td>
              <td className="px-5 py-3.5 text-right hidden md:table-cell">
                <span className="text-sm font-semibold text-slate-900">{revenueBreakdown.reduce((s, p) => s + p.companyCount, 0)}</span>
              </td>
              <td className="px-4 py-3.5 hidden lg:table-cell" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ── Lead Revenue Breakdown ── */

const DEPOSIT_TIERS_DISPLAY = [
  { label: 'Under $1,000', min: 0, max: 1000, deposit: 49 },
  { label: '$1,000 – $1,499', min: 1000, max: 1500, deposit: 99 },
  { label: '$1,500 – $1,999', min: 1500, max: 2000, deposit: 149 },
  { label: '$2,000+', min: 2000, max: Infinity, deposit: 199 },
];

function LeadRevenueBreakdown() {
  // Demo data — replace with real Supabase query later
  const totalLeads = 428;
  const demoDistribution = [
    { tier: 0, count: 180, label: 'Under $1,000', deposit: 49 },
    { tier: 1, count: 120, label: '$1,000 – $1,499', deposit: 99 },
    { tier: 2, count: 78, label: '$1,500 – $1,999', deposit: 149 },
    { tier: 3, count: 50, label: '$2,000+', deposit: 199 },
  ];

  const totalLeadRevenue = demoDistribution.reduce((s, t) => s + t.count * t.deposit, 0);
  const maxCount = Math.max(...demoDistribution.map(t => t.count));
  const depositColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Lead Revenue Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">{totalLeads} total leads · ${totalLeadRevenue.toLocaleString()} total deposit revenue</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <ArrowUp className="w-3 h-3" /> +{(totalLeadRevenue / 284500 * 100).toFixed(1)}% of total rev
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="flex items-end gap-1 h-28 mb-4">
        {demoDistribution.map((tier, i) => {
          const h = maxCount > 0 ? (tier.count / maxCount) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400">{tier.count}</span>
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-md transition-all hover:opacity-80"
                  style={{
                    height: `${Math.max(h, 4)}%`,
                    backgroundColor: depositColors[i % depositColors.length],
                    minHeight: '8px',
                  }}
                />
              </div>
              <span className="text-[9px] text-slate-600 text-center leading-tight">{tier.label}</span>
            </div>
          );
        })}
      </div>

      {/* Tier table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2.5">Tier</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2.5">Deposit</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2.5">Leads</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2.5">Revenue</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2.5 hidden sm:table-cell">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {demoDistribution.map((tier, i) => {
              const pct = ((tier.count * tier.deposit) / totalLeadRevenue * 100);
              return (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: depositColors[i % depositColors.length] }} />
                      <span className="text-xs font-medium text-slate-900">{tier.label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs font-semibold text-slate-900">${tier.deposit}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-slate-400">{tier.count}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs font-semibold text-emerald-600">${(tier.count * tier.deposit).toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: depositColors[i % depositColors.length] }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 w-8 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-2.5">
                <span className="text-xs font-semibold text-slate-900">Total</span>
              </td>
              <td className="px-3 py-2.5 text-right" />
              <td className="px-3 py-2.5 text-right">
                <span className="text-xs font-bold text-slate-900">{totalLeads}</span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <span className="text-xs font-bold text-slate-900">${totalLeadRevenue.toLocaleString()}</span>
              </td>
              <td className="px-3 py-2.5 text-right hidden sm:table-cell">
                <span className="text-xs font-semibold text-slate-500">100%</span>
              </td>
            </tr>
          </tfoot>
        </table>
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
          <h1 className="text-2xl font-bold text-slate-900">Revenue Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            ${(platformKPIs.totalMRR / 1000).toFixed(1)}K MRR · ${((platformKPIs.totalMRR * 12) / 1000).toFixed(0)}K ARR · {platformKPIs.activePlumbers} active accounts
          </p>
        </div>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm ring-1 ring-black/5">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Export</span>
        </button>
      </div>

      {/* Row 1 — KPI Cards */}
      <div className="mb-6">
        <RevenueKPIs />
      </div>

      {/* Row 2 — MRR Chart + Donut (60/40) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <MRRChart />
        </div>
        <div className="lg:col-span-2">
          <RevenueByPlanDonut />
        </div>
      </div>

      {/* Row 3 — Monthly Comparison + Plan Breakdown (50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <MonthlyComparison />
        <RevenueBreakdownTable />
      </div>

      {/* Row 4 — Lead Revenue Breakdown */}
      <div className="mb-6">
        <LeadRevenueBreakdown />
      </div>
    </div>
  );
}
