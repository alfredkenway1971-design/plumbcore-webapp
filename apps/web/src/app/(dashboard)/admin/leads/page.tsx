'use client';

import { useState, useMemo } from 'react';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import { DEPOSIT_TIERS } from '@/lib/plan-pricing';
import {
  Search, X, ChevronUp, ChevronDown, Plus, Settings, Phone,
  MapPin, DollarSign, Star, Clock, CheckCircle, AlertCircle,
  User, Camera, Filter, ArrowUpDown, Eye, ListOrdered
} from 'lucide-react';

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
  phone?: string;
  diagnosis?: string;
  address?: string;
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
  distance?: string;
  plan?: string;
  acceptanceRate?: string;
  responseTime?: string;
  jobsToday?: number;
}

/* ── Mock Data ── */
const mockLeads: Lead[] = [
  {
    id: 'LD-001', customer: 'John Smith', photo: '📸', estimate: 850,
    depositAmount: 49, depositTier: 'small', location: 'Austin, TX 78701',
    zip: '78701', depositPaid: true, status: 'matching', assignedPlumber: '',
    date: '2026-07-14', confidence: 95,
    phone: '(512) 555-0101', diagnosis: 'Kitchen sink clogged — requires drain snake and full inspection',
    address: '1200 Elm St, Austin, TX 78701',
  },
  {
    id: 'LD-002', customer: 'Maria Garcia', photo: '📸', estimate: 1200,
    depositAmount: 99, depositTier: 'medium', location: 'Round Rock, TX 78664',
    zip: '78664', depositPaid: true, status: 'assigned', assignedPlumber: 'James Wilson',
    date: '2026-07-14', timeToMatch: '3m 12s',
    phone: '(512) 555-0202', diagnosis: 'Water heater leaking — needs replacement estimate',
    address: '4500 Lake Creek Dr, Round Rock, TX 78664',
  },
  {
    id: 'LD-003', customer: 'David Chen', photo: '📸', estimate: 450,
    depositAmount: 49, depositTier: 'small', location: 'Cedar Park, TX 78613',
    zip: '78613', depositPaid: true, status: 'assigned', assignedPlumber: 'Sarah Blake',
    date: '2026-07-13', timeToMatch: '1m 45s',
    phone: '(512) 555-0303', diagnosis: 'Toilet running constantly — replace flapper assembly',
    address: '890 Park View Blvd, Cedar Park, TX 78613',
  },
  {
    id: 'LD-004', customer: 'Sarah Johnson', photo: '📸', estimate: 2200,
    depositAmount: 199, depositTier: 'premium', location: 'Austin, TX 78702',
    zip: '78702', depositPaid: true, status: 'complete', assignedPlumber: 'Mike Torres',
    date: '2026-07-12', timeToMatch: '2m 30s',
    phone: '(737) 555-0404', diagnosis: 'Sewer line backup — full hydro-jetting and camera inspection',
    address: '3200 Manor Rd, Austin, TX 78702',
  },
  {
    id: 'LD-005', customer: 'Robert Davis', photo: '📸', estimate: 600,
    depositAmount: 49, depositTier: 'small', location: 'Pflugerville, TX 78660',
    zip: '78660', depositPaid: true, status: 'unfulfilled', assignedPlumber: '',
    date: '2026-07-11',
    phone: '(512) 555-0505', diagnosis: 'Outdoor faucet burst — pipe replacement needed',
    address: '5500 Pecan St, Pflugerville, TX 78660',
  },
  {
    id: 'LD-006', customer: 'Emily White', photo: '📸', estimate: 1800,
    depositAmount: 149, depositTier: 'large', location: 'Austin, TX 78704',
    zip: '78704', depositPaid: true, status: 'matching', assignedPlumber: '',
    date: '2026-07-15', confidence: 88,
    phone: '(512) 555-0606', diagnosis: 'Gas line odor detected — emergency shut-off and inspection',
    address: '2100 S Congress Ave, Austin, TX 78704',
  },
  {
    id: 'LD-007', customer: 'Tom Brown', photo: '📸', estimate: 350,
    depositAmount: 49, depositTier: 'small', location: 'Round Rock, TX 78665',
    zip: '78665', depositPaid: true, status: 'matching', assignedPlumber: '',
    date: '2026-07-15', confidence: 92,
    phone: '(512) 555-0707', diagnosis: 'Shower low pressure — valve cartridge replacement',
    address: '7800 Sam Bass Rd, Round Rock, TX 78665',
  },
];

const mockPlumbers: Plumber[] = [
  {
    id: 'P-001', name: 'James Wilson', specialties: ['Drain Cleaning', 'Water Heaters'],
    rating: 4.8, jobsCompleted: 342, available: true, serviceZips: ['787', '786'],
    rotationOrder: 1, distance: '2.3 mi', plan: 'Premium', acceptanceRate: '98%',
    responseTime: '<3 min', jobsToday: 3,
  },
  {
    id: 'P-002', name: 'Mike Torres', specialties: ['Sewer Lines', 'Gas Lines'],
    rating: 4.9, jobsCompleted: 521, available: true, serviceZips: ['787', '786'],
    rotationOrder: 2, distance: '4.1 mi', plan: 'Premium', acceptanceRate: '96%',
    responseTime: '<5 min', jobsToday: 2,
  },
  {
    id: 'P-003', name: 'Sarah Blake', specialties: ['Kitchen Plumbing', 'Water Heaters'],
    rating: 4.7, jobsCompleted: 198, available: true, serviceZips: ['786'],
    rotationOrder: 3, distance: '1.8 mi', plan: 'Standard', acceptanceRate: '92%',
    responseTime: '<4 min', jobsToday: 1,
  },
  {
    id: 'P-004', name: 'Alex Rivera', specialties: ['General Plumbing', 'Gas Lines'],
    rating: 4.5, jobsCompleted: 76, available: false, serviceZips: ['787'],
    rotationOrder: 4, distance: '5.6 mi', plan: 'Standard', acceptanceRate: '85%',
    responseTime: '<10 min', jobsToday: 0,
  },
  {
    id: 'P-005', name: 'Jenny Park', specialties: ['Drain Cleaning', 'Water Heaters', 'Sewer'],
    rating: 4.9, jobsCompleted: 267, available: true, serviceZips: ['787', '786'],
    rotationOrder: 5, distance: '3.5 mi', plan: 'Premium', acceptanceRate: '97%',
    responseTime: '<3 min', jobsToday: 4,
  },
];

/* ── Round-Robin Config ── */
interface RoundRobinConfig {
  zipGroupPrefix: string;
  rotationOrder: string[];  // plumber IDs in order
}

type QuickFilter = 'all' | 'today' | 'us' | 'canada' | '49' | '99' | '149+';

/* ── Component ── */
export default function LeadsMarketplacePage() {
  const [leads, setLeads] = useState(mockLeads);
  const [plumbers] = useState(mockPlumbers);
  const [filter, setFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>('manual');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalLeadId, setModalLeadId] = useState<string | null>(null);
  const [selectedPlumberId, setSelectedPlumberId] = useState<string | null>(null);

  // Round-Robin Config State
  const [showRRConfig, setShowRRConfig] = useState(false);
  const [rrConfig, setRrConfig] = useState<RoundRobinConfig[]>([
    { zipGroupPrefix: '787', rotationOrder: ['P-001', 'P-002', 'P-005', 'P-003', 'P-004'] },
    { zipGroupPrefix: '786', rotationOrder: ['P-003', 'P-002', 'P-001', 'P-005'] },
  ]);
  const [rrRotationIndex, setRrRotationIndex] = useState<Record<string, number>>({ '787': 0, '786': 0 });

  // RR settings
  const [maxLeadsPerDay, setMaxLeadsPerDay] = useState(10);
  const [skipUnresponsive, setSkipUnresponsive] = useState(true);
  const [prioritizeHigherTier, setPrioritizeHigherTier] = useState(false);

  // Pool mode
  const [poolActive, setPoolActive] = useState(false);

  /* ── Derived Data ── */
  const today = new Date().toISOString().slice(0, 10);

  const filteredByStatus = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  const filteredLeads = useMemo(() => {
    let result = filteredByStatus;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.customer.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        l.location.toLowerCase().includes(q) ||
        (l.diagnosis || '').toLowerCase().includes(q)
      );
    }

    // Quick filter
    switch (quickFilter) {
      case 'today':
        result = result.filter(l => l.date === today);
        break;
      case 'us':
        result = result.filter(l => l.zip.startsWith('7'));
        break;
      case 'canada':
        result = result.filter(l => !l.zip.startsWith('7'));
        break;
      case '49':
        result = result.filter(l => l.depositAmount === 49);
        break;
      case '99':
        result = result.filter(l => l.depositAmount === 99);
        break;
      case '149+':
        result = result.filter(l => l.depositAmount >= 149);
        break;
    }

    return result;
  }, [filteredByStatus, searchQuery, quickFilter, today]);

  const revenue = leads.filter(l => l.status !== 'unfulfilled' && l.status !== 'refunded').reduce((s, l) => s + l.estimate, 0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalDeposits = leads.filter(l => l.status !== 'unfulfilled' && l.status !== 'refunded').reduce((s, l) => s + l.depositAmount, 0);
  const matching = leads.filter(l => l.status === 'matching').length;

  const modalLead = modalLeadId ? leads.find(l => l.id === modalLeadId) : null;
  const availablePlumbersForLead = plumbers.filter(p => {
    if (!p.available) return false;
    if (!modalLead) return true;
    return p.serviceZips.some(z => modalLead.zip.startsWith(z));
  });

  /* ── Dispatch Handlers ── */

  const assignLead = (id: string, plumberId: string) => {
    const plumber = plumbers.find(p => p.id === plumberId);
    if (!plumber) return;
    setLeads(prev => prev.map(l =>
      l.id === id ? { ...l, status: 'assigned' as const, assignedPlumber: plumber.name, timeToMatch: 'Now' } : l
    ));
    setSelectedLead(null);
    setAssigningTo(null);
    setShowAssignModal(false);
    setModalLeadId(null);
    setSelectedPlumberId(null);
  };

  const rejectLead = (id: string) => {
    setLeads(prev => prev.map((l): Lead =>
      l.id === id ? { ...l, status: 'unfulfilled' } : l
    ));
    setSelectedLead(null);
    setShowAssignModal(false);
    setModalLeadId(null);
  };

  const autoFindBestMatch = () => {
    if (!modalLead) return;
    const best = availablePlumbersForLead.sort((a, b) => b.rating - a.rating)[0];
    if (best) {
      setSelectedPlumberId(best.id);
    }
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

  /* ── RR Config Handlers ── */

  const reorderPlumber = (configIdx: number, plumberIdx: number, direction: 'up' | 'down') => {
    setRrConfig(prev => {
      const updated = [...prev];
      const config = { ...updated[configIdx] };
      const order = [...config.rotationOrder];
      const swapIdx = direction === 'up' ? plumberIdx - 1 : plumberIdx + 1;
      if (swapIdx < 0 || swapIdx >= order.length) return prev;
      [order[plumberIdx], order[swapIdx]] = [order[swapIdx], order[plumberIdx]];
      config.rotationOrder = order;
      updated[configIdx] = config;
      return updated;
    });
  };

  const removePlumberFromZone = (configIdx: number, plumberIdx: number) => {
    setRrConfig(prev => {
      const updated = [...prev];
      const config = { ...updated[configIdx] };
      config.rotationOrder = config.rotationOrder.filter((_, i) => i !== plumberIdx);
      updated[configIdx] = config;
      return updated;
    });
  };

  const openAssignModal = (leadId: string) => {
    setModalLeadId(leadId);
    setSelectedPlumberId(null);
    setShowAssignModal(true);
  };

  /* ── Status Badge Helper ── */
  const statusBadge = (status: Lead['status']) => {
    const styles: Record<string, string> = {
      matching: 'bg-purple-50 text-purple-700 border-purple-200',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200',
      en_route: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      arrived: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      complete: 'bg-green-50 text-green-700 border-green-200',
      unfulfilled: 'bg-red-50 text-red-700 border-red-200',
      refunded: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    const labels: Record<string, string> = {
      matching: 'NEW',
      assigned: 'Assigned',
      en_route: 'En Route',
      arrived: 'Arrived',
      complete: 'Complete',
      unfulfilled: 'Unfulfilled',
      refunded: 'Refunded',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[status] || styles.matching}`}>
        {status === 'matching' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
        {status === 'assigned' && <CheckCircle className="w-2.5 h-2.5" />}
        {status === 'complete' && <CheckCircle className="w-2.5 h-2.5" />}
        {labels[status] || status}
      </span>
    );
  };

  /* ── Deposit Badge Helper ── */
  const depositBadge = (amount: number) => {
    const color = amount >= 149 ? 'bg-amber-50 text-amber-700 border-amber-200'
      : amount >= 99 ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-slate-50 text-slate-600 border-slate-200';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${color}`}>
        <DollarSign className="w-3 h-3" />
        {amount}
      </span>
    );
  };

  /* ── Render ── */
  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Leads Marketplace</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage homeowner quotes and dispatch to plumbers</p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Card padding="md" variant="bordered">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, phone, location, or diagnosis..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: 'all' as QuickFilter, label: 'All Leads', icon: null },
              { key: 'today' as QuickFilter, label: 'Today', icon: null },
              { key: 'us' as QuickFilter, label: 'US', icon: null },
              { key: 'canada' as QuickFilter, label: 'Canada', icon: null },
              { key: '49' as QuickFilter, label: '$49', icon: null },
              { key: '99' as QuickFilter, label: '$99', icon: null },
              { key: '149+' as QuickFilter, label: '$149+', icon: null },
            ] as const).map(qf => (
              <button
                key={qf.key}
                onClick={() => setQuickFilter(qf.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  quickFilter === qf.key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-slate-700'
                }`}
              >
                {qf.label}
              </button>
            ))}

            {/* Status filter dropdown-style */}
            <div className="w-px h-6 bg-slate-200 self-center mx-1" />

            {['matching', 'assigned', 'en_route', 'arrived', 'complete', 'unfulfilled', 'refunded'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(filter === f ? 'all' : f)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                  filter === f
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Dispatch Mode Selector ── */}
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
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                {showRRConfig ? 'Hide Config' : 'Config'}
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
      </Card>

      {/* ── Stats ── */}
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

      {/* ── Lead Cards ── */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No leads match your filters</p>
            <button
              onClick={() => { setQuickFilter('all'); setFilter('all'); setSearchQuery(''); }}
              className="text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <Card key={lead.id} padding="md" variant="bordered" className={`hover:shadow-sm transition-shadow ${selectedLead === lead.id ? 'ring-2 ring-blue-300' : ''}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">
                    {lead.photo || '📸'}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Row 1: Name + Status + Deposit */}
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{lead.customer}</h3>
                    {statusBadge(lead.status)}
                    {depositBadge(lead.depositAmount)}
                    {lead.confidence && (
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">
                        {lead.confidence}% match confidence
                      </span>
                    )}
                  </div>

                  {/* Row 2: Diagnosis */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lead.diagnosis || 'No diagnosis provided'}
                  </p>

                  {/* Row 3: Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lead.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${lead.estimate.toLocaleString()} est.
                    </span>
                    {lead.assignedPlumber && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <User className="w-3 h-3" />
                        {lead.assignedPlumber}
                      </span>
                    )}
                    {lead.timeToMatch && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lead.timeToMatch}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-stretch gap-2 sm:min-w-[140px]">
                  {lead.status === 'matching' && (
                    <>
                      <button
                        onClick={() => openAssignModal(lead.id)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        Assign
                      </button>
                      <button
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                      <button
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                        Round-Robin
                      </button>
                    </>
                  )}
                  {lead.status === 'unfulfilled' && (
                    <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium px-2 py-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      No plumber found
                    </span>
                  )}
                  {lead.status === 'assigned' && (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium px-2 py-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {lead.assignedPlumber}
                    </span>
                  )}
                  {lead.status === 'complete' && (
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium px-2 py-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Complete
                    </span>
                  )}
                  {(lead.status === 'en_route' || lead.status === 'arrived') && (
                    <span className="flex items-center gap-1.5 text-xs text-cyan-600 font-medium px-2 py-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lead.status === 'en_route' ? 'En Route' : 'Arrived'}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* ── Round-Robin Config Section ── */}
      {showRRConfig && dispatchMode === 'round-robin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              Round-Robin Configuration
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              {rrConfig.reduce((sum, c) => sum + c.rotationOrder.length, 0)} plumbers across {rrConfig.length} zones
            </span>
          </div>

          {/* Zone Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rrConfig.map((config, ci) => (
              <Card key={ci} padding="md" variant="bordered" className="bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">ZIP Prefix:</span>
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {config.zipGroupPrefix}***
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {config.rotationOrder.length} plumber{config.rotationOrder.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Plumber list */}
                <div className="space-y-1.5">
                  {config.rotationOrder.map((pid, ri) => {
                    const plumber = plumbers.find(p => p.id === pid);
                    return (
                      <div
                        key={ri}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                      >
                        {/* Order */}
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {ri + 1}
                        </span>

                        {/* Plumber info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-800 truncate">
                              {plumber?.name || pid}
                            </span>
                            {plumber && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {plumber.rating}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            {plumber && (
                              <>
                                <span>{plumber.jobsToday || 0} jobs today</span>
                                <span>•</span>
                                <span>{plumber.jobsCompleted} total</span>
                              </>
                            )}
                            {!plumber?.available && (
                              <span className="text-amber-500 font-medium">(paused)</span>
                            )}
                          </div>
                        </div>

                        {/* Reorder / Remove */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => reorderPlumber(ci, ri, 'up')}
                            disabled={ri === 0}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => reorderPlumber(ci, ri, 'down')}
                            disabled={ri === config.rotationOrder.length - 1}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removePlumberFromZone(ci, ri)}
                            className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Plumber */}
                <button className="w-full mt-3 py-2.5 rounded-lg border-2 border-dashed border-slate-200 text-xs font-medium text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Plumber to Zone
                </button>

                {/* Next up */}
                <div className="mt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  Next up: #{((rrRotationIndex[config.zipGroupPrefix] || 0) % config.rotationOrder.length) + 1} —{' '}
                  {plumbers.find(p => p.id === config.rotationOrder[(rrRotationIndex[config.zipGroupPrefix] || 0) % config.rotationOrder.length])?.name || '—'}
                </div>
              </Card>
            ))}
          </div>

          {/* Settings */}
          <Card padding="md" variant="bordered" className="bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settings</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              {/* Max leads per day */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-600 font-medium whitespace-nowrap">
                  Max leads / plumber / day
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setMaxLeadsPerDay(Math.max(1, maxLeadsPerDay - 1))}
                    className="px-2 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs"
                  >
                    −
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-slate-800 min-w-[2rem] text-center border-x border-slate-200">
                    {maxLeadsPerDay}
                  </span>
                  <button
                    onClick={() => setMaxLeadsPerDay(Math.min(50, maxLeadsPerDay + 1))}
                    className="px-2 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="w-px h-6 bg-slate-200 hidden sm:block" />

              {/* Skip unresponsive */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={skipUnresponsive}
                    onChange={e => setSkipUnresponsive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${skipUnresponsive ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-xs text-slate-600 font-medium">Skip unresponsive plumbers</span>
              </label>

              <div className="w-px h-6 bg-slate-200 hidden sm:block" />

              {/* Prioritize higher-tier */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={prioritizeHigherTier}
                    onChange={e => setPrioritizeHigherTier(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${prioritizeHigherTier ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-xs text-slate-600 font-medium">Prioritize higher-tier plans</span>
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* ── Assign Modal ── */}
      {showAssignModal && modalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowAssignModal(false); setModalLeadId(null); }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Assign Lead</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {modalLead.id} — {modalLead.customer}
                </p>
              </div>
              <button
                onClick={() => { setShowAssignModal(false); setModalLeadId(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lead Summary */}
            <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {modalLead.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-slate-400" />
                  ${modalLead.estimate.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  Deposit: ${modalLead.depositAmount}
                </span>
              </div>
              {modalLead.diagnosis && (
                <p className="text-[11px] text-slate-500 mt-1.5 italic leading-relaxed">
                  &ldquo;{modalLead.diagnosis}&rdquo;
                </p>
              )}
            </div>

            {/* Plumber List */}
            <div className="px-5 py-3 max-h-[340px] overflow-y-auto space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Available Plumbers ({availablePlumbersForLead.length})
              </p>

              {availablePlumbersForLead.length === 0 ? (
                <p className="text-xs text-amber-500 py-4 text-center">No available plumbers in this area</p>
              ) : (
                availablePlumbersForLead.map(p => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedPlumberId === p.id
                        ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {/* Radio */}
                    <input
                      type="radio"
                      name="plumber-select"
                      checked={selectedPlumberId === p.id}
                      onChange={() => setSelectedPlumberId(p.id)}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />

                    {/* Plumber info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{p.name}</span>
                        <span className="flex items-center gap-0.5 text-[11px] text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          {p.rating}
                        </span>
                        {p.plan && (
                          <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            p.plan === 'Premium' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {p.plan}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                        <span>{p.distance || '—'}</span>
                        <span>✅ {p.acceptanceRate || '—'} accept</span>
                        <span>⚡ {p.responseTime || '—'}</span>
                        <span className={p.available ? 'text-green-600' : 'text-red-500'}>
                          {p.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={autoFindBestMatch}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                🤖 Auto-Pick Best Match
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowAssignModal(false); setModalLeadId(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedPlumberId && assignLead(modalLead.id, selectedPlumberId)}
                  disabled={!selectedPlumberId}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Assign Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
