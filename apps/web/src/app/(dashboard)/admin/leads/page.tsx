'use client';

import { useState } from 'react';
import { Card, Button, Input, ErrorState } from '@/pkg/ui-components';

interface Lead {
  id: string;
  customer: string;
  photo: string;
  estimate: number;
  location: string;
  depositPaid: boolean;
  status: 'unassigned' | 'assigned' | 'completed' | 'spam';
  assignedPlumber: string;
  date: string;
}

const mockLeads: Lead[] = [
  { id: 'LD-001', customer: 'John Smith', photo: '📸', estimate: 850, location: 'Austin, TX', depositPaid: true, status: 'unassigned', assignedPlumber: '', date: '2026-07-08' },
  { id: 'LD-002', customer: 'Maria Garcia', photo: '📸', estimate: 1200, location: 'Round Rock, TX', depositPaid: false, status: 'unassigned', assignedPlumber: '', date: '2026-07-08' },
  { id: 'LD-003', customer: 'David Chen', photo: '📸', estimate: 450, location: 'Cedar Park, TX', depositPaid: true, status: 'assigned', assignedPlumber: 'James Wilson', date: '2026-07-07' },
  { id: 'LD-004', customer: 'Sarah Johnson', photo: '📸', estimate: 2200, location: 'Austin, TX', depositPaid: true, status: 'completed', assignedPlumber: 'Mike Torres', date: '2026-07-06' },
  { id: 'LD-005', customer: 'Robert Davis', photo: '📸', estimate: 600, location: 'Pflugerville, TX', depositPaid: false, status: 'unassigned', assignedPlumber: '', date: '2026-07-05' },
  { id: 'LD-006', customer: 'Emily Wilson', photo: '📸', estimate: 1500, location: 'Austin, TX', depositPaid: true, status: 'assigned', assignedPlumber: 'Sarah Blake', date: '2026-07-05' },
];

const plumbers = ['James Wilson', 'Mike Torres', 'Sarah Blake'];

export default function LeadsMarketplacePage() {
  const [leads, setLeads] = useState(mockLeads);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const revenue = leads.filter(l => l.status !== 'spam').reduce((s, l) => s + l.estimate, 0);
  const unassigned = leads.filter(l => l.status === 'unassigned').length;

  const assignLead = (id: string, plumber: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'assigned' as const, assignedPlumber: plumber } : l));
  };

  const rejectLead = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'spam' as const } : l));
  };

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="text-xl sm:text-2xl font-bold text-white">Leads Marketplace</h1><p className="text-sm text-slate-500 mt-0.5">Manage homeowner quotes and assign to plumbers</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-blue-500/10 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Total Revenue</p><p className="text-lg font-bold text-blue-400">${revenue.toLocaleString()}</p></div>
        <div className="rounded-lg bg-amber-500/10 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Unassigned</p><p className="text-lg font-bold text-amber-400">{unassigned}</p></div>
        <div className="rounded-lg bg-green-500/10 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Assigned</p><p className="text-lg font-bold text-green-400">{leads.filter(l => l.status === 'assigned').length}</p></div>
        <div className="rounded-lg bg-white/[0.02] px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Completed</p><p className="text-lg font-bold text-slate-400">{leads.filter(l => l.status === 'completed').length}</p></div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'unassigned', 'assigned', 'completed', 'spam'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#0F172A] text-slate-400 border-white/10 hover:border-white/20'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border border-white/10">
        <table className="w-full min-w-[600px] text-sm">
          <thead><tr className="bg-white/[0.02] border-b border-white/10">
            <th className="text-left px-4 py-3 font-semibold text-white">Customer</th>
            <th className="text-left px-4 py-3 font-semibold text-white">Photo</th>
            <th className="text-left px-4 py-3 font-semibold text-white">Estimate</th>
            <th className="text-left px-4 py-3 font-semibold text-white">Location</th>
            <th className="text-left px-4 py-3 font-semibold text-white">Deposit</th>
            <th className="text-left px-4 py-3 font-semibold text-white">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-white">Plumber</th>
            <th className="text-left px-4 py-3 font-semibold text-white">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{lead.customer}</td>
                <td className="px-4 py-3 text-lg">{lead.photo}</td>
                <td className="px-4 py-3 text-slate-300">${lead.estimate.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{lead.location}</td>
                <td className="px-4 py-3">{lead.depositPaid ? <span className="text-green-400 font-medium">✅ Paid</span> : <span className="text-slate-600">—</span>}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${lead.status === 'completed' ? 'bg-green-500/10 text-green-300' : lead.status === 'assigned' ? 'bg-blue-500/10 text-blue-300' : lead.status === 'spam' ? 'bg-red-500/10 text-red-300' : 'bg-amber-500/10 text-amber-300'}`}>{lead.status}</span></td>
                <td className="px-4 py-3 text-sm text-slate-400">{lead.assignedPlumber || <span className="text-amber-500">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {lead.status === 'unassigned' && (
                      <select onChange={(e) => { if (e.target.value) assignLead(lead.id, e.target.value); }} value="" className="text-xs rounded border border-white/10 px-1.5 py-1 outline-none w-28 bg-[#0F172A] text-slate-300">
                        <option value="">Assign to...</option>
                        {plumbers.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    )}
                    {lead.status !== 'spam' && lead.status !== 'completed' && (
                      <button onClick={() => rejectLead(lead.id)} className="text-xs text-red-400 hover:text-red-300 px-1.5 py-1">✕</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
