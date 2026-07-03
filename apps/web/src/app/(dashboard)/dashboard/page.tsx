'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Input,
  StatusBadge,
  Avatar,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { jobs, teamMembers, activities, getStats } from '@/lib/mock-data';
import type { ActivityItem, TeamMember, Job } from '@/lib/mock-data';

/* ── Skeleton Components ── */
function SkeletonCard() {
  return <div className="animate-pulse rounded-xl bg-whiteer h-28" />;
}
function SkeletonRow() {
  return <div className="animate-pulse rounded-lg bg-whiteer h-14" />;
}

/* ── Status dot for techs ── */
function StatusDot({ status }: { status: TeamMember['status'] }) {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    busy: 'bg-amber-500',
    away: 'bg-amber-500/60',
    offline: 'bg-steel-dark',
  };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]}`} />;
}

/* ── KPI Metric Card ── */
function MetricCard({
  label,
  value,
  change,
  trend,
}: {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}) {
  return (
    <Card variant="default" padding="md" hover>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <span
          className={`inline-flex items-center space-x-0.5 text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <svg
            className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span>{change}</span>
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
    </Card>
  );
}

/* ── Activity icon map ── */
function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const icons: Record<string, string> = {
    job_created: 'bg-accent-amber/10 text-amber-600',
    job_completed: 'bg-green-50 text-green-600',
    invoice_paid: 'bg-blue-50 text-blue-600',
    client_added: 'bg-blue-50 text-blue-600',
    estimate_sent: 'bg-accent-orange/10 text-accent-orange',
  };
  const glyphs: Record<string, string> = {
    job_created: '+',
    job_completed: '✓',
    invoice_paid: '$',
    client_added: '👤',
    estimate_sent: '📋',
  };
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
        icons[type] ?? 'bg-steel-dark/20 text-gray-500'
      }`}
    >
      {glyphs[type] ?? '•'}
    </span>
  );
}

/* ── Format timestamp for activity feed ── */
function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ── Activity type label ── */
function activityLabel(type: ActivityItem['type']): string {
  const map: Record<string, string> = {
    job_created: 'Job Created',
    job_completed: 'Completed',
    invoice_paid: 'Payment',
    client_added: 'New Client',
    estimate_sent: 'Estimate',
  };
  return map[type] ?? type;
}

/* ── Status color maps ── */
const statusColor: Record<Job['status'], string> = {
  scheduled: 'bg-blue-50 text-blue-600',
  'in-progress': 'bg-accent-amber/10 text-amber-600',
  completed: 'bg-green-50 text-green-600',
  urgent: 'bg-red-50 text-red-600',
  cancelled: 'bg-steel-dark/20 text-gray-500',
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // just simulating; data is synchronous
        setLoading(false);
      } catch {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    try {
      return getStats();
    } catch {
      setError('Failed to compute stats');
      return null;
    }
  }, []);

  /* ── Compute KPI values from real data ── */
  const kpis = useMemo(() => {
    if (!stats || !jobs.length) return [];
    const active = jobs.filter((j) => j.status === 'in-progress').length;
    const revenue = stats.totalRevenue;
    const pending = jobs.filter((j) => j.status === 'scheduled').length;
    const utilization = Math.round(
      (teamMembers.filter((t) => t.status === 'online' || t.status === 'busy').length /
        teamMembers.length) *
        100
    );
    const kpis: { label: string; value: string; change: string; trend: 'up' | 'down' }[] = [
      {
        label: 'Active Jobs Today',
        value: String(active),
        change: `+${Math.min(active, 3)} today`,
        trend: active >= 2 ? 'up' : ('down' as const),
      },
      {
        label: 'Revenue This Week',
        value: `$${revenue.toLocaleString()}`,
        change: '+12.5%',
        trend: 'up' as const,
      },
      {
        label: 'Pending Estimates',
        value: String(pending),
        change: pending > 3 ? '+2 new' : '−1',
        trend: pending > 3 ? 'up' : ('down' as const),
      },
      {
        label: 'Technician Utilization',
        value: `${utilization}%`,
        change: `+${utilization - 50 > 0 ? utilization - 50 : 0}%`,
        trend: utilization >= 60 ? 'up' as const : 'down' as const,
      },
    ];
    return kpis;
  }, [stats]);

  /* ── Recent activities (most recent 8) ── */
  const recentActivities = useMemo(
    () => [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8),
    []
  );

  /* ── Upcoming jobs (next 5 scheduled) ── */
  const upcomingJobs = useMemo(
    () =>
      [...jobs]
        .filter((j) => j.status === 'scheduled' || j.status === 'in-progress')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 5),
    []
  );

  /* ── Online techs ── */
  const techsOnDuty = useMemo(
    () => teamMembers.filter((t) => t.status !== 'offline'),
    []
  );

  if (error) {
    return (
      <Card variant="bordered" padding="lg">
        <ErrorState title="Dashboard error" message={error} onRetry={() => window.location.reload()} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Dispatcher control room — live overview</p>
      </div>

      {/* ── Top row: KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((kpi) => (
              <MetricCard key={kpi.label} {...kpi} />
            ))}
      </div>

      {/* ── Middle section: Activity feed + Quick actions/Techs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            <span className="text-xs text-gray-500">{activities.length} items</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <Card variant="bordered" padding="md">
              <EmptyState title="No activity yet" description="Activity will appear here as jobs and invoices are processed." />
            </Card>
          ) : (
            <div className="space-y-1">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white/50 px-3.5 py-2.5 transition-colors hover:border-white/10"
                >
                  <ActivityIcon type={act.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{act.description}</p>
                    <p className="text-xs text-gray-500">
                      {act.clientName && <span className="font-medium text-gray-400">{act.clientName}</span>}
                      {act.amount && <span> — ${act.amount}</span>}
                      <span className="ml-2">{timeAgo(act.timestamp)}</span>
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-whiteer px-2 py-0.5 text-[10px] font-medium text-gray-400">
                    {activityLabel(act.type)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Actions + Techs */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card variant="default" padding="md">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Button variant="primary" size="sm" fullWidth onClick={() => router.push('/jobs')}>
                + New Job
              </Button>
              <Button variant="secondary" size="sm" fullWidth onClick={() => router.push('/clients')}>
                + New Client
              </Button>
              <Button variant="ghost" size="sm" fullWidth onClick={() => router.push('/invoicing')}>
                Create Invoice
              </Button>
            </div>
          </Card>

          {/* Techs on Duty */}
          <Card variant="default" padding="md">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Techs on Duty</h3>
              <span className="text-xs text-gray-500">{techsOnDuty.length} online</span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : techsOnDuty.length === 0 ? (
              <p className="text-xs text-gray-500">No technicians on duty</p>
            ) : (
              <div className="space-y-2.5">
                {techsOnDuty.map((tech) => (
                  <div key={tech.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <Avatar name={tech.name} size="sm" />
                        <span className="absolute -bottom-0.5 -right-0.5">
                          <StatusDot status={tech.status} />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900 truncate">{tech.name}</p>
                        <p className="text-[11px] text-gray-500 capitalize">{tech.role.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-gray-500">{tech.activeJobs} jobs</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Bottom: Upcoming Jobs ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Upcoming Jobs</h2>
          <a
            href="/jobs"
            className="text-xs font-medium text-blue-600 hover:text-blue-600-light transition-colors"
          >
            View All →
          </a>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : upcomingJobs.length === 0 ? (
          <Card variant="bordered" padding="md">
            <EmptyState title="No upcoming jobs" description="All jobs are completed or none scheduled yet." />
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="py-3 pr-4">Job</th>
                  <th className="py-3 pr-4">Client</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Estimate</th>
                </tr>
              </thead>
              <tbody>
                {upcomingJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-gray-200/50 transition-colors hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <td className="py-2.5 pr-4">
                      <p className="text-gray-900 font-medium truncate max-w-[180px]">
                        {job.title}
                      </p>
                      <p className="text-[11px] text-gray-500">{job.id}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400 truncate max-w-[140px]">
                      {job.clientName}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400 whitespace-nowrap">
                      {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${
                          statusColor[job.status]
                        }`}
                      >
                        {job.status === 'in-progress' ? 'In Progress' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-900 font-medium whitespace-nowrap">
                      ${job.estimatedCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
