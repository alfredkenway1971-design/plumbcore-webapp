import { useState, useMemo } from 'react';
import { Search, Building2, TrendingUp, Users, Zap, Filter, ChevronDown, MoreHorizontal, Download, Phone, Mail, MapPin, Star, ArrowUp, ArrowDown, ArrowUpDown, CheckCircle, XCircle, AlertTriangle, SlidersHorizontal, Clock } from 'lucide-react';
import { companies, platformKPIs, getPlatformSummary } from '@/lib/admin-data';
import type { Company } from '@/lib/admin-data';
import { downloadCSV } from '@/lib/csv-export';
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
  trialing: { bg: 'bg-blue-50', text: 'text-blue-300', dot: 'bg-blue-500', label: 'Trialing' },
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

function EmptyState({ search }: { search: string }) {
  return (
    <tr>
      <td colSpan={6} className="px-5 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl hover:bg-slate-50 flex items-center justify-center mx-auto mb-3">
          <Search className="w-6 h-6 text-slate-600" />
        </div>
        <p className="text-sm font-medium text-slate-700">No customers found</p>
        <p className="text-xs text-slate-600 mt-1">
          {search ? `No results matching "${search}"` : 'No customers match the selected filters'}
        </p>
      </td>
    </tr>
  );
}

/* ── Main Customers Table ── */

function CustomersTable({
  data,
  sortField,
  sortAsc,
  onSort,
}: {
  data: Company[];
  sortField: SortField;
  sortAsc: boolean;
  onSort: (field: SortField) => void;
}) {
  const SortHeader = ({ field, label, className }: { field: SortField; label: string; className?: string }) => (
    <th
      className={`text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 cursor-pointer select-none hover:text-slate-700 transition-colors ${className || ''}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 transition-opacity ${sortField === field ? 'opacity-100' : 'opacity-30'}`} />
      </div>
    </th>
  );

  const initialColors = [
    'from-violet-400 to-purple-400',
    'from-blue-400 to-cyan-400',
    'from-emerald-400 to-teal-400',
    'from-amber-400 to-orange-400',
    'from-rose-400 to-pink-400',
    'from-indigo-400 to-blue-400',
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-t border-b border-slate-100">
            <SortHeader field="name" label="Company" />
            <SortHeader field="planTier" label="Plan" className="hidden sm:table-cell" />
            <SortHeader field="mrr" label="MRR" />
            <SortHeader field="techCount" label="Techs" className="hidden md:table-cell" />
            <SortHeader field="status" label="Status" />
            <SortHeader field="sinceDate" label="Joined" className="hidden lg:table-cell" />
            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <EmptyState search="" />
          ) : (
            data.map((cust, i) => {
              const statusCfg = statusStyles[cust.status] || statusStyles.active;
              const HealthIcon = healthIconMap[cust.health] || CheckCircle;
              return (
                <tr key={cust.id} className="border-b border-slate-100 hover:hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${initialColors[i % initialColors.length]} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}
                      >
                        {cust.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{cust.name}</p>
                        <p className="text-[11px] text-slate-600">{cust.city}, {cust.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: `${planColors[cust.planTier]}15`,
                        color: planColors[cust.planTier],
                      }}
                    >
                      {planLabels[cust.planTier] || cust.planTier}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-slate-900">${cust.mrr.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-slate-400">{cust.techCount}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-sm text-slate-500">
                        {new Date(cust.sinceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3.5">
                    <button className="text-slate-600 hover:text-slate-400 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Page ── */


  const handleExport = () => {
    const data: Record<string, any>[] = [];
    downloadCSV(data, 'customers');
  };

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = useMemo(() => {
    if (error) return [];
    let result = [...companies];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.ownerName.toLowerCase().includes(q) ||
          c.ownerEmail.toLowerCase().includes(q)
      );
    }
    if (planFilter) {
      result = result.filter((c) => c.planTier === planFilter);
    }
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'mrr':
          cmp = a.mrr - b.mrr;
          break;
        case 'techCount':
          cmp = a.techCount - b.techCount;
          break;
        case 'planTier':
          cmp = a.planTier.localeCompare(b.planTier);
          break;
        case 'status': {
          const order = { active: 0, trialing: 1, past_due: 2, cancelled: 3 };
          cmp = (order[a.status] ?? 0) - (order[b.status] ?? 0);
          break;
        }
        case 'sinceDate':
          cmp = new Date(a.sinceDate).getTime() - new Date(b.sinceDate).getTime();
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [search, planFilter, statusFilter, sortField, sortAsc, error]);

  const plans = useMemo(() => {
    const set = new Set(companies.map((c) => c.planTier));
    return Array.from(set).sort();
  }, []);

  const statuses = ['active', 'trialing', 'past_due', 'cancelled'] as const;
  const statusLabels: Record<string, string> = {
    active: 'Active',
    trialing: 'Trialing',
    past_due: 'Past Due',
    cancelled: 'Cancelled',
  };

  if (isLoading) return <CustomersLoading />;
  if (error) return <CustomersError error={error} />;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">
            {companies.length} total companies · ${companies.reduce((s, c) => s + c.mrr, 0).toLocaleString()} total MRR
          </p>
        </div>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm ring-1 ring-black/5">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Export</span>
        </button>
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
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-white/10 text-sm text-slate-700 placeholder:text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-500"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
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
                  className="appearance-none h-9 pl-3 pr-7 rounded-xl border border-white/10 text-xs font-medium text-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Plans</option>
                  {plans.map((p) => (
                    <option key={p} value={p}>
                      {planLabels[p] || p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
              </div>
              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter || ''}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="appearance-none h-9 pl-3 pr-7 rounded-xl border border-white/10 text-xs font-medium text-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
              </div>
              {/* Clear filters */}
              {(planFilter || statusFilter || search) && (
                <button
                  onClick={() => {
                    setPlanFilter(null);
                    setStatusFilter(null);
                    setSearch('');
                  }}
                  className="h-9 px-3 rounded-xl border border-white/10 text-xs font-medium text-slate-500 hover:hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <h3 className="text-base font-semibold text-slate-900">
            All Customers
            <span className="ml-2 text-xs font-normal text-slate-600">({filtered.length})</span>
          </h3>
        </div>
        <CustomersTable data={filtered} sortField={sortField} sortAsc={sortAsc} onSort={handleSort} />
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-600">Showing {filtered.length} of {companies.length} customers</span>
        </div>
      </div>
    </div>
  );
}
