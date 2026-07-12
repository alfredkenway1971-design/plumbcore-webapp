'use client';

import { useState, useEffect } from 'react';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import { Clock, MapPin, User, DollarSign, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'refunded';
  accepted_by?: string;
  created_at: string;
  expires_at: string;
}

const mockLeads: Lead[] = [
  {
    id: 'LEAD-001', customer_name: 'Sarah Johnson', customer_email: 'sarah@email.com',
    customer_phone: '5125550101', customer_address: '123 Main St, Austin, TX 78701',
    diagnosis: 'Leaking water heater — 40 gallon electric', severity: 'high',
    total_estimate: 1250, deposit_paid: 49, status: 'pending',
    created_at: '2026-07-10T14:30:00Z', expires_at: '2026-07-11T14:30:00Z',
  },
  {
    id: 'LEAD-002', customer_name: 'Mike Torres', customer_email: 'mike@email.com',
    customer_phone: '5125550202', customer_address: '456 Oak Ave, Austin, TX 78702',
    diagnosis: 'Kitchen sink clog — needs snaking', severity: 'moderate',
    total_estimate: 350, deposit_paid: 49, status: 'accepted',
    accepted_by: 'comp-001', created_at: '2026-07-10T12:00:00Z', expires_at: '2026-07-11T12:00:00Z',
  },
];

const sevColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-400', moderate: 'bg-amber-500/10 text-amber-400',
  high: 'bg-orange-500/10 text-orange-400', emergency: 'bg-red-500/10 text-red-400',
};

function formatTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m left`;
}

function getUrgencyLevel(expiresAt: string): 'normal' | 'urgent' | 'critical' {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'critical';
  const mins = Math.floor(diff / 60000);
  if (mins < 15) return 'critical';
  if (mins < 30) return 'urgent';
  return 'normal';
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [showDecline, setShowDecline] = useState<string | null>(null);

  useEffect(() => {
    // In production, fetch from API
    setTimeout(() => { setLeads(mockLeads); setLoading(false); }, 500);
  }, []);

  // Auto-refresh timer every 10s
  useEffect(() => {
    const interval = setInterval(() => setLeads(prev => [...prev]), 10000);
    return () => clearInterval(interval);
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
      }
    } catch { /* ignore */ }
    setAccepting(null);
  };

  const handleDecline = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', companyId: 'comp-001', reason: declineReason }),
      });
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch { /* ignore */ }
    setShowDecline(null);
    setDeclineReason('');
  };

  if (loading) {
    return <div className="p-4 sm:p-6"><div className="h-8 w-48 bg-white/[0.02] rounded animate-pulse mb-4" /><div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-white/[0.02] rounded-2xl animate-pulse" />)}</div></div>;
  }

  const pendingLeads = leads.filter(l => l.status === 'pending');
  const acceptedLeads = leads.filter(l => l.status === 'accepted');

  return (
    <div className="p-4 sm:p-6 space-y-6">
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
          { label: 'Pending', value: pendingLeads.length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Accepted', value: acceptedLeads.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Avg Est.', value: leads.length ? `$${Math.round(leads.reduce((s,l) => s + l.total_estimate, 0) / leads.length)}` : '—', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Deposits', value: `$${leads.reduce((s,l) => s + l.deposit_paid, 0)}`, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 md:p-4`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className={`text-xl md:text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Leads */}
      {pendingLeads.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Pending Leads ({pendingLeads.length})</h2>
          <div className="space-y-3">
            {pendingLeads.map(lead => (
              <Card key={lead.id} padding="lg" className="!bg-white !ring-1 !ring-slate-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{lead.customer_name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${sevColors[lead.severity] || ''}`}>
                        <AlertTriangle className="w-3 h-3" />{lead.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{lead.diagnosis}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.customer_address}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{lead.customer_phone}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />Est. ${lead.total_estimate.toLocaleString()}</span>
                      <span className={`flex items-center gap-1 ${
                        getUrgencyLevel(lead.expires_at) === 'critical' 
                          ? 'text-red-500 animate-pulse font-semibold'
                          : getUrgencyLevel(lead.expires_at) === 'urgent'
                            ? 'text-orange-400'
                            : 'text-amber-400'
                      }`}><Clock className={`w-3 h-3 ${
                        getUrgencyLevel(lead.expires_at) === 'critical' ? 'animate-bounce' : ''
                      }`} />{formatTimeLeft(lead.expires_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" onClick={() => handleAccept(lead.id)} loading={accepting === lead.id}>
                      <CheckCircle className="w-4 h-4 mr-1" />Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowDecline(lead.id)}>
                      <XCircle className="w-4 h-4 mr-1" />Decline
                    </Button>
                  </div>
                </div>
                {showDecline === lead.id && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                    <select value={declineReason} onChange={e => setDeclineReason(e.target.value)}
                      className="h-9 px-3 rounded-xl bg-slate-800/50 ring-1 ring-white/10 text-xs text-slate-300 outline-none">
                      <option value="">Select reason...</option>
                      <option value="too_far">Too far</option>
                      <option value="busy">Too busy</option>
                      <option value="low_price">Price too low</option>
                      <option value="not_service_area">Not in service area</option>
                    </select>
                    <Button size="sm" variant="destructive" onClick={() => handleDecline(lead.id)} disabled={!declineReason}>Confirm</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowDecline(null); setDeclineReason(''); }}>Cancel</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Leads */}
      {acceptedLeads.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Accepted ({acceptedLeads.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {acceptedLeads.map(lead => (
              <Card key={lead.id} padding="md" className="!bg-emerald-500/5 !ring-1 !ring-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-slate-900">{lead.customer_name}</h3>
                </div>
                <p className="text-sm text-slate-400">{lead.diagnosis}</p>
                <p className="text-xs text-slate-500 mt-1">Est. ${lead.total_estimate.toLocaleString()} · {lead.customer_address}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {leads.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center mx-auto mb-3">
            <Clock className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No leads yet</p>
          <p className="text-xs text-slate-600 mt-1">New leads from the marketplace will appear here</p>
        </div>
      )}
    </div>
  );
}
