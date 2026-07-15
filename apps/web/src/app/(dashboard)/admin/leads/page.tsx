'use client';

import { useState, useMemo } from 'react';
import { Card, Button, Input, ErrorState } from '@/pkg/ui-components';
import { depositDollars, DEPOSIT_TIERS } from '@/lib/plan-pricing';

/* ── Types ── */
type DispatchMode = 'manual' | 'round-robin' | 'pool';

interface Lead {
  id: string;
  customer: string;
  photo: string;
  estimate: number;
  depositAmount: number;
  depositTier: string;
  location: string;
  zip: string;
  depositPaid: boolean;
  status: 'matching' | 'assigned' | 'en_route' | 'arrived' | 'complete' | 'unfulfilled' | 'refunded';
  assignedPlumber: string;
  date: string;
  timeToMatch?: string;
  confidence?: number;
}

interface Plumber {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  jobsCompleted: number;
  available: boolean;
  serviceZips: string[];
  rotationOrder: number;
}

/* ── Mock Data ── */
const mockLeads: Lead[] = [
  { id: 'LD-001', customer: 'John Smith', photo: '📸', estimate: 850, depositAmount: 49, depositTier: 'small', location: 'Austin, TX 78701', zip: '78701', depositPaid: true, status: 'matching', assignedPlumber: '', date: '2026-07-14', confidence: 95 },
  { id: 'LD-002', customer: 'Maria Garcia', photo: '📸', estimate: 1200, depositAmount: 99, depositTier: 'medium', location: 'Round Rock, TX 78664', zip: '78664', depositPaid: true, status: 'assigned', assignedPlumber: 'James Wilson', date: '2026-07-14', timeToMatch: '3m 12s' },
  { id: 'LD-003', customer: 'David Chen', photo: '📸', estimate: 450, depositAmount: 49, depositTier: 'small', location: 'Cedar Park, TX 78613', zip: '78613', depositPaid: true, status: 'assigned', assignedPlumber: 'Sarah Blake', date: '2026-07-13', timeToMatch: '1m 45s' },
  { id: 'LD-004', customer: 'Sarah Johnson', photo: '📸', estimate: 2200, depositAmount: 199, depositTier: 'premium', location: 'Austin, TX 78702', zip: '78702', depositPaid: true, status: 'complete', assignedPlumber: 'Mike Torres', date: '2026-07-12', timeToMatch: '2m 30s' },
  { id: 'LD-005', customer: 'Robert Davis', photo: '📸', estimate: 600, depositAmount: 49, depositTier: 'small', location: 'Pflugerville, TX 78660', zip: '78660', depositPaid: true, status: 'unfulfilled', assignedPlumber: '', date: '2026-07-11' },
  { id: 'LD-006', customer: 'Emily White', photo: '📸', estimate: 1800, depositAmount: 149, depositTier: 'large', location: 'Austin, TX 78704', zip: '78704', depositPaid: true, status: 'matching', assignedPlumber: '', date: '2026-07-15', confidence: 88 },
  { id: 'LD-007', customer: 'Tom Brown', photo: '📸', estimate: 350, depositAmount: 49, depositTier: 'small', location: 'Round Rock, TX 78665', zip: '78665', depositPaid: true, status: 'matching', assignedPlumber: '', date: '2026-07-15', confidence: 92 },
];

const mockPlumbers: Plumber[] = [
  { id: 'P-001', name: 'James Wilson', specialties: ['Drain Cleaning', 'Water Heaters'], rating: 4.8, jobsCompleted: 342, available: true, serviceZips: ['787', '786'], rotationOrder: 1 },
  { id: 'P-002', name: 'Mike Torres', specialties: ['Sewer Lines', 'Gas Lines'], rating: 4.9, jobsCompleted: 521, available: true, serviceZips: ['787', '786'], rotationOrder: 2 },
  { id: 'P-003', name: 'Sarah Blake', specialties: ['Kitchen Plumbing', 'Water Heaters'], rating: 4.7, jobsCompleted: 198, available: true, serviceZips: ['786'], rotationOrder: 3 },
  { id: 'P-004', name: 'Alex Rivera', specialties: ['General Plumbing', 'Gas Lines'], rating: 4.5, jobsCompleted: 76, available: false, serviceZips: ['787'], rotationOrder: 4 },
  { id: 'P-005', name: 'Jenny Park', specialties: ['Drain Cleaning', 'Water Heaters', 'Sewer'], rating: 4.9, jobsCompleted: 267, available: true, serviceZips: ['787', '786'], rotationOrder: 5 },
];

/* ── Round-Robin Config ── */
interface RoundRobinConfig {
  zipGroupPrefix: string;
  rotationOrder: string[];  // plumber IDs in order
}

/* ── Component ── */
export default function LeadsMarketplacePage() {
  const [leads, setLeads] = useState(mockLeads);
  const [plumbers] = useState(mockPlumbers);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>('manual');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  // Round-Robin Config State
  const [showRRConfig, setShowRRConfig] = useState(false);
  const [rrConfig, setRrConfig] = useState<RoundRobinConfig[]>([
    { zipGroupPrefix: '787', rotationOrder: ['P-001', 'P-002', 'P-005', 'P-003', 'P-004'] },
    { zipGroupPrefix: '786', rotationOrder: ['P-003', 'P-002', 'P-001', 'P-005'] },
  ]);
  const [rrRotationIndex, setRrRotationIndex] = useState<Record<string, number>>({ '787': 0, '786': 0 });

  // Pool mode
  const [poolActive, setPoolActive] = useState(false);

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const revenue = leads.filter(l => l.status !== 'unfulfilled' && l.status !== 'refunded').reduce((s, l) => s + l.estimate, 0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalDeposits = leads.filter(l => l.status !== 'unfulfilled' && l.status !== 'refunded').reduce((s, l) => s + l.depositAmount, 0);
  const matching = leads.filter(l => l.status === 'matching').length;

  /* ── Dispatch Handlers ── */

  const assignLead = (id: string, plumberId: string) => {
    const plumber = plumbers.find(p => p.id === plumberId);
    if (!plumber) return;
    setLeads(prev => prev.map(l =>
      l.id === id ? { ...l, status: 'assigned' as const, assignedPlumber: plumber.name, timeToMatch: 'Now' } : l
    ));
    setSelectedLead(null);
    setAssigningTo(null);
  };

  const rejectLead = (id: string) => {
    setLeads(prev => prev.map((l): Lead =>
      l.id === id ? { ...l, status: 'unfulfilled' } : l
    ));
    setSelectedLead(null);
  };

  const autoRoundRobin = () => {
    const unassigned = leads.filter(l => l.status === 'matching');
    if (unassigned.length === 0) return;

    const newLeads = [...leads];
    const newIndices = { ...rrRotationIndex };

    for (const lead of unassigned) {
      // Find matching zip config
      const zipPrefix = lead.zip.substring(0, 3);
      const config = rrConfig.find(c => c.zipGroupPrefix === zipPrefix);
      if (!config || config.rotationOrder.length === 0) continue;

      const idx = newIndices[zipPrefix] || 0;
      const plumberId = config.rotationOrder[idx % config.rotationOrder.length];
      const plumber = plumbers.find(p => p.id === plumberId);

      if (plumber && plumber.available) {
        const leadIdx = newLeads.findIndex(l => l.id === lead.id);
        if (leadIdx >= 0) {
          newLeads[leadIdx] = {
            ...newLeads[leadIdx],
            status: 'assigned' as const,
            assignedPlumber: plumber.name,
            timeToMatch: 'Auto',
          };
        }
        newIndices[zipPrefix] = (newIndices[zipPrefix] || 0) + 1;
      }
    }

    setRrRotationIndex(newIndices);
    setLeads(newLeads);
  };

  const broadcastToPool = () => {
    setPoolActive(true);
    const poolLeadIds = leads.filter(l => l.status === 'matching').map(l => l.id);

    // Simulate plumbers accepting leads after a delay
    const available = plumbers.filter(p => p.available);
    if (available.length > 0 && poolLeadIds.length > 0) {
      setTimeout(() => {
        setLeads(prev => prev.map(l =>
          poolLeadIds.includes(l.id) && l.status === 'matching'
            ? { ...l, status: 'assigned' as const, assignedPlumber: available[Math.floor(Math.random() * available.length)].name, timeToMatch: 'Pool' }
            : l
        ));
        setPoolActive(false);
      }, 3000);
    }
  };

  /* ── Render ── */
  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Leads Marketplace</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage homeowner quotes and dispatch to plumbers</p>
      </div>

      {/* Dispatch Mode Selector */}
      <Card padding="md" variant="bordered">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex gap-1.5">
            {[
              { key: 'manual' as const, label: 'Manual Assign', icon: '👆' },
              { key: 'round-robin' as const, label: 'Auto Round-Robin', icon: '🔄' },
              { key: 'pool' as const, label: 'Lead Pool', icon: '📡' },
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => setDispatchMode(mode.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  dispatchMode === mode.key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Mode-specific controls */}
          {dispatchMode === 'round-robin' && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={autoRoundRobin} disabled={matching === 0}>
                🚀 Auto-Assign {matching} Lead{matching !== 1 ? 's' : ''}
              </Button>
              <button
                onClick={() => setShowRRConfig(!showRRConfig)}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
              >
                {showRRConfig ? 'Hide Config' : '⚙️ Config'}
              </button>
            </div>
          )}

          {dispatchMode === 'pool' && (
            <Button size="sm" onClick={broadcastToPool} disabled={poolActive || matching === 0} loading={poolActive}>
              📡 Broadcast to {plumbers.filter(p => p.available).length} Available Plumbers
            </Button>
          )}

          {dispatchMode === 'manual' && (
            <span className="text-xs text-slate-400">
              Click a matching lead, then select a plumber to assign
            </span>
          )}
        </div>

        {/* Round-Robin Config */}
        {showRRConfig && dispatchMode === 'round-robin' && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Round-Robin Setup</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rrConfig.map((config, ci) => (
                <div key={ci} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    ZIP Prefix: <span className="text-blue-600 font-mono">{config.zipGroupPrefix}***</span>
                  </p>
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Rotation Order</p>
                    {config.rotationOrder.map((pid, ri) => {
                      const plumber = plumbers.find(p => p.id === pid);
                      return (
                        <div key={ri} className="flex items-center gap-2 text-xs">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                            {ri + 1}
                          </span>
                          <span className="text-slate-700">{plumber?.name || pid}</span>
                          {!plumber?.available && (
                            <span className="text-[10px] text-amber-500">(paused)</span>
                          )}
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {plumber?.serviceZips.join(', ')} pref
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">
                    Next up: #{((rrRotationIndex[config.zipGroupPrefix] || 0) % config.rotationOrder.length) + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Total Revenue</p>
          <p className="text-lg font-bold text-blue-600">${revenue.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-purple-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Matching</p>
          <p className="text-lg font-bold text-purple-600">{matching}</p>
        </div>
        <div className="rounded-lg bg-green-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Assigned</p>
          <p className="text-lg font-bold text-emerald-600">{leads.filter(l => l.status === 'assigned').length}</p>
        </div>
        <div className="rounded-lg hover:bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Completed</p>
          <p className="text-lg font-bold text-slate-400">{leads.filter(l => l.status === 'complete').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'matching', 'assigned', 'en_route', 'arrived', 'complete', 'unfulfilled', 'refunded'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border border-slate-200">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="hover:bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Customer</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Photo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Estimate</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Location</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Deposit</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Plumber</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(lead => (
              <tr
                key={lead.id}
                className={`hover:bg-slate-50 transition-colors ${
                  selectedLead === lead.id ? 'bg-blue-50 ring-2 ring-blue-200' : ''
                }`}
              >
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
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {lead.status === 'en_route' ? 'En Route' : lead.status.charAt(0).toUpperCase() + lead.status.slice(1).replace('_', ' ')}
                  </span>
                  {lead.timeToMatch && <span className="block text-[10px] text-slate-400 mt-0.5">Matched in {lead.timeToMatch}</span>}
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {lead.assignedPlumber || <span className="text-amber-500">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {lead.status === 'matching' && dispatchMode === 'manual' && (
                      <button
                        onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        {selectedLead === lead.id ? 'Cancel' : 'Assign'}
                      </button>
                    )}
                    {lead.status === 'unfulfilled' && (
                      <span className="text-xs text-red-500 font-medium">⚠️ No plumber found</span>
                    )}
                  </div>

                  {/* Manual Assign Dropdown */}
                  {selectedLead === lead.id && dispatchMode === 'manual' && (
                    <div className="mt-2 p-2 bg-white border border-blue-200 rounded-lg shadow-lg space-y-1 min-w-[200px]">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase px-1 mb-1">Available Plumbers</p>
                      {plumbers
                        .filter(p => p.available && p.serviceZips.some(z => lead.zip.startsWith(z)))
                        .map(p => (
                          <button
                            key={p.id}
                            onClick={() => assignLead(lead.id, p.id)}
                            className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-blue-50 flex items-center justify-between group"
                          >
                            <span className="font-medium text-slate-700">{p.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-amber-500">⭐{p.rating}</span>
                              <span className="text-[10px] text-slate-400">{p.jobsCompleted} jobs</span>
                              <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 font-semibold">→</span>
                            </div>
                          </button>
                        ))}
                      {plumbers.filter(p => p.available && p.serviceZips.some(z => lead.zip.startsWith(z))).length === 0 && (
                        <p className="text-[10px] text-amber-500 px-1">No available plumbers in this area</p>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => rejectLead(lead.id)}
                          className="w-full text-left px-2 py-1.5 rounded-md text-xs text-red-500 hover:bg-red-50"
                        >
                          ✕ Mark unfulfilled
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
