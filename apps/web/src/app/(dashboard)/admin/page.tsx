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
  info: 'bg-blue-50 text-primary',
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
            className="bg-white rounded-2xl border border-border/50 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/5 transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
            </div>
            <p className="text-3xl font-semibold tracking-tight text-foreground mb-1.5">{kpi.value}</p>
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
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 2 — MRR GROWTH CHART (EMPTY STATE)
   ═══════════════════════════════════════════ */
function MRRGrowthChart() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm ring-1 ring-black/5 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">MRR Growth (12 Months)</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">📈</span>
        <p className="text-sm text-muted-foreground">MRR growth data will appear once subscription payments start processing.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 2 — CUSTOMER FUNNEL (EMPTY STATE)
   ═══════════════════════════════════════════ */
function CustomerFunnel() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm ring-1 ring-black/5 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">Customer Funnel</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">🥧</span>
        <p className="text-sm text-muted-foreground">Customer funnel data will appear once plumbers sign up.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 3 — TRIAL PIPELINE TABLE
   ═══════════════════════════════════════════ */
function TrialPipelineTable() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">Trial Pipeline</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📋</span>
          <p className="text-sm text-muted-foreground">No active trials. When plumbers sign up for free trials, they&apos;ll appear here.</p>
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
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">At-Risk Customers</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">⚠️</span>
          <p className="text-sm text-muted-foreground">No at-risk accounts.</p>
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
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">Top Customers by Revenue</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">🏆</span>
          <p className="text-sm text-muted-foreground">No top customers yet. Revenue data will appear once plumbers complete jobs.</p>
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
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">Activity Feed</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📡</span>
          <p className="text-sm text-muted-foreground">No recent activity.</p>
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
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">Feature Usage Heatmap</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📊</span>
          <p className="text-sm text-muted-foreground">Feature adoption data will appear once plumbers start using the platform.</p>
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
    <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm ring-1 ring-black/5 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">Revenue by Plan</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">💰</span>
        <p className="text-sm text-muted-foreground">Revenue breakdown will appear once subscriptions are active.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 6 — GEOGRAPHIC MAP (CSS/SVG)
   ═══════════════════════════════════════════ */
function GeographicMap() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">Geographic Distribution</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">🗺️</span>
        <p className="text-sm text-muted-foreground">Geographic data will appear as plumbers sign up across regions.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 3b — UNFULFILLED LEADS
   ═══════════════════════════════════════════ */
function UnfulfilledLeads() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">⚠️ Unfulfilled Leads</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📥</span>
          <p className="text-sm text-muted-foreground">No unfulfilled leads. All matched leads should appear here if they need attention.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROW 4b — MARKETING & GROWTH
   ═══════════════════════════════════════════ */
function MarketingGrowth() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">📈 Marketing & Growth</h3>
      </div>
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📊</span>
          <p className="text-sm text-muted-foreground">Marketing data will appear once lead generation and ad campaigns are active.</p>
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
          <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Super Admin — {displayKPIs.activePlumbers} plumbers · ${displayKPIs.totalMRR.toLocaleString()} MRR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
            <span className="text-xs">📅</span>
            <span className="text-xs font-medium">This Month</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
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
