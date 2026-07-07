'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign, Users, Zap, TrendingDown,
  ArrowUp, ArrowDown, ChevronDown, MoreHorizontal,
  Download, Clock, AlertTriangle, Building2,
  UserPlus, CreditCard, LogOut, Activity,
  MapPin, CheckCircle, XCircle,
} from 'lucide-react';
import {
  platformKPIs, trialPipeline, atRiskAccounts,
  featureAdoption, revenueBreakdown, recentActivity,
  companies, getPlatformSummary,
} from '@/lib/admin-data';
import type { TrialPipelineEntry, ActivityFeedItem, Company } from '@/lib/admin-data';
import { useAuthStore } from '@/lib/store';

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */
const riskColors: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const engagementRiskColors: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
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
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  error: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
};

/* ═══════════════════════════════════════════
   ROW 1 — KPI CARDS
   ═══════════════════════════════════════════ */
function KPICards() {
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
      label: 'Active Plumbers',
      value: platformKPIs.activePlumbers.toLocaleString(),
      change: `+${platformKPIs.plumberGrowth}%`,
      trend: 'up' as const,
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      label: 'Active Free Trials',
      value: String(platformKPIs.activeTrials),
      change: `${platformKPIs.trialConversionRate}% convert`,
      trend: 'up' as const,
      icon: Zap,
      color: 'bg-amber-500',
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
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
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
              <span className="text-xs text-slate-400">vs last month</span>
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
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-900">MRR Growth (12 Months)</h3>
            <span className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full ${+pctChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <ArrowUp className={`w-3 h-3 ${+pctChange < 0 ? 'rotate-180' : ''}`} /> {pctChange}%
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalThis.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-0.5">vs ${totalPrev.toLocaleString()} last year</p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
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
        <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 rounded-full" /><span className="text-[10px] text-slate-400">This Year</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-400 rounded-full" style={{ borderTop: '2px dashed #94A3B8', height: 0 }} /><span className="text-[10px] text-slate-400">Last Year</span></div>
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
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Customer Funnel</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
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
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{i + 1}</span>
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
                <span className="text-[10px] text-slate-400">{stage.pct}%</span>
              </div>
              {i < stages.length - 1 && (
                <div className="flex justify-center text-slate-300 mt-0.5">
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
  const [sortAsc, setSortAsc] = useState(false);
  const sorted = useMemo(() => {
    return [...trialPipeline].sort((a, b) =>
      sortAsc ? a.daysRemaining - b.daysRemaining : b.daysRemaining - a.daysRemaining
    );
  }, [sortAsc]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Trial Pipeline</h3>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Sort by days {sortAsc ? '↑' : '↓'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Company</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Plan</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Days Left</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Score</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((trial: TrialPipelineEntry) => {
              const riskCfg = engagementRiskColors[trial.riskLevel];
              const isUrgent = trial.daysRemaining <= 5 && trial.daysRemaining >= 0;
              const isOverdue = trial.daysRemaining < 0;
              return (
                <tr key={trial.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        {trial.companyName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{trial.companyName}</p>
                        <p className="text-[11px] text-slate-400">{trial.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">{planLabels[trial.planTier] || trial.planTier}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`text-sm font-semibold ${
                        isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {isOverdue ? `${Math.abs(trial.daysRemaining)}d overdue` : `${trial.daysRemaining}d`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${trial.engagementScore >= 70 ? 'bg-emerald-500' : trial.engagementScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${trial.engagementScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{trial.engagementScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${riskCfg.bg} ${riskCfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${riskCfg.dot}`} />
                      {trial.riskLevel}
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

/* ═══════════════════════════════════════════
   ROW 3 — AT-RISK CUSTOMERS
   ═══════════════════════════════════════════ */
function AtRiskCustomers() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">At-Risk Customers</h3>
        <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
          {atRiskAccounts.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Company</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">MRR</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Churn Prob.</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Rep</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Reason</th>
            </tr>
          </thead>
          <tbody>
            {atRiskAccounts.map((acct) => {
              const probPct = Math.round(acct.churnProbability * 100);
              const probColor = probPct >= 70 ? 'text-red-600' : probPct >= 40 ? 'text-amber-600' : 'text-emerald-600';
              const probBg = probPct >= 70 ? 'bg-red-50' : probPct >= 40 ? 'bg-amber-50' : 'bg-emerald-50';
              return (
                <tr key={acct.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{acct.companyName}</p>
                      <p className="text-[11px] text-slate-400">{acct.techCount} techs</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-sm font-semibold text-slate-800">${acct.mrr.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${probBg} ${probColor}`}>
                      {probPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-slate-500">{acct.assignedRep}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-slate-500 truncate max-w-[180px] block">{acct.reason}</span>
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

/* ═══════════════════════════════════════════
   ROW 4 — TOP CUSTOMERS BY REVENUE
   ═══════════════════════════════════════════ */
function TopCustomersTable() {
  const top = useMemo(() => {
    return [...companies]
      .filter(c => c.status === 'active')
      .sort((a, b) => b.mrr - a.mrr)
      .slice(0, 6);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Top Customers by Revenue</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700">View All →</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">#</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Company</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Techs</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">MRR</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Plan</th>
            </tr>
          </thead>
          <tbody>
            {top.map((cust: Company, i: number) => {
              const initialColor = ['from-violet-400 to-purple-400', 'from-blue-400 to-cyan-400', 'from-emerald-400 to-teal-400', 'from-amber-400 to-orange-400', 'from-rose-400 to-pink-400', 'from-indigo-400 to-blue-400'];
              return (
                <tr key={cust.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500">{i + 1}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${initialColor[i % initialColor.length]} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                        {cust.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">{cust.name}</p>
                        <p className="text-[11px] text-slate-400">{cust.city}, {cust.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">{cust.techCount}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-slate-800">${cust.mrr.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: `${planColors[cust.planTier]}15`,
                        color: planColors[cust.planTier],
                      }}
                    >
                      {planLabels[cust.planTier] || cust.planTier}
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

/* ═══════════════════════════════════════════
   ROW 4 — ACTIVITY FEED
   ═══════════════════════════════════════════ */
function ActivityFeed() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Activity Feed</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700">View All →</button>
      </div>
      <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
        {recentActivity.map((item: ActivityFeedItem) => {
          const Icon = activityIconMap[item.type] || Activity;
          const colorClass = activityColorMap[item.severity] || 'bg-slate-100 text-slate-600';
          const time = new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
          return (
            <div key={item.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${colorClass.split(' ')[0]} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">
                    <span className="font-medium text-slate-900">{item.companyName}</span>
                    {' '}{item.description}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{time}</span>
                </div>
                <button className="text-slate-300 hover:text-slate-500 transition-colors shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 5 — FEATURE USAGE HEATMAP
   ═══════════════════════════════════════════ */
function FeatureUsageHeatmap() {
  const maxWau = Math.max(...featureAdoption.map(f => f.weeklyActiveUsers));
  const maxEnabled = Math.max(...featureAdoption.map(f => f.totalEnabled));

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
        <h3 className="text-base font-semibold text-slate-900">Feature Usage Heatmap</h3>
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
              const adoptionRate = f.adoptionRate;
              const trendIcon = f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→';
              const trendColor = f.trend === 'up' ? 'text-emerald-600' : f.trend === 'down' ? 'text-red-600' : 'text-slate-400';
              return (
                <tr key={f.featureKey} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-slate-800">{f.featureName}</span>
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
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                          style={{ width: `${adoptionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-10 text-right">{adoptionRate.toFixed(1)}%</span>
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

/* ═══════════════════════════════════════════
   ROW 6 — REVENUE BY PLAN DONUT (SVG)
   ═══════════════════════════════════════════ */
function RevenueByPlanDonut() {
  const plans = revenueBreakdown;
  const total = plans.reduce((s, p) => s + p.totalMrr, 0);
  const cx = 100, cy = 100, r = 72, sw = 28;

  const segmentColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

  let cumulative = 0;
  const slices = plans.map((seg, idx) => {
    const startAngle = (cumulative / total) * 360 - 90;
    cumulative += seg.totalMrr;
    const endAngle = (cumulative / total) * 360 - 90;
    const large = (endAngle - startAngle) > 180 ? 1 : 0;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    return {
      label: seg.planTier,
      value: seg.totalMrr,
      pct: seg.percentageOfTotal,
      count: seg.companyCount,
      color: segmentColors[idx % segmentColors.length],
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">Revenue by Plan</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 200 200">
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill="none" stroke={s.color} strokeWidth={sw} strokeLinecap="round" />
            ))}
            <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central" fill="#0F172A" fontFamily="system-ui" fontSize="24" fontWeight="700">
              ${(total / 1000).toFixed(0)}K
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central" fill="#64748B" fontFamily="system-ui" fontSize="11">MRR</text>
          </svg>
        </div>
        <div className="flex-1 space-y-2 pt-2">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-600">{s.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{s.count} accts</span>
                <span className="text-xs font-semibold text-slate-900">{s.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 6 — GEOGRAPHIC MAP (CSS/SVG)
   ═══════════════════════════════════════════ */
function GeographicMap() {
  // Compute regional distribution from actual company data
  const regionMap = useMemo(() => {
    const regions: Record<string, { name: string; cx: number; cy: number; companies: Company[] }> = {
      northeast: { name: 'Northeast', cx: 220, cy: 120, companies: [] },
      southeast: { name: 'Southeast', cx: 230, cy: 230, companies: [] },
      midwest: { name: 'Midwest', cx: 160, cy: 170, companies: [] },
      southwest: { name: 'Southwest', cx: 120, cy: 240, companies: [] },
      west: { name: 'West Coast', cx: 70, cy: 160, companies: [] },
    };

    const stateToRegion: Record<string, string> = {
      NY: 'northeast', MA: 'northeast', PA: 'northeast', NJ: 'northeast', CT: 'northeast',
      FL: 'southeast', GA: 'southeast', NC: 'southeast', TN: 'southeast', SC: 'southeast',
      IL: 'midwest', MI: 'midwest', OH: 'midwest', MN: 'midwest', MO: 'midwest',
      TX: 'southwest', AZ: 'southwest', CO: 'southwest', UT: 'southwest', MT: 'southwest',
      CA: 'west', WA: 'west', OR: 'west',
    };

    companies.forEach(c => {
      const region = stateToRegion[c.state] || 'midwest';
      if (regions[region]) regions[region].companies.push(c);
    });

    return Object.values(regions).map(r => ({
      ...r,
      count: r.companies.length,
      mrr: r.companies.reduce((s, c) => s + c.mrr, 0),
    }));
  }, []);

  const maxCount = Math.max(...regionMap.map(r => r.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">Geographic Distribution</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Details →</button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="280" height="280" viewBox="0 0 320 320" className="w-full max-w-[280px]">
            {/* Simplified USA outline */}
            <path
              d="M50,100 Q70,80 100,75 Q130,70 160,72 Q190,74 210,80 Q230,86 240,95
                 Q250,104 255,115 Q260,126 255,140 Q250,154 240,165 Q230,176 220,185
                 Q210,194 200,205 Q190,216 180,230 Q170,244 160,250 Q150,256 140,255
                 Q130,254 120,248 Q110,242 100,235 Q90,228 80,215 Q70,202 62,188
                 Q54,174 50,160 Q46,146 48,130 Q50,114 50,100 Z"
              fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5"
            />
            {regionMap.map((r, i) => {
              const radius = 8 + (r.count / maxCount) * 14;
              const color = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i];
              return (
                <g key={i}>
                  <circle cx={r.cx} cy={r.cy} r={radius + 6} fill={color} opacity={0.08} />
                  <circle cx={r.cx} cy={r.cy} r={radius} fill={color} opacity={0.7} />
                  <circle cx={r.cx} cy={r.cy} r={radius * 0.5} fill={color} opacity={0.9} />
                  <text x={r.cx} y={r.cy + 0.5} textAnchor="middle" dominantBaseline="central" fill="white" fontFamily="system-ui" fontSize="10" fontWeight="700">
                    {r.count}
                  </text>
                  <text x={r.cx} y={r.cy - radius - 12} textAnchor="middle" dominantBaseline="central" fill="#64748B" fontFamily="system-ui" fontSize="9">
                    {r.name}
                  </text>
                </g>
              );
            })}
            <text x="160" y="300" textAnchor="middle" fill="#94A3B8" fontFamily="system-ui" fontSize="9">
              {regionMap.reduce((s, r) => s + r.count, 0)} active accounts
            </text>
          </svg>
        </div>
        <div className="flex-1 space-y-2.5">
          {regionMap.map((r, i) => {
            const color = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i];
            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-600">{r.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{r.count} accts</span>
                  <span className="text-xs font-semibold text-slate-900">${(r.mrr / 1000).toFixed(0)}K</span>
                </div>
              </div>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Total</span>
              <span className="text-sm font-bold text-slate-900">
                {regionMap.reduce((s, r) => s + r.count, 0)} accts · ${(regionMap.reduce((s, r) => s + r.mrr, 0) / 1000).toFixed(0)}K MRR
              </span>
            </div>
          </div>
        </div>
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

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Super Admin — {summary.totalCompanies} companies · {summary.totalTechs} plumbers · ${summary.totalMrr.toLocaleString()} MRR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            <span className="text-xs">📅</span>
            <span className="text-xs font-medium">This Month</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Export</span>
          </button>
        </div>
      </div>

      {/* Row 1 — KPI Cards */}
      <div className="mb-6"><KPICards /></div>

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

      {/* Row 4 — Top Customers + Activity Feed (50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TopCustomersTable />
        <ActivityFeed />
      </div>

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
