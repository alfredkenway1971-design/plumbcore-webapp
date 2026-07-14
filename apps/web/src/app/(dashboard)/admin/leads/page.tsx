'use client';

import { useState } from 'react';
import { Card, Button, Input, ErrorState } from '@/pkg/ui-components';

interface Lead {
  id: string;
  customer: string;
  photo: string;
  estimate: number;
  depositAmount: number;
  depositTier: string;
  location: string;
  depositPaid: boolean;
  status: 'matching' | 'assigned' | 'en_route' | 'arrived' | 'complete' | 'unfulfilled' | 'refunded';
  assignedPlumber: string;
  date: string;
  timeToMatch?: string;
  confidence?: number;
}

const mockLeads: Lead[] = [
  { id: 'LD-001', customer: 'John Smith', photo: '📸', estimate: 850, depositAmount: 49, depositTier: 'small', location: 'Austin, TX', depositPaid: true, status: 'matching', assignedPlumber: '', date: '2026-07-14', confidence: 95 },
  { id: 'LD-002', customer: 'Maria Garcia', photo: '📸', estimate: 1200, depositAmount: 99, depositTier: 'medium', location: 'Round Rock, TX', depositPaid: true, status: 'assigned', assignedPlumber: 'James Wilson', date: '2026-07-14', timeToMatch: '3m 12s' },
  { id: 'LD-003', customer: 'David Chen', photo: '📸', estimate: 450, depositAmount: 49, depositTier: 'small', location: 'Cedar Park, TX', depositPaid: true, status: 'assigned', assignedPlumber: 'Sarah Blake', date: '2026-07-13', timeToMatch: '1m 45s' },
  { id: 'LD-004', customer: 'Sarah Johnson', photo: '📸', estimate: 2200, depositAmount: 199, depositTier: 'premium', location: 'Austin, TX', depositPaid: true, status: 'complete', assignedPlumber: 'Mike Torres', date: '2026-07-12', timeToMatch: '2m 30s' },
  { id: 'LD-005', customer: 'Robert Davis', photo: '📸', estimate: 600, depositAmount: 49, depositTier: 'small', location: 'Pflugerville, TX', depositPaid: true, status: 'unfulfilled', assignedPlumber: '', date: '2026-07-11' },
];

const plumbers = ['James Wilson', 'Mike Torres', 'Sarah Blake'];

export default function LeadsMarketplacePage() {
  const [leads, setLeads] = useState(mockLeads);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const revenue = leads.filter(l => l.status !== 'unfulfilled' && l.status !== 'refunded').reduce((s, l) => s + l.estimate, 0);
  const matching = leads.filter(l => l.status === 'matching').length;

  const assignLead = (id: string, plumber: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'assigned' as const, assignedPlumber: plumber } : l));
  };

  const rejectLead = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'spam' as const } : l));
  };

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">Leads Marketplace</h1><p className="text-sm text-slate-500 mt-0.5">Manage homeowner quotes and assign to plumbers</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-blue-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Total Revenue</p><p className="text-lg font-bold text-blue-600">${revenue.toLocaleString()}</p></div>
        <div className="rounded-lg bg-amber-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Unassigned</p><p className="text-lg font-bold text-amber-600">{unassigned}</p></div>
        <div className="rounded-lg bg-green-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Assigned</p><p className="text-lg font-bold text-emerald-600">{leads.filter(l => l.status === 'assigned').length}</p></div>
        <div className="rounded-lg hover:bg-slate-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Completed</p><p className="text-lg font-bold text-slate-400">{leads.filter(l => l.status === 'completed').length}</p></div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'matching', 'assigned', 'en_route', 'arrived', 'complete', 'unfulfilled', 'refunded'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>{f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}</button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border border-slate-200">
        <table className="w-full min-w-[600px] text-sm">
          <thead><tr className="hover:bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 font-semibold text-slate-900">Customer</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-900">Photo</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-900">Estimate</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-900">Location</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-900">Deposit</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-900">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-900">Plumber</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-900">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{lead.customer}</td>
                <td className="px-4 py-3 text-lg">{lead.photo}</td>
                <td className="px-4 py-3 text-slate-700">${lead.estimate.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{lead.location}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">${lead.depositAmount}</span>
                  <span className="text-[10px] text-slate-400 ml-1 uppercase">{lead.depositTier}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    lead.status === 'complete' ? 'bg-green-50 text-green-700' : 
                    lead.status === 'assigned' ? 'bg-blue-50 text-blue-600' : 
                    lead.status === 'matching' ? 'bg-purple-50 text-purple-600 animate-pulse' : 
                    lead.status === 'en_route' ? 'bg-cyan-50 text-cyan-600' : 
                    lead.status === 'arrived' ? 'bg-emerald-50 text-emerald-600' : 
                    lead.status === 'unfulfilled' ? 'bg-red-50 text-red-700' : 
                    lead.status === 'refunded' ? 'bg-orange-50 text-orange-600' : 
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {lead.status === 'en_route' ? 'En Route' : lead.status.charAt(0).toUpperCase() + lead.status.slice(1).replace('_', ' ')}
                  </span>
                  {lead.timeToMatch && <span className="block text-[10px] text-slate-400 mt-0.5">Matched in {lead.timeToMatch}</span>}
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{lead.assignedPlumber || <span className="text-amber-500">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {lead.status === 'matching' && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50">Assign</button>
                    )}
                    {lead.status === 'unfulfilled' && (
                      <span className="text-xs text-red-500 font-medium">⚠️ No plumber found</span>
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
