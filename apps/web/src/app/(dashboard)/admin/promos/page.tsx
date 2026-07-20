'use client';

import { useState } from 'react';
import { Card, Button, Input, ErrorState } from '@/pkg/ui-components';

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

const plans = ['solo', 'pro', 'business'];
let promoCounter = 1;

const initialPromos: PromoCode[] = [];

export default function PromoCodesPage() {
  const [promos, setPromos] = useState(initialPromos);
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
        <div><h1 className="text-xl sm:text-2xl font-bold text-foreground">Promo Codes</h1><p className="text-sm text-muted-foreground mt-0.5">Create and manage discount codes</p></div>
        <Button size="sm" onClick={() => { generateCode(); setShowCreate(true); }}>+ New Code</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-blue-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Active Codes</p><p className="text-lg font-bold text-primary">{activePromos}</p></div>
        <div className="rounded-lg bg-green-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Redemptions</p><p className="text-lg font-bold text-green-600">{totalRedemptions.toLocaleString()}</p></div>
        <div className="rounded-lg bg-amber-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Revenue Impact</p><p className="text-lg font-bold text-amber-600">$0</p></div>
      </div>

      {promos.length === 0 ? (
        <Card variant="bordered" padding="none">
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏷️</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No promo codes yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Create promo codes to offer discounts to plumbers. You can set percentage or fixed discounts, limit usage, and control which plans they apply to.
            </p>
            <Button size="sm" className="mt-4" onClick={() => { generateCode(); setShowCreate(true); }}>+ New Code</Button>
          </div>
        </Card>
      ) : (
        /* Desktop table */
        <div className="hidden sm:block">
          <Card variant="bordered" padding="none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead><tr className="bg-muted border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Discount</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Plans</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Expires</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Usage</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Toggle</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {promos.map(p => (
                    <tr key={p.id} className="hover:bg-muted">
                      <td className="px-4 py-3 font-mono font-bold text-foreground">{p.code}</td>
                      <td className="px-4 py-3 text-foreground">{p.discountType === 'percent' ? `${p.discountValue}%` : `$${p.discountValue}`}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.applicablePlans.join(', ')}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.expiryDate || 'Never'}</td>
                      <td className="px-4 py-3 text-muted-foreground/80">{p.usedCount}/{p.usageLimit}</td>
                      <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{p.active ? 'Active' : 'Disabled'}</span></td>
                      <td className="px-4 py-3"><button onClick={() => toggleActive(p.id)} className={`text-xs px-2 py-1 rounded ${p.active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>{p.active ? 'Disable' : 'Enable'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Mobile cards */}
      {promos.length > 0 && (
        <div className="sm:hidden space-y-3">
          {promos.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-foreground text-sm">{p.code}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{p.active ? 'Active' : 'Disabled'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Discount:</span> <span className="font-medium text-foreground">{p.discountType === 'percent' ? `${p.discountValue}%` : `$${p.discountValue}`}</span></div>
                <div><span className="text-muted-foreground">Plans:</span> <span className="text-foreground">{p.applicablePlans.join(', ')}</span></div>
                <div><span className="text-muted-foreground">Expires:</span> <span className="text-foreground">{p.expiryDate || 'Never'}</span></div>
                <div><span className="text-muted-foreground">Usage:</span> <span className="text-foreground">{p.usedCount}/{p.usageLimit}</span></div>
              </div>
              <button onClick={() => toggleActive(p.id)} className={`mt-2 text-xs px-3 py-1 rounded-lg font-medium ${p.active ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>{p.active ? 'Disable' : 'Enable'}</button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">Create Promo Code</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground/80 hover:text-muted-foreground text-xl">&times;</button>
            </div>
            <div className="space-y-4 p-5">
              <div><label className="text-xs font-medium text-muted-foreground">Code</label>
                <div className="flex gap-2"><Input value={form.code} onChange={(e: any) => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} className="font-mono uppercase flex-1" /><Button size="sm" variant="ghost" onClick={generateCode}>Generate</Button></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Type</label>
                  <select value={form.discountType} onChange={(e: any) => setForm(f => ({...f, discountType: e.target.value}))} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none">
                    <option value="percent">Percentage (%)</option><option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div><label className="text-xs font-medium text-muted-foreground">Value</label><Input type="number" value={form.discountValue} onChange={(e: any) => setForm(f => ({...f, discountValue: Number(e.target.value)}))} /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Applicable Plans</label>
                <div className="flex gap-2 mt-1">{plans.map(p => <label key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground/80 cursor-pointer"><input type="checkbox" checked={form.plans.includes(p)} onChange={() => setForm(f => ({...f, plans: f.plans.includes(p) ? f.plans.filter(x => x !== p) : [...f.plans, p]}))} />{p}</label>)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Expiry Date</label><Input type="date" value={form.expiryDate} onChange={(e: any) => setForm(f => ({...f, expiryDate: e.target.value}))} /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Usage Limit</label><Input type="number" value={form.usageLimit} onChange={(e: any) => setForm(f => ({...f, usageLimit: Number(e.target.value)}))} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={createPromo}>Create Code</Button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
