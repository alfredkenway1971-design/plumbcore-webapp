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
  trialing: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', label: 'Trialing' },
  past_due: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Past Due' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Cancelled' },
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
    <div className="max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
        <div className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Skeleton className="h-10 w-72" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-slate-100">
                {['Company', 'Plan', 'MRR', 'Techs', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="px-5 py-3">
                    <Skeleton className="h-3 w-14" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-xl" />
                      <div>
                        <Skeleton className="h-4 w-36 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-14" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Error State ── */

function CustomersError({ error }: { error: string }) {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="bg-white rounded-2xl border border-red-500/20 shadow-sm ring-1 ring-black/5 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Failed to load customers</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/* ── Empty State ── */

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">No customers yet</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        When plumbers sign up and create accounts, they'll appear here. You'll be able to manage plans, view MRR, and monitor account health.
      </p>
    </div>
  );
}

/* ── Main Page ── */

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

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

  if (isLoading) return <CustomersLoading />;
  if (error) return <CustomersError error={error} />;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">
            {companies.length} total companies
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5 mb-4">
        <div className="p-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search by name, city, or owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Filter:
              </div>
              {/* Plan filter */}
              <div className="relative">
                <select
                  value={planFilter || ''}
                  onChange={(e) => setPlanFilter(e.target.value || null)}
                  className="appearance-none h-9 pl-3 pr-7 rounded-xl border border-slate-200 text-xs font-medium text-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Plans</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
              </div>
              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter || ''}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="appearance-none h-9 pl-3 pr-7 rounded-xl border border-slate-200 text-xs font-medium text-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <h3 className="text-base font-semibold text-slate-900">
            All Customers
            <span className="ml-2 text-xs font-normal text-slate-600">(0)</span>
          </h3>
        </div>
        <EmptyState />
      </div>
    </div>
  );
}
