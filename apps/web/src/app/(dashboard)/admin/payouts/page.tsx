'use client';

import { useState } from 'react';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import { mockPayoutHistory } from '@/lib/payouts';
import { mockPlumberProfiles } from '@/lib/plumber-profiles';
import type { PayoutRecord } from '@/lib/payouts';

export default function PayoutsPage() {
  const [payouts] = useState(mockPayoutHistory);
  const [error, setError] = useState<string | null>(null);

  const pending = payouts.filter(p => p.status === 'paid');
  const totalPending = payouts.reduce((s, p) => s + p.net_amount, 0);
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.net_amount, 0);
  const connectedPlumbers = mockPlumberProfiles.filter(p => p.stripe_onboarding_complete).length;

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">Payouts</h1><p className="text-sm text-slate-500 mt-0.5">Track lead fees owed to plumbers — Weekly schedule</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-blue-50 border border-blue-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-blue-600">Total Owed</p>
          <p className="text-lg font-bold text-slate-900 mt-1">${(totalPending / 100).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-emerald-600">Paid This Month</p>
          <p className="text-lg font-bold text-slate-900 mt-1">${(totalPaid / 100).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-amber-600">Pending Pay</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{payouts.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="rounded-xl bg-violet-50 border border-violet-500/20 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-violet-600">Connected Plumbers</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{connectedPlumbers}/{mockPlumberProfiles.length}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl bg-amber-50 border border-amber-500/20 px-4 py-3 flex items-center gap-3">
        <span className="text-lg">💡</span>
        <p className="text-sm text-amber-300">Weekly payouts run every Sunday via <strong>/api/payouts/process-weekly</strong>. Plumbers must complete Stripe Connect onboarding first.</p>
      </div>

      {/* Payouts Table */}
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
