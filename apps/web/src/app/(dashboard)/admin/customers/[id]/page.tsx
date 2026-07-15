'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Edit,
  Ban,
  CreditCard,
  User,
  Users,
  Briefcase,
  BrainCircuit,
  DollarSign,
  Clock,
  Activity,
  ChevronRight,
  Home,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ── Helpers ── */

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTimeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

const healthConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
  green: { label: 'Good', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  yellow: { label: 'Warning', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  red: { label: 'Critical', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

/* ── Skeleton ── */

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm">
            <Skeleton className="h-5 w-28 mb-3" />
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>

      {/* Activity */}
      <div className="rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm">
        <Skeleton className="h-5 w-32 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── HealthBadge ── */

function HealthBadge({ health }: { health: string }) {
  const cfg = healthConfig[health] ?? healthConfig.yellow;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.color)}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

/* ── ActivityIcon ── */

function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<string, { icon: typeof Activity; color: string; bg: string }> = {
    estimate_accepted: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    job_completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    invoice_paid: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ai_estimate: { icon: BrainCircuit, color: 'text-blue-600', bg: 'bg-blue-50' },
    tech_assigned: { icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
    payment_failed: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    scheduled: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    estimate_sent: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    ai_alert: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    support_ticket: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    job_urgent: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    invoice_overdue: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  };
  const cfg = iconMap[type] ?? { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-800' };
  const Icon = cfg.icon;
  return (
    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', cfg.bg)}>
      <Icon className={cn('h-4 w-4', cfg.color)} />
    </div>
  );
}

/* ── StatCard ── */

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:ring-slate-300">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <div className={cn('rounded-lg p-2', color)}>
          <Icon className="h-4 w-4 text-slate-900" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

/* ── Main Page ── */

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId = params.id;

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Will fetch from real API when available
        setNotFound(true);
      } catch {
        setError('Failed to load company details');
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [companyId]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      // Will fetch from real API when available
      setNotFound(true);
      setLoading(false);
    }, 300);
  };

  const company = useMemo(() => null as any, [companyId]);

  const acceptedPercent = 0;

  /* ── Error State ── */
  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-8 shadow-sm text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Failed to load company</h2>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <DetailSkeleton />
      </div>
    );
  }

  /* ── Not Found State ── */
  if (notFound || !company) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-8 shadow-sm text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Company not found</h2>
          <p className="mt-1 text-sm text-slate-500">
            No customer exists with ID &quot;{companyId}&quot;. It may have been removed or the link is incorrect.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/admin')}>
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  const healthCfg = healthConfig[company.health] ?? healthConfig.yellow;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-600">
        <Home className="h-3.5 w-3.5" />
        <span>Admin</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <button
          onClick={() => router.push('/admin/customers')}
          className="text-slate-500 hover:text-slate-900 transition-colors"
        >
          Customers
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 font-medium truncate max-w-[200px]">{company.name}</span>
      </nav>

      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{company.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('inline-flex h-2.5 w-2.5 rounded-full', {
                'bg-emerald-500': company.health === 'green',
                'bg-amber-500': company.health === 'yellow',
                'bg-red-500': company.health === 'red',
              })} />
              <p className="text-sm text-slate-500">Customer since {formatDate(company.sinceDate)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
            <Ban className="h-3.5 w-3.5" />
            Suspend
          </Button>
        </div>
      </div>

      {/* ── Info Cards Row (3 columns on desktop, stacked on mobile) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Plan & Health */}
        <div className="rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-500" />
            Plan &amp; Health
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Plan</span>
              <span className="text-sm font-medium text-slate-900">{company.plan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Monthly</span>
              <span className="text-sm font-medium text-slate-900">{formatCurrency(company.mrr)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Since</span>
              <span className="text-sm text-slate-900">{formatDate(company.sinceDate)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-sm text-slate-500">Health</span>
              <HealthBadge health={company.health} />
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            Owner Info
          </h3>
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-slate-900">{company.ownerName}</p>
            <a
              href={`mailto:${company.ownerEmail}`}
              className="block text-sm text-blue-600 hover:text-blue-600 transition-colors"
            >
              {company.ownerEmail}
            </a>
            <a
              href={`tel:${company.ownerPhone}`}
              className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              {company.ownerPhone}
            </a>
          </div>
        </div>

        {/* Billing */}
        <div className="rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            Billing
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Price/Month</span>
              <span className="text-sm font-medium text-slate-900">{formatCurrency(company.mrr)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Paid</span>
              <span className="text-sm font-medium text-slate-900">{formatCurrency(company.totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Next Payment</span>
              <span className="text-sm text-slate-900">{formatDate(company.nextBillingDate)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-sm text-slate-500">Payment Method</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900">
                <CreditCard className="h-3.5 w-3.5 text-slate-600" />
                {company.billingInfo}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Stats Grid (4 columns on desktop, 2 on mobile) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Team Size"
          value={String(company.techs)}
          sub="Licensed technicians"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          label="Jobs This Month"
          value={String(company.jobsPerMonth)}
          sub={`${company.aiUsage}% AI-assisted`}
          icon={Briefcase}
          color="bg-emerald-500"
        />
        <StatCard
          label="AI Estimates"
          value={String(company.aiEstimatesCount)}
          sub={`${company.acceptedCount} accepted · ${acceptedPercent}%`}
          icon={BrainCircuit}
          color="bg-violet-500"
        />
        <StatCard
          label="Avg Job Value"
          value={formatCurrency(company.avgJobValue)}
          sub="Per completed job"
          icon={DollarSign}
          color="bg-amber-500"
        />
      </div>

      {/* ── Recent Activity Feed ── */}
      <div className="rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-500" />
          Recent Activity
        </h3>
        {company.recentActivity.length === 0 ? (
          <p className="text-sm text-slate-600 py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-0">
            {company?.recentActivity?.map((act: any, idx: number) => (
              <div
                key={act.id}
                className={cn(
                  'flex items-start gap-3 py-3',
                  idx < company.recentActivity.length - 1 && 'border-b border-slate-100'
                )}
              >
                <ActivityIcon type={act.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{act.description}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{formatTimeAgo(act.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
