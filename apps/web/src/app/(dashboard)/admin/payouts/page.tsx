'use client';

import { useState } from 'react';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import { mockPayoutHistory } from '@/lib/payouts';
import { mockPlumberProfiles } from '@/lib/plumber-profiles';
import type { PayoutRecord } from '@/lib/payouts';
import { Download } from 'lucide-react';

/* ── Helpers ── */
const format$ = (cents: number) => `$${(cents / 100).toLocaleString()}`;

export default function PayoutsPage() {
  const [payouts] = useState(mockPayoutHistory);
  const [error, setError] = useState<string | null>(null);

  const pending = payouts.filter(p => p.status === 'pending');
  const pendingTotal = pending.reduce((s, p) => s + p.net_amount, 0);
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.net_amount, 0);
  const connectedPlumbers = mockPlumberProfiles.filter(p => p.stripe_onboarding_complete).length;

  // Revenue summary data
  const revenueSummary = [
    { label: 'SaaS Revenue', value: '$72,400', sub: 'Monthly subscriptions', color: 'text-blue-600' },
    { label: 'Deposit Revenue', value: '$38,650', sub: '800 jobs × avg $48', color: 'text-emerald-600' },
    { label: 'Total Revenue', value: '$111,050', sub: 'This month', color: 'text-emerald-600', large: true },
    { label: 'Net Profit', value: '$57,200', sub: 'After payouts & expenses', color: 'text-emerald-600', large: true },
  ];

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">💰 Revenue & Payouts</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monthly revenue summary and weekly deposit transfers</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => alert('Exporting CSV...')}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => alert('Processing all pending payouts...')}>
            ⚡ Process All Payouts
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {revenueSummary.map(r => (
          <div key={r.label} className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{r.label}</p>
            <p className={`text-${r.large ? '2xl' : 'xl'} font-bold mt-1 ${r.color}`}>{r.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{r.sub}</p>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-blue-50 border border-blue-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-blue-600">Total Owed</p>
          <p className="text-lg font-bold text-slate-900 mt-1">${(pendingTotal / 100).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-emerald-600">Paid This Month</p>
          <p className="text-lg font-bold text-slate-900 mt-1">${(totalPaid / 100).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-amber-600">Pending Pay</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{pending.length}</p>
        </div>
        <div className="rounded-xl bg-violet-50 border border-violet-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-violet-600">Connected Plumbers</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{connectedPlumbers}/{mockPlumberProfiles.length}</p>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Pending Payouts (Next Monday)</h3>
        </div>
        <div className="px-5 py-3 divide-y divide-slate-100">
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500 py-3">No pending payouts</p>
          ) : (
            pending.map(p => (
              <div key={p.id} className="flex items-center py-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-xs font-bold text-blue-700 mr-3 shrink-0">
                  {p.plumber_name?.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{p.plumber_name}</p>
                  <p className="text-xs text-slate-500">{p.fee_count} jobs · {p.period_start} to {p.period_end}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm font-bold text-slate-900">${(p.net_amount / 100).toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">net</p>
                </div>
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600">
                  ⏳ Pending
                </span>
              </div>
            ))
          )}
          {pending.length > 0 && (
            <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-slate-900">
              <span className="text-sm font-bold text-slate-900">Total Pending</span>
              <span className="text-lg font-bold text-slate-900">${(pendingTotal / 100).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl bg-amber-50 border border-amber-500/20 px-4 py-3 flex items-center gap-3">
        <span className="text-lg">💡</span>
        <p className="text-sm text-amber-800">Weekly payouts run every Sunday via <strong>/api/payouts/process-weekly</strong>. Plumbers must complete Stripe Connect onboarding first.</p>
      </div>

      {/* Payout History */}
      <Card variant="bordered" padding="none">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Payout History</h3>
          <Button size="sm" variant="secondary">Process Weekly ↓</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs">Plumber</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs">Period</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs">Gross</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs">Platform Fee</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs">Net</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs">Jobs</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-900">{p.plumber_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.period_start} — {p.period_end}</td>
                  <td className="px-4 py-3 text-slate-700">${(p.gross_amount / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-amber-600">-${(p.platform_fee / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-emerald-600">${(p.net_amount / 100).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.fee_count}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                      p.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                      p.status === 'failed' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
