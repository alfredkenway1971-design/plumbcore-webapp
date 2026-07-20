'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Building2, TrendingUp, Users, Zap, Filter, ChevronDown, MoreHorizontal, Download, Clock, CheckCircle, XCircle, AlertTriangle, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import type { Company } from '@/lib/admin-data';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Constants ── */

const planLabels: Record<string, string> = {
  solo: 'Solo',
  team: 'Team',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};

const planColors: Record<string, string> = {
  solo: '#F59E0B',
  team: '#3B82F6',
  pro: '#10B981',
  business: '#8B5CF6',
  enterprise: '#EC4899',
};

const statusStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
  trialing: { bg: 'bg-blue-tint', text: 'text-primary', dot: 'bg-blue-tint0', label: 'Trialing' },
  past_due: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Past Due' },
  cancelled: { bg: 'bg-muted', text: 'text-muted-foreground/80', dot: 'bg-slate-400', label: 'Cancelled' },
};

const healthIconMap: Record<string, any> = {
  green: CheckCircle,
  yellow: AlertTriangle,
  red: XCircle,
};

const healthColorMap: Record<string, string> = {
  green: 'text-emerald-500',
  yellow: 'text-amber-500',
  red: 'text-red-500',
};

type SortField = 'name' | 'mrr' | 'techCount' | 'planTier' | 'status' | 'sinceDate';

/* ── Loading State ── */

function CustomersLoading() {
  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Error State ── */

function CustomersError({ error }: { error: string }) {
  return (
    <div className="max-w-[1440px] mx-auto p-6">
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground mb-1">Failed to load customers</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
      </div>
    </div>
  );
}

/* ── Empty State ── */

function CustomersEmpty() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8 text-center">
      <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-foreground mb-1">No customers yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        When plumbers sign up and create accounts, they&apos;ll appear here. You&apos;ll be able to manage plans, view MRR, and monitor account health.
      </p>
    </div>
  );
}

/* ── Main Page ── */

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/admin/data?endpoint=companies')
      .then(r => r.json())
      .then(data => {
        if (data.companies) setCompanies(data.companies);
        setIsLoading(false);
      })
      .catch(() => { setIsLoading(false); setError('Failed to load'); });
  }, []);

  // Filter + search
  const filtered = useMemo(() => {
    let result = companies;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q));
    }
    if (planFilter) result = result.filter(c => (c.subscription_tier || 'solo') === planFilter);
    if (statusFilter) result = result.filter(c => {
      const t = c.subscription_tier || '';
      if (statusFilter === 'active') return t !== '';
      return false;
    });
    return result;
  }, [companies, search, planFilter, statusFilter]);

  const activeCount = companies.filter(c => c.subscription_tier && c.subscription_tier !== '').length;

  if (isLoading) return <CustomersLoading />;
  if (error) return <CustomersError error={error} />;

  return (
    <div className="max-w-[1440px] mx-auto p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {companies.length} total companies · {activeCount} active
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm mb-4">
        <div className="p-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground/80" />
              <select value={planFilter || ''} onChange={e => setPlanFilter(e.target.value || null)}
                className="h-9 px-3 rounded-xl border border-border text-xs font-medium text-muted-foreground focus:outline-none">
                <option value="">All Plans</option>
                {Object.entries(planLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={statusFilter || ''} onChange={e => setStatusFilter(e.target.value || null)}
                className="h-9 px-3 rounded-xl border border-border text-xs font-medium text-muted-foreground focus:outline-none">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <h3 className="text-base font-semibold text-foreground">
            All Customers
            <span className="ml-2 text-xs font-normal text-muted-foreground/80">({filtered.length})</span>
          </h3>
        </div>
        {filtered.length === 0 ? <CustomersEmpty /> : (
          <div className="divide-y divide-slate-100">
            {filtered.map(company => {
              const tier = company.subscription_tier || 'solo';
              const isActive = tier !== '';
              const sc = isActive ? statusStyles.active : statusStyles.cancelled;
              const planColor = planColors[tier] || planColors.solo;
              return (
                <div key={company.id} className="px-5 py-4 hover:bg-muted transition-colors flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: planColor }}>
                    {(company.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">{company.name || 'Unnamed'}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{company.email || '—'}</span>
                      {company.city && <span>• {company.city}{company.state ? `, ${company.state}` : ''}</span>}
                      <span>• {planLabels[tier] || tier}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground/80 shrink-0">
                    {company.created_at ? new Date(company.created_at).toLocaleDateString() : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
