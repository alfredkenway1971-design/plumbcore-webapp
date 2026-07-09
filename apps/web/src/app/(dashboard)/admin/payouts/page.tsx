'use client';

import { useState } from 'react';
import { Card, Button, ErrorState } from '@/pkg/ui-components';

interface Payout {
  id: string;
  plumber: string;
  leadCount: number;
  feeOwed: number;
  status: 'pending' | 'paid';
  month: string;
}

const mockPayouts: Payout[] = [
  { id: 'PO-001', plumber: 'James Wilson', leadCount: 4, feeOwed: 680, status: 'pending', month: '2026-07' },
  { id: 'PO-002', plumber: 'Mike Torres', leadCount: 3, feeOwed: 510, status: 'pending', month: '2026-07' },
  { id: 'PO-003', plumber: 'Sarah Blake', leadCount: 2, feeOwed: 340, status: 'paid', month: '2026-06' },
  { id: 'PO-004', plumber: 'James Wilson', leadCount: 5, feeOwed: 850, status: 'paid', month: '2026-06' },
  { id: 'PO-005', plumber: 'Mike Torres', leadCount: 3, feeOwed: 510, status: 'paid', month: '2026-06' },
];

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState(mockPayouts);
  const [error, setError] = useState<string | null>(null);

  const markPaid = (id: string) => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' as const } : p));
  };

  const pending = payouts.filter(p => p.status === 'pending');
  const totalPending = pending.reduce((s, p) => s + p.feeOwed, 0);
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.feeOwed, 0);
  const currentMonth = 'July 2026';

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payouts</h1><p className="text-sm text-gray-500 mt-0.5">Track lead fees owed to plumbers — {currentMonth}</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-amber-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Pending</p><p className="text-lg font-bold text-amber-600">${totalPending.toLocaleString()}</p></div>
        <div className="rounded-lg bg-green-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Paid This Month</p><p className="text-lg font-bold text-green-600">${totalPaid.toLocaleString()}</p></div>
        <div className="rounded-lg bg-blue-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Plumbers</p><p className="text-lg font-bold text-blue-600">{new Set(payouts.map(p => p.plumber)).size}</p></div>
      </div>

      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Plumber</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Leads</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Fee Owed</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Month</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map(po => (
                <tr key={po.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{po.plumber}</td>
                  <td className="px-4 py-3 text-gray-700">{po.leadCount}</td>
                  <td className="px-4 py-3 text-gray-700">${po.feeOwed}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${po.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{po.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{po.month}</td>
                  <td className="px-4 py-3">{po.status === 'pending' && <Button size="sm" onClick={() => markPaid(po.id)}>Mark Paid</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
