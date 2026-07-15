'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  DollarSign, Users, Zap, TrendingDown,
  ArrowUp, ArrowDown, ChevronDown, MoreHorizontal,
  Download, Clock, AlertTriangle, Building2,
  UserPlus, CreditCard, LogOut, Activity,
  MapPin, CheckCircle, XCircle,
  RotateCcw, Maximize2, RefreshCw, Search,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { downloadCSV } from '@/lib/csv-export';
import {
  platformKPIs, getPlatformSummary,
} from '@/lib/admin-data';

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */
const riskColors: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const engagementRiskColors: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const planColors: Record<string, string> = {
  solo: '#F59E0B',
  team: '#3B82F6',
  pro: '#10B981',
  business: '#8B5CF6',
  enterprise: '#EC4899',
};

const planLabels: Record<string, string> = {
  solo: 'Solo',
  team: 'Team',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};

const activityIconMap: Record<string, any> = {
  company_created: UserPlus,
  company_paused: LogOut,
  company_canceled: XCircle,
  subscription_changed: ArrowUp,
  payment_failed: AlertTriangle,
  payment_succeeded: CreditCard,
  trial_converted: CheckCircle,
  onboarding_complete: Activity,
};

const activityColorMap: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
};

/* ═══════════════════════════════════════════
   ROW 1 — KPI CARDS
   ═══════════════════════════════════════════ */
function KPICards({ kpis: kpiConfig }: { kpis?: { totalMRR: number; mrrGrowth: number; activePlumbers: number; plumberGrowth: number; activeTrials: number; trialConversionRate: number; churnRate: number; churnTrend: 'down' | 'up' } }) {
  const activeKPIs = kpiConfig || platformKPIs;
  const kpis = [
      {
        label: 'Monthly Recurring Revenue',
      value: `$${(activeKPIs.totalMRR / 1000).toFixed(1)}K`,
      change: `+${activeKPIs.mrrGrowth}%`,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Plumbers',
      value: activeKPIs.activePlumbers.toLocaleString(),
      change: `+${activeKPIs.plumberGrowth}%`,
      trend: 'up' as const,
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      label: 'Active Free Trials',
      value: String(activeKPIs.activeTrials),
      change: `${activeKPIs.trialConversionRate}% convert`,
      trend: 'up' as const,
      icon: Zap,
      color: 'bg-amber-500',
    },
    {
      label: 'Churn Rate',
      value: `${activeKPIs.churnRate}%`,
      change: activeKPIs.churnTrend === 'down' ? '-0.3%' : '+0.2%',
      trend: activeKPIs.churnTrend === 'down' ? ('down' as const) : ('up' as const),
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
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
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
                    : 'bg-emerald-50 text-emerald-600'
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

/* ═══════════════════════════════════════════
   ROW 2 — MRR GROWTH CHART (SVG)
   ═══════════════════════════════════════════ */
function MRRGrowthChart() {
  // Generate 12-month MRR data from platformKPIs, smoothed
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const base = platformKPIs.totalMRR * 0.8;
  const growthPerMonth = (platformKPIs.totalMRR - base) / 11;
  const prevBase = base * 0.85;

  const data = months.map((month, i) => ({
    month,
    value: Math.round(base + growthPerMonth * i),
    prevYear: Math.round(prevBase + growthPerMonth * i * 0.75),
  }));

  const maxVal = Math.max(...data.map(d => d.value), ...data.map(d => d.prevYear));
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
            <h3 className="text-base font-semibold text-slate-900">MRR Growth (12 Months)</h3>
            <span className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full ${+pctChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <ArrowUp className={`w-3 h-3 ${+pctChange < 0 ? 'rotate-180' : ''}`} /> {pctChange}%
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalThis.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-0.5">vs ${totalPrev.toLocaleString()} last year</p>
        </div>
        <button className="text-slate-600 hover:text-slate-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={prevPath} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d={areaPath} fill="url(#mrrGrad)" />
        <path d={thisPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {thisPoints.map((p, i) => (
          i % 2 === 0 && <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
        ))}
        {data.map((d, i) => (
          i % 2 === 0 && (
            <text key={i} x={thisPoints[i].x} y={height - 3} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="system-ui">
              {d.month}
            </text>
          )
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 rounded-full" /><span className="text-[10px] text-slate-600">This Year</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-400 rounded-full" style={{ borderTop: '2px dashed #94A3B8', height: 0 }} /><span className="text-[10px] text-slate-600">Last Year</span></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 2 — CUSTOMER FUNNEL
   ═══════════════════════════════════════════ */
function CustomerFunnel() {
  const summary = getPlatformSummary();
  const stages = [
    { name: 'Total Companies', count: summary.totalCompanies, pct: 100 },
    { name: 'Active Accounts', count: summary.activeCompanies, pct: Math.round((summary.activeCompanies / summary.totalCompanies) * 100) },
    { name: 'Healthy', count: summary.healthyCompanies, pct: Math.round((summary.healthyCompanies / summary.totalCompanies) * 100) },
    { name: 'Trialing', count: summary.totalTrials, pct: Math.round((summary.totalTrials / summary.totalCompanies) * 100) },
    { name: 'Paying Active', count: summary.activeCompanies - summary.totalTrials, pct: Math.round(((summary.activeCompanies - summary.totalTrials) / summary.totalCompanies) * 100) },
  ];
  const maxCount = stages[0].count;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Customer Funnel</h3>
        <button className="text-slate-600 hover:text-slate-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const widthPct = (stage.count / maxCount) * 70;
          return (
            <div key={stage.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full hover:bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500">{i + 1}</span>
                  <span className="text-sm text-slate-700">{stage.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-900">{stage.count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    background: i === 0
                      ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                      : i === stages.length - 1
                      ? 'linear-gradient(90deg, #10B981, #34D399)'
                      : 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                  }}
                />
                <span className="text-[10px] text-slate-600">{stage.pct}%</span>
              </div>
              {i < stages.length - 1 && (
                <div className="flex justify-center text-slate-700 mt-0.5">
                  <ChevronDown className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Active retention rate:</span>
          <span className="font-semibold text-emerald-600">{Math.round((summary.activeCompanies / summary.totalCompanies) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 3 — TRIAL PIPELINE TABLE
   ═══════════════════════════════════════════ */
function TrialPipelineTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Trial Pipeline</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📋</span>
          <p className="text-sm text-slate-500">No active trials. When plumbers sign up for free trials, they&apos;ll appear here.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 3 — AT-RISK CUSTOMERS
   ═══════════════════════════════════════════ */
function AtRiskCustomers() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">At-Risk Customers</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">⚠️</span>
          <p className="text-sm text-slate-500">No at-risk accounts.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 4 — TOP CUSTOMERS BY REVENUE
   ═══════════════════════════════════════════ */
function TopCustomersTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Top Customers by Revenue</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">🏆</span>
          <p className="text-sm text-slate-500">No top customers yet. Revenue data will appear once plumbers complete jobs.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 4 — ACTIVITY FEED
   ═══════════════════════════════════════════ */
function ActivityFeed() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Activity Feed</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📡</span>
          <p className="text-sm text-slate-500">No recent activity.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 5 — FEATURE USAGE HEATMAP
   ═══════════════════════════════════════════ */
function FeatureUsageHeatmap() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Feature Usage Heatmap</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📊</span>
          <p className="text-sm text-slate-500">Feature adoption data will appear once plumbers start using the platform.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 6 — REVENUE BY PLAN DONUT (SVG)
   ═══════════════════════════════════════════ */
function RevenueByPlanDonut() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">Revenue by Plan</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">💰</span>
        <p className="text-sm text-slate-500">Revenue breakdown will appear once subscriptions are active.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 6 — GEOGRAPHIC MAP (CSS/SVG)
   ═══════════════════════════════════════════ */
function GeographicMap() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">Geographic Distribution</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">🗺️</span>
        <p className="text-sm text-slate-500">Geographic data will appear as plumbers sign up across regions.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 3b — UNFULFILLED LEADS
   ═══════════════════════════════════════════ */
function UnfulfilledLeads() {
  const leads = [
    {
      id: 1,
      name: 'Oakwood Plumbing',
      contact: 'jason@oakwoodplumbing.com',
      location: 'Austin, TX',
      service: 'Emergency pipe burst repair',
      leadScore: 92,
      status: 'Contacted — no response',
      daysOpen: 5,
    },
    {
      id: 2,
      name: 'Blue Ridge Services',
      contact: 'dispatcher@blueridge.com',
      location: 'Denver, CO',
      service: 'Water heater installation',
      leadScore: 78,
      status: 'Quote sent — pending',
      daysOpen: 3,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-900">⚠️ Unfulfilled Leads — Action Required</h3>
          <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-amber-500 text-white text-[10px] font-bold px-1.5">
            {leads.length}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 pt-2">
        {leads.map((lead) => (
          <div key={lead.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{lead.name}</h4>
                <p className="text-[11px] text-slate-500">{lead.contact}</p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                Score {lead.leadScore}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-1">
              <MapPin className="w-3 h-3 inline mr-1" />
              {lead.location}
            </p>
            <p className="text-xs text-slate-600 mb-2">{lead.service}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                {lead.status}
              </span>
              <span className="text-[10px] text-slate-400">{lead.daysOpen}d open</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg">
                <RotateCcw className="w-3 h-3" /> Refund
              </button>
              <button className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-lg">
                <Maximize2 className="w-3 h-3" /> Expand
              </button>
              <button className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors px-3 py-1.5 rounded-lg">
                <RefreshCw className="w-3 h-3" /> Re-offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 4b — MARKETING & GROWTH
   ═══════════════════════════════════════════ */
function MarketingGrowth() {
  const leadSources = [
    { name: 'Google Ads', pct: 45, color: '#3b82f6', spent: '$2.1K', revenue: '$4.8K' },
    { name: 'Facebook', pct: 30, color: '#8b5cf6', spent: '$1.4K', revenue: '$3.2K' },
    { name: 'Organic/SEO', pct: 15, color: '#059669', spent: '$0', revenue: '$1.6K' },
    { name: 'Referrals', pct: 10, color: '#06b6d4', spent: '$0', revenue: '$1.1K' },
  ];

  const lowCoverageCities = [
    { city: 'San Diego, CA', leads: 12, plumbers: 1, urgent: false },
    { city: 'Calgary, AB', leads: 8, plumbers: 0, urgent: true },
    { city: 'Miami, FL', leads: 15, plumbers: 2, urgent: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">📈 Marketing & Growth</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 pt-2">
        {/* Lead Sources — left 2/3 */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Lead Sources</h4>
          <div className="space-y-3">
            {leadSources.map((source) => (
              <div key={source.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{source.name}</span>
                  <span className="text-xs text-slate-500">{source.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${source.pct}%`, backgroundColor: source.color }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{source.spent} spent → {source.revenue} deposit revenue</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cities with Low Coverage — right 1/3 */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Cities with Low Coverage</h4>
          <div className="space-y-3">
            {lowCoverageCities.map((city) => (
              <div key={city.city} className="border border-slate-100 rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{city.city}</p>
                    <p className="text-[11px] text-slate-500">{city.leads} leads · {city.plumbers} plumber{city.plumbers !== 1 ? 's' : ''}</p>
                  </div>
                  <span className={city.urgent ? 'text-red-500' : 'text-amber-500'}>
                    {city.urgent ? '🔴' : '⚠️'}
                  </span>
                </div>
                <button className="w-full text-xs font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 transition-colors px-3 py-1.5 rounded-lg">
                  <Search className="w-3 h-3 inline mr-1" />
                  {city.urgent ? 'Urgent: Recruit' : 'Recruit Plumbers'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 px-5 pb-5 pt-2 border-t border-slate-100">
        <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-xl">
          🎯 Launch Ad Campaign
        </button>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors px-4 py-2 rounded-xl">
          🎟️ Create Promo Code
        </button>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-xl">
          📧 Send Email Blast
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN ADMIN PAGE
   ═══════════════════════════════════════════ */
export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const summary = getPlatformSummary();
  const [realKPIs, setRealKPIs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real platform data from the API
  useEffect(() => {
    fetch('/api/admin/data?endpoint=summary')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setRealKPIs(data);
      })
      .catch(() => { /* fall back to mock */ })
      .finally(() => setLoading(false));
  }, []);

  const displayKPIs = realKPIs ? {
    ...platformKPIs,
    totalMRR: (realKPIs as any).mrr || 0,
    activePlumbers: (realKPIs as any).activePlumbers ?? 0,
    activeTrials: (realKPIs as any).freeTrials ?? 0,
    churnRate: parseFloat(String((realKPIs as any).churnRate || '0')),
    churnTrend: (parseFloat(String((realKPIs as any).churnRate || '0')) < 2.5 ? 'down' : 'up') as 'down' | 'up',
  } : {
    ...platformKPIs,
    totalMRR: 0,
    activePlumbers: 0,
    activeTrials: 0,
    churnRate: 0,
    mrrGrowth: 0,
    plumberGrowth: 0,
    trialConversionRate: 0,
    churnTrend: 'down' as const,
    leadsToday: 0,
    unfulfilledLeads: 0,
  };

  const handleExport = () => {
    const kpiData = [
      { Metric: 'Monthly Recurring Revenue', Value: `$${(displayKPIs.totalMRR / 1000).toFixed(1)}K`, Change: `+${displayKPIs.mrrGrowth}%` },
      { Metric: 'Active Plumbers', Value: String(displayKPIs.activePlumbers), Change: `+${displayKPIs.plumberGrowth}%` },
      { Metric: 'Active Free Trials', Value: String(displayKPIs.activeTrials), Change: `${displayKPIs.trialConversionRate}% convert` },
      { Metric: 'Churn Rate', Value: `${displayKPIs.churnRate}%`, Change: displayKPIs.churnTrend === 'down' ? '-0.3%' : '+0.2%' },
    ];

    downloadCSV(kpiData, 'platform_kpis');
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Super Admin — {displayKPIs.activePlumbers} plumbers · ${displayKPIs.totalMRR.toLocaleString()} MRR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            <span className="text-xs">📅</span>
            <span className="text-xs font-medium">This Month</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </div>

        </div>
      </div>

      {/* Row 1 — KPI Cards */}
      <div className="mb-6"><KPICards kpis={displayKPIs} /></div>

      {/* Row 2 — MRR Growth + Customer Funnel (60/40) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3"><MRRGrowthChart /></div>
        <div className="lg:col-span-2"><CustomerFunnel /></div>
      </div>

      {/* Row 3 — Trial Pipeline + At-Risk Customers (50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TrialPipelineTable />
        <AtRiskCustomers />
      </div>

      {/* Row 3b — Unfulfilled Leads */}
      <div className="mb-6"><UnfulfilledLeads /></div>

      {/* Row 4 — Top Customers + Activity Feed (50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TopCustomersTable />
        <ActivityFeed />
      </div>

      {/* Row 4b — Marketing & Growth */}
      <div className="mb-6"><MarketingGrowth /></div>

      {/* Row 5 — Feature Usage Heatmap */}
      <div className="mb-6"><FeatureUsageHeatmap /></div>

      {/* Row 6 — Revenue by Plan Donut + Geographic Map (50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RevenueByPlanDonut />
        <GeographicMap />
      </div>
    </div>
  );
}
