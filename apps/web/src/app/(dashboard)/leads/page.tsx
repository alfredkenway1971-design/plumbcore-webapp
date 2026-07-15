'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import { Clock, MapPin, User, DollarSign, CheckCircle, XCircle, AlertTriangle, Camera } from 'lucide-react';
import { depositDollars, DEPOSIT_TIERS } from '@/lib/plan-pricing';

interface Lead {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  diagnosis: string;
  severity: string;
  total_estimate: number;
  deposit_paid: number;
  deposit_tier: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'refunded';
  accepted_by?: string;
  created_at: string;
  expires_at: string;
  photo_url?: string;
}

const mockLeads: Lead[] = [
  {
    id: 'LEAD-001', customer_name: 'Sarah Johnson', customer_email: 'sarah@email.com',
    customer_phone: '5125550101', customer_address: '123 Main St, Austin, TX 78701',
    diagnosis: 'Leaking water heater — 40 gallon electric', severity: 'high',
    total_estimate: 1250, deposit_paid: 4900, deposit_tier: 'medium', status: 'pending',
    created_at: new Date(Date.now() - 60000).toISOString(),
    expires_at: new Date(Date.now() + 4 * 60000).toISOString(),  // 4 min left
    photo_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=200',
  },
  {
    id: 'LEAD-002', customer_name: 'Mike Torres', customer_email: 'mike@email.com',
    customer_phone: '5125550202', customer_address: '456 Oak Ave, Austin, TX 78702',
    diagnosis: 'Kitchen sink clog — needs snaking', severity: 'moderate',
    total_estimate: 350, deposit_paid: 4900, deposit_tier: 'small', status: 'accepted',
    accepted_by: 'comp-001', created_at: '2026-07-10T12:00:00Z',
    expires_at: new Date(Date.now() + 60000).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=200',
  },
  {
    id: 'LEAD-003', customer_name: 'Robert Davis', customer_email: 'robert@email.com',
    customer_phone: '5125550303', customer_address: '789 Elm St, Round Rock, TX 78664',
    diagnosis: 'Gas line test after water heater install', severity: 'low',
    total_estimate: 600, deposit_paid: 4900, deposit_tier: 'small', status: 'pending',
    created_at: new Date(Date.now() - 120000).toISOString(),
    expires_at: new Date(Date.now() + 3 * 60000).toISOString(),  // 3 min left
    photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200',
  },
  {
    id: 'LEAD-004', customer_name: 'Emily White', customer_email: 'emily@email.com',
    customer_phone: '5125550404', customer_address: '321 Pine Rd, Austin, TX 78704',
    diagnosis: 'Sewer line backup — likely tree root intrusion', severity: 'emergency',
    total_estimate: 2400, deposit_paid: 19900, deposit_tier: 'premium', status: 'pending',
    created_at: new Date(Date.now() - 30000).toISOString(),
    expires_at: new Date(Date.now() + 4.5 * 60000).toISOString(),  // 4.5 min left
    photo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200',
  },
];

const sevColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-400', moderate: 'bg-amber-500/10 text-amber-400',
  high: 'bg-orange-500/10 text-orange-400', emergency: 'bg-red-500/10 text-red-400',
};

const declineReasons = [
  { value: 'too_far', label: 'Too far' },
  { value: 'too_busy', label: 'Too busy' },
  { value: 'low_price', label: 'Low price' },
  { value: 'not_my_specialty', label: 'Not my specialty' },
];

const tierColors: Record<string, string> = {
  small: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  large: 'bg-violet-100 text-violet-700',
  premium: 'bg-rose-100 text-rose-700',
};

function countdownSeconds(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

function getUrgencyClass(seconds: number): string {
  if (seconds <= 0) return 'text-red-500 animate-pulse font-bold';
  if (seconds < 60) return 'text-red-500 animate-pulse font-semibold';
  if (seconds < 120) return 'text-orange-400';
  return 'text-amber-400';
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [showDecline, setShowDecline] = useState<string | null>(null);
  const countdownRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    setTimeout(() => { setLeads(mockLeads); setLoading(false); }, 300);
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLeads(prev => prev.map(l => {
        if (l.status !== 'pending') return l;
        const secs = countdownSeconds(l.expires_at);
        if (secs <= 0) {
          return { ...l, status: 'expired' as const };
        }
        return { ...l };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getDepositLabel = useCallback((depositCents: number) => {
    // Find which tier matches this deposit amount
    for (const t of DEPOSIT_TIERS) {
      if (t.deposit === depositCents) {
        return t.tier;
      }
    }
    return 'small';
  }, []);

  const handleAccept = async (leadId: string) => {
    setAccepting(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', companyId: 'comp-001' }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'accepted' as const, accepted_by: 'comp-001' } : l));
      } else {
        // Simulate success for demo
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'accepted' as const, accepted_by: 'comp-001' } : l));
      }
    } catch {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'accepted' as const, accepted_by: 'comp-001' } : l));
    }
    setAccepting(null);
  };

  const handleDecline = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', companyId: 'comp-001', reason: declineReason }),
      });
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch {
      setLeads(prev => prev.filter(l => l.id !== leadId));
    }
    setShowDecline(null);
    setDeclineReason('');
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const pendingLeads = leads.filter(l => l.status === 'pending');
  const acceptedLeads = leads.filter(l => l.status === 'accepted');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Accept or decline incoming job leads</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {pendingLeads.length} pending
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: pendingLeads.length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Accepted', value: acceptedLeads.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Est.', value: leads.length ? `$${Math.round(leads.reduce((s,l) => s + l.total_estimate, 0) / leads.length)}` : '—', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Deposits Collected', value: `$${(leads.reduce((s,l) => s + l.deposit_paid, 0) / 100).toFixed(0)}`, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 md:p-4`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className={`text-xl md:text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Leads */}
      {pendingLeads.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Available Leads ({pendingLeads.length})
          </h2>
          <div className="space-y-4">
            {pendingLeads.map(lead => {
              const secsLeft = countdownSeconds(lead.expires_at);
              const mins = Math.floor(secsLeft / 60);
              const secs = secsLeft % 60;
              const depositLabel = depositDollars(lead.deposit_paid);
              const tierKey = lead.deposit_tier || getDepositLabel(lead.deposit_paid);

              return (
                <Card key={lead.id} padding="lg" className="!bg-white !ring-1 !ring-slate-200 overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Photo Thumbnail */}
                    <div className="shrink-0">
                      <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden relative">
                        {lead.photo_url ? (
                          <img
                            src={lead.photo_url}
                            alt={lead.customer_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${lead.photo_url ? 'hidden' : ''}`}>
                          <Camera className="w-6 h-6 text-slate-300" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{lead.customer_name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${sevColors[lead.severity] || ''}`}>
                          <AlertTriangle className="w-3 h-3" />{lead.severity}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${tierColors[tierKey] || tierColors.small}`}>
                          {depositLabel}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600">{lead.diagnosis}</p>

                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />{lead.customer_address}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 shrink-0" />{lead.customer_phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 shrink-0" />Est. ${lead.total_estimate.toLocaleString()}
                        </span>
                      </div>

                      {/* Deposit Banner */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-xs font-medium text-emerald-800">
                          Customer paid <span className="font-bold">{depositLabel}</span> deposit — this will be credited on your invoice
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-2 shrink-0">
                      {/* Countdown Timer */}
                      <div className={`flex items-center gap-1.5 text-xs ${getUrgencyClass(secsLeft)}`}>
                        <Clock className={`w-3.5 h-3.5 ${secsLeft < 60 ? 'animate-bounce' : ''}`} />
                        <span className="font-mono tabular-nums">{mins}:{secs.toString().padStart(2, '0')}</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAccept(lead.id)}
                        loading={accepting === lead.id}
                        className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDecline(lead.id)}
                        className="!text-red-600 !border-red-200 hover:!bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />Decline
                      </Button>
                    </div>
                  </div>

                  {/* Decline Reason Dropdown */}
                  {showDecline === lead.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <select
                        value={declineReason}
                        onChange={e => setDeclineReason(e.target.value)}
                        className="w-full sm:w-auto h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 outline-none focus:border-blue-400"
                      >
                        <option value="">Select reason...</option>
                        {declineReasons.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="destructive" onClick={() => handleDecline(lead.id)} disabled={!declineReason}>
                          Confirm Decline
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowDecline(null); setDeclineReason(''); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Accepted Leads */}
      {acceptedLeads.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Accepted ({acceptedLeads.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {acceptedLeads.map(lead => (
              <Card key={lead.id} padding="md" className="!bg-emerald-50 !ring-1 !ring-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {lead.photo_url ? (
                      <img src={lead.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-300 m-2.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <h3 className="font-semibold text-slate-900 truncate">{lead.customer_name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{lead.diagnosis}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Est. ${lead.total_estimate.toLocaleString()} · {lead.customer_address}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${tierColors[lead.deposit_tier || 'small']}`}>
                    {depositDollars(lead.deposit_paid)} deposit
                  </span>
                  <span className="text-xs text-slate-400">— credited on invoice</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {leads.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No leads yet</p>
          <p className="text-xs text-slate-400 mt-1">New leads from the marketplace will appear here</p>
        </div>
      )}
    </div>
  );
}
