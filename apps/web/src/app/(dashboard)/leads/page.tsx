'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, StatusBadge, EmptyState, ErrorState, Modal } from '@/pkg/ui-components';

/* ── Types ── */
type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

interface Lead {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  issueDescription: string;
  aiDetectedProblem: string;
  suggestedParts: string[];
  laborEstimate: string;
  partsEstimate: string;
  totalEstimate: string;
  status: LeadStatus;
  photos: string[];
  createdAt: string;
}

/* ── Mock Leads ── */
const MOCK_LEADS: Lead[] = [
  {
    id: 'LEAD-001',
    customerName: 'Sarah Mitchell',
    phone: '(512) 555-0142',
    email: 'sarah.mitchell@email.com',
    issueDescription: 'Water is pooling under my kitchen sink. I noticed it this morning when I reached for a cleaning spray. The cabinet floor is wet and I think water is dripping from the pipe joint.',
    aiDetectedProblem: 'Leaking pipe joint under kitchen sink — likely a loose slip nut or failed compression ring on the P-trap connection.',
    suggestedParts: ['PVC P-trap kit (1.5")', 'Compression ring assortment', 'Plumber\'s tape', 'Silicone sealant'],
    laborEstimate: '$85–150',
    partsEstimate: '$15–40',
    totalEstimate: '$100–190',
    status: 'new',
    photos: ['https://placehold.co/400x300/3b82f6/ffffff?text=Leak'],
    createdAt: '2026-06-30T09:15:00Z',
  },
  {
    id: 'LEAD-002',
    customerName: 'Mike Rodriguez',
    phone: '(512) 555-0187',
    email: 'mike.r@email.com',
    issueDescription: 'My toilet keeps running after flushing. I have to jiggle the handle to make it stop. It has been getting worse over the past week and is wasting a lot of water.',
    aiDetectedProblem: 'Worn flapper valve / misaligned fill tube — common toilet tank issue causing continuous water flow into overflow tube.',
    suggestedParts: ['Universal flapper (2" or 3")', 'Fluidmaster fill valve kit', 'Handle & rod assembly'],
    laborEstimate: '$55–95',
    partsEstimate: '$10–25',
    totalEstimate: '$65–120',
    status: 'new',
    photos: [],
    createdAt: '2026-06-30T10:30:00Z',
  },
  {
    id: 'LEAD-003',
    customerName: 'Emily Chen',
    phone: '(512) 555-0219',
    email: 'emily.chen@email.com',
    issueDescription: 'The water pressure in my shower has dropped significantly. It used to be great but now it barely trickles out. The other faucets in the house seem fine. I think the showerhead might be clogged.',
    aiDetectedProblem: 'Mineral buildup in showerhead / possible clogged shower valve cartridge — reduced flow isolated to single fixture suggests localized blockage.',
    suggestedParts: ['High-pressure showerhead', 'Shower valve cartridge (brand-specific)', 'CLR / descaling solution', 'Thread seal tape'],
    laborEstimate: '$65–130',
    partsEstimate: '$15–55',
    totalEstimate: '$80–185',
    status: 'contacted',
    photos: ['https://placehold.co/400x300/f59e0b/ffffff?text=Shower'],
    createdAt: '2026-06-29T14:20:00Z',
  },
  {
    id: 'LEAD-004',
    customerName: 'James Wilson',
    phone: '(512) 555-0334',
    email: 'jwilson@email.com',
    issueDescription: 'My basement floor drain is backing up when I run the washing machine. There is standing water and it smells bad. I think the main sewer line might be clogged.',
    aiDetectedProblem: 'Main sewer line blockage — washing machine discharge causing backup at floor drain indicates obstruction past the branch connection.',
    suggestedParts: ['Sewer cable (3/4" x 100ft)', 'Hydro jetting service', 'Camera inspection', 'Cleanout cap'],
    laborEstimate: '$150–350',
    partsEstimate: '$30–80',
    totalEstimate: '$180–430',
    status: 'contacted',
    photos: ['https://placehold.co/400x300/ef4444/ffffff?text=Backup'],
    createdAt: '2026-06-29T08:45:00Z',
  },
  {
    id: 'LEAD-005',
    customerName: 'Patricia Moore',
    phone: '(512) 555-0467',
    email: 'pmoore@email.com',
    issueDescription: 'There is a water stain on my living room ceiling directly under the upstairs bathroom. It grows when someone takes a shower. I am worried the ceiling might collapse.',
    aiDetectedProblem: 'Active slab leak or drain pipe leak in ceiling cavity — moisture staining indicates prolonged leak from bathroom drain or supply line above.',
    suggestedParts: ['Pipe repair coupling', 'Drywall repair kit', 'Leak detection dye', 'Moisture meter'],
    laborEstimate: '$120–280',
    partsEstimate: '$20–65',
    totalEstimate: '$140–345',
    status: 'converted',
    photos: ['https://placehold.co/400x300/10b981/ffffff?text=Stain'],
    createdAt: '2026-06-28T16:10:00Z',
  },
  {
    id: 'LEAD-006',
    customerName: 'David Kim',
    phone: '(512) 555-0591',
    email: 'dkim@email.com',
    issueDescription: 'My gas water heater is making loud popping noises and the water is not getting as hot as it used to. It is about 8 years old.',
    aiDetectedProblem: 'Sediment buildup in water heater tank — popping sounds indicate trapped moisture under sediment layer; reduced heating efficiency.',
    suggestedParts: ['Water heater flush kit', 'Anode rod (replace if depleted)', 'Sediment screen'],
    laborEstimate: '$100–200',
    partsEstimate: '$25–60',
    totalEstimate: '$125–260',
    status: 'archived',
    photos: [],
    createdAt: '2026-06-27T11:30:00Z',
  },
];

/* ── Status Badge Map ── */
const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-status-info/15 text-blue-600 border-status-info/20' },
  contacted: { label: 'Contacted', color: 'bg-accent-amber/15 text-amber-600 border-accent-amber/20' },
  converted: { label: 'Converted', color: 'bg-green-500/15 text-green-600 border-status-success/20' },
  archived: { label: 'Archived', color: 'bg-steel/15 text-gray-400 border-steel/20' },
};

/* ── Helpers ── */
function formatCurrencyLabel(s: string) {
  return s;
}

function formatDateTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/* ── Lead Row Skeleton ── */
function LeadRowSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="h-4 w-16 rounded bg-gray-50" />
          <div className="h-4 w-28 rounded bg-gray-50" />
          <div className="h-4 w-24 rounded bg-gray-50 hidden sm:block" />
          <div className="h-4 w-32 rounded bg-gray-50 hidden md:block" />
          <div className="h-4 w-40 rounded bg-gray-50 hidden lg:block" />
          <div className="h-4 w-20 rounded bg-gray-50" />
          <div className="h-4 w-12 rounded bg-gray-50" />
          <div className="h-4 w-8 rounded bg-gray-50" />
        </div>
      ))}
    </div>
  );
}

/* ── Expanded Detail Panel ── */
function LeadDetailPanel({
  lead,
  onMarkContacted,
  onConvertToJob,
  onArchive,
}: {
  lead: Lead;
  onMarkContacted: () => void;
  onConvertToJob: () => void;
  onArchive: () => void;
}) {
  const [adjLabor, setAdjLabor] = useState(lead.laborEstimate);
  const [adjParts, setAdjParts] = useState(lead.partsEstimate);
  const [converting, setConverting] = useState(false);

  const totalEstimate = useMemo(() => {
    const laborNum = parseInt(adjLabor.replace(/[^0-9]/g, '')) || 0;
    const partsNum = parseInt(adjParts.replace(/[^0-9]/g, '')) || 0;
    return `$${laborNum + partsNum}`;
  }, [adjLabor, adjParts]);

  const handleConvert = () => {
    setConverting(true);
    setTimeout(() => {
      setConverting(false);
      onConvertToJob();
    }, 1000);
  };

  return (
    <div className="border-t border-gray-200 bg-whiteer/50 px-4 sm:px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Customer Info & Analysis */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issue Description</p>
            <p className="text-sm text-gray-900">{lead.issueDescription}</p>
          </div>
          <div className="rounded-xl bg-electric/5 border border-electric/20 p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">AI Analysis</p>
            <p className="text-sm text-blue-600 font-medium">{lead.aiDetectedProblem}</p>
            {lead.suggestedParts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lead.suggestedParts.map((part, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-whiteer text-gray-400 border border-gray-200">
                    {part}
                  </span>
                ))}
              </div>
            )}
          </div>
          {lead.photos.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Photos</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {lead.photos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Lead photo ${i + 1}`}
                    className="h-20 w-28 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Adjust Estimate & Actions */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Adjust Estimate</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Labor $</label>
                <input
                  value={adjLabor}
                  onChange={(e) => setAdjLabor(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-whiteer px-3 py-2 text-sm text-gray-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Parts $</label>
                <input
                  value={adjParts}
                  onChange={(e) => setAdjParts(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-whiteer px-3 py-2 text-sm text-gray-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-base font-bold text-blue-600">{totalEstimate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {lead.status === 'new' && (
              <Button variant="secondary" size="sm" onClick={onMarkContacted}>
                Mark Contacted
              </Button>
            )}
            {(lead.status === 'new' || lead.status === 'contacted') && (
              <Button variant="primary" size="sm" loading={converting} onClick={handleConvert}>
                Convert to Job
              </Button>
            )}
            {lead.status !== 'archived' && (
              <Button variant="ghost" size="sm" onClick={onArchive}>
                Archive
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function LeadsPage() {
  const router = useRouter();

  /* ── State ── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filterTab, setFilterTab] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── Load ── */
  useEffect(() => {
    const t = setTimeout(() => {
      setLeads([...MOCK_LEADS]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLeads([...MOCK_LEADS]);
      setLoading(false);
    }, 500);
  };

  /* ── Filtered & Searched ── */
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (filterTab !== 'all') {
      result = result.filter((l) => l.status === filterTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.customerName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          l.issueDescription.toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, filterTab, searchQuery]);

  const leadCounts = useMemo(() => {
    return {
      all: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      contacted: leads.filter((l) => l.status === 'contacted').length,
      converted: leads.filter((l) => l.status === 'converted').length,
      archived: leads.filter((l) => l.status === 'archived').length,
    };
  }, [leads]);

  /* ── Actions ── */
  const handleMarkContacted = useCallback((leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'contacted' as LeadStatus } : l))
    );
  }, []);

  const handleConvertToJob = useCallback((leadId: string) => {
    // Find the lead, create a mock job ID, and redirect
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'converted' as LeadStatus } : l))
    );

    const newJobId = 'JOB-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/jobs/${newJobId}`);
  }, [leads, router]);

  const handleArchive = useCallback((leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'archived' as LeadStatus } : l))
    );
    setExpandedId((prev) => (prev === leadId ? null : prev));
  }, []);

  const toggleExpand = (leadId: string) => {
    setExpandedId((prev) => (prev === leadId ? null : leadId));
  };

  /* ── Render ── */

  // Error State
  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load leads" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lead Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          {leadCounts.all} lead{leadCounts.all !== 1 ? 's' : ''} captured
          {filterTab !== 'all' && ` · ${leadCounts[filterTab]} ${filterTab}`}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="h-5 w-32 rounded bg-gray-50" />
          </div>
          <LeadRowSkeleton />
        </Card>
      )}

      {!loading && (
        <>
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 flex-wrap">
              {(['all', 'new', 'contacted', 'converted', 'archived'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setFilterTab(tab); setExpandedId(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                    filterTab === tab
                      ? 'bg-electric/15 text-blue-600'
                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                  <span className="ml-1.5 opacity-60">({leadCounts[tab]})</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto w-full sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads..."
                className="w-full rounded-lg border border-white/10 bg-whiteer pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-steel/50 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
              />
            </div>
          </div>

          {/* Table */}
          {filteredLeads.length === 0 ? (
            <Card variant="default" padding="lg">
              <EmptyState
                title="No leads yet"
                description="Your AI chat widget will capture new leads here. Configure it in the AI Chat section."
                icon={
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                }
              />
            </Card>
          ) : (
            <Card variant="default" padding="none" className="overflow-hidden">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-8 gap-2 px-4 sm:px-6 py-3 border-b border-gray-200 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <span>Lead ID</span>
                <span className="col-span-1">Customer</span>
                <span className="col-span-1 hidden sm:block">Phone</span>
                <span className="col-span-1 hidden md:block">Email</span>
                <span className="col-span-2 hidden lg:block">Issue</span>
                <span className="col-span-1">Estimate</span>
                <span className="col-span-1">Status</span>
                <span className="col-span-1">Created</span>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-white-border">
                {filteredLeads.map((lead) => {
                  const isExpanded = expandedId === lead.id;
                  const statusCfg = STATUS_CONFIG[lead.status];
                  return (
                    <div key={lead.id}>
                      {/* Row */}
                      <button
                        onClick={() => toggleExpand(lead.id)}
                        className="w-full text-left grid grid-cols-1 sm:grid-cols-8 gap-2 px-4 sm:px-6 py-3 hover:bg-gray-50 transition-colors items-center"
                      >
                        {/* Lead ID */}
                        <span className="text-xs font-mono font-semibold text-blue-600">{lead.id}</span>

                        {/* Customer Name */}
                        <span className="text-sm font-medium text-gray-900 truncate">{lead.customerName}</span>

                        {/* Phone */}
                        <span className="text-xs text-gray-400 hidden sm:block">{lead.phone}</span>

                        {/* Email */}
                        <span className="text-xs text-gray-500 hidden md:block truncate">{lead.email}</span>

                        {/* Issue */}
                        <span className="text-xs text-gray-400 truncate hidden lg:block">{lead.issueDescription.slice(0, 50)}...</span>

                        {/* Estimate */}
                        <span className="text-xs font-semibold text-gray-900">{lead.totalEstimate}</span>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>

                        {/* Created */}
                        <span className="text-xs text-gray-500">{formatDateTime(lead.createdAt)}</span>
                      </button>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <LeadDetailPanel
                          lead={lead}
                          onMarkContacted={() => handleMarkContacted(lead.id)}
                          onConvertToJob={() => handleConvertToJob(lead.id)}
                          onArchive={() => handleArchive(lead.id)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
