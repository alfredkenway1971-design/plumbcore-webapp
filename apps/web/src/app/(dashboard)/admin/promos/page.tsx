'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal, ErrorState } from '@/pkg/ui-components';

interface PromoCode {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  applicablePlans: string[];
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

const mockPromos: PromoCode[] = [
  { id: 'PROMO-001', code: 'LAUNCH20', discountType: 'percent', discountValue: 20, applicablePlans: ['solo', 'pro', 'business'], expiryDate: '2026-08-01', usageLimit: 100, usedCount: 45, active: true },
  { id: 'PROMO-002', code: 'PRO50', discountType: 'fixed', discountValue: 50, applicablePlans: ['pro'], expiryDate: '2026-09-01', usageLimit: 50, usedCount: 12, active: true },
  { id: 'PROMO-003', code: 'WELCOME10', discountType: 'percent', discountValue: 10, applicablePlans: ['solo'], expiryDate: '2026-12-31', usageLimit: 500, usedCount: 203, active: true },
];

const plans = ['solo', 'pro', 'business'];
let promoCounter = 4;

export default function PromoCodesPage() {
  const [promos, setPromos] = useState(mockPromos);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', discountType: 'percent' as 'percent' | 'fixed', discountValue: 10, plans: ['solo'] as string[], expiryDate: '', usageLimit: 100 });
  const [error, setError] = useState<string | null>(null);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm(f => ({ ...f, code }));
  };

  const createPromo = () => {
    if (!form.code) return;
    setPromos(prev => [...prev, {
      id: `PROMO-${String(promoCounter++).padStart(3, '0')}`,
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue: form.discountValue,
      applicablePlans: form.plans,
      expiryDate: form.expiryDate,
      usageLimit: form.usageLimit,
      usedCount: 0,
      active: true,
    }]);
    setShowCreate(false);
    setForm({ code: '', discountType: 'percent', discountValue: 10, plans: ['solo'], expiryDate: '', usageLimit: 100 });
  };

  const toggleActive = (id: string) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const totalRedemptions = promos.reduce((s, p) => s + p.usedCount, 0);
  const activePromos = promos.filter(p => p.active).length;

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl sm:text-2xl font-bold text-gray-900">Promo Codes</h1><p className="text-sm text-gray-500 mt-0.5">Create and manage discount codes</p></div>
        <Button size="sm" onClick={() => { generateCode(); setShowCreate(true); }}>+ New Code</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-blue-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Active Codes</p><p className="text-lg font-bold text-blue-600">{activePromos}</p></div>
        <div className="rounded-lg bg-green-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Redemptions</p><p className="text-lg font-bold text-green-600">{totalRedemptions.toLocaleString()}</p></div>
        <div className="rounded-lg bg-amber-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Revenue Impact</p><p className="text-lg font-bold text-amber-600">${(totalRedemptions * 35).toLocaleString()}</p></div>
      </div>

      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Code</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Discount</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Plans</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Expires</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Usage</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Toggle</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {promos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{p.code}</td>
                  <td className="px-4 py-3 text-gray-700">{p.discountType === 'percent' ? `${p.discountValue}%` : `$${p.discountValue}`}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.applicablePlans.join(', ')}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.expiryDate || 'Never'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.usedCount}/{p.usageLimit}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.active ? 'Active' : 'Disabled'}</span></td>
                  <td className="px-4 py-3"><button onClick={() => toggleActive(p.id)} className={`text-xs px-2 py-1 rounded ${p.active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>{p.active ? 'Disable' : 'Enable'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showCreate && (
        <Modal open={true} onClose={() => setShowCreate(false)} title="Create Promo Code">
          <div className="space-y-4 p-4">
            <div><label className="text-xs font-medium text-gray-500">Code</label>
              <div className="flex gap-2"><Input value={form.code} onChange={(e: any) => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} className="font-mono uppercase flex-1" /><Button size="sm" variant="ghost" onClick={generateCode}>Generate</Button></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-500">Type</label>
                <select value={form.discountType} onChange={(e: any) => setForm(f => ({...f, discountType: e.target.value}))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none">
                  <option value="percent">Percentage (%)</option><option value="fixed">Fixed ($)</option>
                </select>
              </div>
              <div><label className="text-xs font-medium text-gray-500">Value</label><Input type="number" value={form.discountValue} onChange={(e: any) => setForm(f => ({...f, discountValue: Number(e.target.value)}))} /></div>
            </div>
            <div><label className="text-xs font-medium text-gray-500">Applicable Plans</label>
              <div className="flex gap-2 mt-1">{plans.map(p => <label key={p} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked={form.plans.includes(p)} onChange={() => setForm(f => ({...f, plans: f.plans.includes(p) ? f.plans.filter(x => x !== p) : [...f.plans, p]}))} />{p}</label>)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-gray-500">Expiry Date</label><Input type="date" value={form.expiryDate} onChange={(e: any) => setForm(f => ({...f, expiryDate: e.target.value}))} /></div>
              <div><label className="text-xs font-medium text-gray-500">Usage Limit</label><Input type="number" value={form.usageLimit} onChange={(e: any) => setForm(f => ({...f, usageLimit: Number(e.target.value)}))} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={createPromo}>Create Code</Button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
