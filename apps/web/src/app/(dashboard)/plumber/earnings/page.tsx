'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import type { EarningSummary, PayoutRecord } from '@/lib/payouts';

/* ── Icons (inline SVG) ── */
const I = {
  Dollar: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  TrendingUp: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>,
  Clock: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Bank: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"/></svg>,
  Check: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  Alert: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>,
};

export default function EarningsPage() {
  const company = useAuthStore((s) => s.company);
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!company?.id) return;
    setLoading(true);
    fetch(`/api/plumber/earnings?companyId=${company.id}`)
      .then(r => r.json())
      .then(data => {
        setSummary(data.summary);
        setPayouts(data.payouts || []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); setError('Failed to load earnings'); });
  }, [company?.id]);

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;
  if (!summary) return <div className="p-6"><ErrorState title="No data" message="No earnings data available" /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Earnings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your revenue and payouts</p>
        </div>
        <a
          href={`/api/plumber/earnings?companyId=${company?.id}&format=csv`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          <I.TrendingUp className="w-3.5 h-3.5" /> Export
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-primary">This Week</p>
          <p className="text-xl font-bold text-foreground mt-1">${(summary.thisWeek / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-emerald-600">This Month</p>
          <p className="text-xl font-bold text-foreground mt-1">${(summary.thisMonth / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-violet-600">Lifetime</p>
          <p className="text-xl font-bold text-foreground mt-1">${(summary.lifetime / 100).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-amber-600">Pending</p>
          <p className="text-xl font-bold text-amber-600 mt-1">${(summary.pendingPayouts / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-cyan-600">Deposits This Week</p>
          <p className="text-xl font-bold text-cyan-700 mt-1">${(summary.depositsThisWeek / 100).toFixed(0)}</p>
        </div>
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-indigo-600">Jobs This Week</p>
          <p className="text-xl font-bold text-indigo-700 mt-1">{summary.jobsThisWeek}</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <Card variant="bordered" padding="md">
        <h3 className="text-sm font-semibold text-foreground mb-3">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/80">Jobs This Month</span>
              <span className="text-sm font-semibold text-foreground">{summary.jobsThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/80">Avg. Per Job</span>
              <span className="text-sm font-semibold text-foreground">${(summary.avgPerJob / 100).toFixed(2)}</span>
            </div>
            <div className="h-px bg-muted my-1" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/80">Lead Fees Charged (PlumbCore)</span>
              <span className="text-sm font-semibold text-foreground">${(summary.leadFeesCharged / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/80">Platform Fees Paid</span>
              <span className="text-sm font-semibold text-amber-600">-${(summary.platformFeesPaid / 100).toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Next Payout</p>
            <div className="flex items-center gap-2">
              <I.Clock className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-semibold text-foreground">{summary.nextPayoutDate}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weekly payout — every Sunday</p>
          </div>
        </div>
      </Card>

      {/* Stripe Connect Status */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <I.Bank className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Payout Method</p>
              <p className="text-xs text-muted-foreground">Stripe Connect — Weekly automatic transfers</p>
            </div>
          </div>
          <Button size="sm" onClick={() => window.open('/plumber/profile', '_self')}>Manage →</Button>
        </div>
      </Card>

      {/* Payout History */}
      <Card variant="bordered" padding="none">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Payout History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Period</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Gross</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Fee</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Net</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Jobs</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">No payouts yet</td></tr>
              ) : (
                payouts.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">{p.period_start} — {p.period_end}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">${(p.gross_amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-amber-600">-${(p.platform_fee / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-600">${(p.net_amount / 100).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/80">{p.fee_count}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                        p.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                        p.status === 'failed' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
