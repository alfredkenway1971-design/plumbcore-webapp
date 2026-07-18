'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, ErrorState } from '@/pkg/ui-components';
import { PLAN_LABELS_PRETTY } from '@/lib/plan-pricing';
import type { PlumberProfile, PlanTier, PlumberStatus, BackgroundCheckStatus, PayoutSchedule } from '@/lib/plumber-profiles';

/* ── Icons ── */
const I = {
  Star: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  Dollar: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Check: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  Clock: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Users: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.125-.952A4.125 4.125 0 0019.875 15h-1.5m-6 4.128A9.38 9.38 0 0112 19.5a9.38 9.38 0 01-2.625-.372A4.125 4.125 0 0113.125 15h2.25a4.125 4.125 0 014.125 4.125 9.337 9.337 0 01-4.125.952zM15 9a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Search: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>,
  Filter: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/></svg>,
};

/* ── Empty State ── */
function EmptyPlumberState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-4 shadow-sm">
        <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">No plumbers registered yet</h3>
      <p className="text-sm text-slate-500 max-w-xs">Plumbers will appear here after they sign up and complete onboarding.</p>
    </div>
  );
}

const planColors: Record<string, string> = {
  solo: 'bg-amber-50 text-amber-600 border-amber-500/20',
  pro: 'bg-blue-50 text-blue-600 border-blue-500/20',
  business: 'bg-violet-50 text-violet-600 border-violet-500/20',
  enterprise: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const planRevenueDisplay: Record<string, string> = {
  solo: '$349',
  pro: '$799',
  business: '$1,499',
  enterprise: '$2,500',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-500/30',
  paused: 'bg-amber-50 text-amber-700 border-amber-500/30',
  suspended: 'bg-red-50 text-red-700 border-red-500/30',
};

export default function AdminPlumbersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [plumbers, setPlumbers] = useState<PlumberProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?endpoint=companies')
      .then(r => r.json())
      .then(data => {
        const companies = data.companies || [];
        setPlumbers(companies.map((c: any) => ({
          id: c.id,
          company_id: c.id,
          company_name: c.name,
          email: c.email,
          phone: c.phone || '',
          specialties: [],
          plan_tier: c.subscription_tier || 'solo' as PlanTier,
          status: c.subscription_tier ? 'active' as PlumberStatus : 'paused' as PlumberStatus,
          avg_rating: 0,
          total_jobs_completed: 0,
          acceptance_rate: 0,
          monthly_lead_limit: 10,
          current_month_leads: 0,
          stripe_customer_id: c.stripe_customer_id || '',
          stripe_subscription_id: c.stripe_subscription_id || '',
          stripe_onboarding_complete: false,
          primary_color: '#3B82F6',
          background_check: 'cleared' as BackgroundCheckStatus,
          payout_schedule: 'weekly' as PayoutSchedule,
          created_at: c.created_at,
          last_active: c.created_at,
        })));
        setLoading(false);
      })
      .catch(() => { setError('Failed to load plumbers'); setLoading(false); });
  }, []);

  const filtered = plumbers.filter(p => {
    if (filterTier !== 'all' && p.plan_tier !== filterTier) return false;
    if (search && !p.company_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const total = plumbers.length;
  const totalActive = plumbers.filter(p => p.status === 'active').length;
  const totalAtRisk = plumbers.filter(p => p.status === 'paused').length;
  const totalCompleted = plumbers.reduce((s, p) => s + p.total_jobs_completed, 0);
  const totalAvgRating = total > 0 ? (plumbers.reduce((s, p) => s + p.avg_rating, 0) / total).toFixed(1) : '0';

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">Plumber Profiles</h1><p className="text-sm text-slate-500 mt-0.5">Manage all plumbers, their plans, and performance</p></div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex-1 sm:flex-none">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Export
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 flex-1 sm:flex-none">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Invite Plumber
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Active Plumbers</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalActive}</p>
        </div>
        <div className="rounded-2xl bg-white border border-amber-100 shadow-sm px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">At Risk</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalAtRisk}</p>
        </div>
        <div className="rounded-2xl bg-white border border-violet-100 shadow-sm px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">Jobs Completed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCompleted.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white border border-amber-100 shadow-sm px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Avg Rating</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalAvgRating} <span className="text-amber-400 text-lg">★</span></p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <I.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plumbers..."
            className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          {['all', 'solo', 'pro', 'business', 'enterprise'].map(t => (
            <button key={t} onClick={() => setFilterTier(t)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                filterTier === t
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}>
              {t === 'all' ? 'All' : PLAN_LABELS_PRETTY[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="rounded-xl bg-white border border-slate-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => router.push(`/admin/plumbers/${p.id}`)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${p.primary_color}, ${p.primary_color}aa)` }}>
                  {p.company_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.company_name}</p>
                  <p className="text-[11px] text-slate-500">{p.specialties.slice(0, 2).join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <I.Star className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-sm font-semibold text-slate-900">{p.avg_rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${planColors[p.plan_tier] || planColors.solo}`}>
                {PLAN_LABELS_PRETTY[p.plan_tier]}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[p.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  p.status === 'active' ? 'bg-emerald-600' :
                  p.status === 'paused' ? 'bg-amber-600' :
                  'bg-red-600'
                }`} />
                {p.status === 'active' ? 'Active' : p.status === 'paused' ? 'At Risk' : 'Suspended'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="font-medium">{p.total_jobs_completed.toLocaleString()} jobs</span>
                <span className="font-semibold text-emerald-600">{planRevenueDisplay[p.plan_tier]}/mo</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/plumbers/${p.id}`); }}
                className="text-xs text-blue-600 hover:text-blue-600 font-medium">View →</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && total > 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-500">No plumbers found</div>
        )}
        {total === 0 && (
          <EmptyPlumberState />
        )}
      </div>

      {/* Table */}
      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Plumber</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Rating</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Jobs</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Acceptance</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Leads (mo)</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Revenue/mo</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Connect</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hidden sm:table-row hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/admin/plumbers/${p.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${p.primary_color}, ${p.primary_color}aa)` }}>
                        {p.company_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.company_name}</p>
                        <p className="text-[11px] text-slate-500">{p.specialties.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${planColors[p.plan_tier] || planColors.solo}`}>
                      {PLAN_LABELS_PRETTY[p.plan_tier]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <I.Star className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-sm font-semibold text-slate-900">{p.avg_rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{p.total_jobs_completed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{p.acceptance_rate}%</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{p.current_month_leads}/{p.monthly_lead_limit}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{planRevenueDisplay[p.plan_tier]}</td>
                  <td className="px-4 py-3">
                    {p.stripe_onboarding_complete
                      ? <I.Check className="w-4 h-4 text-emerald-600" />
                      : <span className="text-xs text-amber-600">Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[p.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        p.status === 'active' ? 'bg-emerald-600' :
                        p.status === 'paused' ? 'bg-amber-600' :
                        'bg-red-600'
                      }`} />
                      {p.status === 'active' ? 'Active' : p.status === 'paused' ? 'At Risk' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/plumbers/${p.id}`); }}
                      className="text-xs text-blue-600 hover:text-blue-600">View →</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && total > 0 && (
                <tr><td colSpan={10} className="px-4 py-6 text-center text-sm text-slate-500">No plumbers found</td></tr>
              )}
              {total === 0 && (
                <tr><td colSpan={10} className="px-4 py-16"><EmptyPlumberState /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
