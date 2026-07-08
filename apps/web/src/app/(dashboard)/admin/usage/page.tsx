'use client';

import { useState, useMemo } from 'react';
import { Search, TrendingUp, Users, Activity, Zap, BarChart3, Download } from 'lucide-react';
import { featureAdoption, companies } from '@/lib/admin-data';

const planColors: Record<string, string> = { solo: '#F59E0B', team: '#3B82F6', pro: '#10B981', business: '#8B5CF6', enterprise: '#EC4899' };

export default function AdminUsagePage() {
  const [search, setSearch] = useState('');

  const topCompanies = useMemo(() => {
    return [...companies]
      .sort((a, b) => b.aiUsage - a.aiUsage)
      .slice(0, 10);
  }, []);

  const totalWeeklyActive = featureAdoption.reduce((s, f) => s + f.weeklyActiveUsers, 0);
  const totalEnabled = featureAdoption.reduce((s, f) => s + f.totalEnabled, 0);
  const avgAdoption = Math.round(featureAdoption.reduce((s, f) => s + f.adoptionRate, 0) / featureAdoption.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Usage</h1>
          <p className="text-sm text-slate-500 mt-0.5">Feature adoption and platform utilization metrics</p>
        </div>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Feature Enables', value: totalEnabled.toLocaleString(), icon: Activity, color: 'bg-blue-500', change: '+8.2%' },
          { label: 'Weekly Active Users', value: totalWeeklyActive.toLocaleString(), icon: Users, color: 'bg-emerald-500', change: '+12.5%' },
          { label: 'Avg Adoption Rate', value: `${avgAdoption}%`, icon: TrendingUp, color: 'bg-violet-500', change: '+3.1%' },
          { label: 'Active Companies', value: companies.filter(c => c.status === 'active').length.toString(), icon: Zap, color: 'bg-amber-500', change: '+5.4%' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1.5">{kpi.value}</p>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">{kpi.change}</span>
          </div>
        ))}
      </div>

      {/* Feature Adoption Heatmap */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 pb-3">
          <h2 className="text-base font-semibold text-slate-900">Feature Adoption</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Feature</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Total Enabled</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Weekly Active</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Adoption Rate</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {featureAdoption.map((f) => {
                const barColor = f.adoptionRate >= 70 ? 'bg-emerald-500' : f.adoptionRate >= 40 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <tr key={f.featureKey} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{f.featureName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{f.totalEnabled.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-slate-600">{f.weeklyActiveUsers.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${f.adoptionRate}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{f.adoptionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${f.trend === 'up' ? 'text-emerald-600' : f.trend === 'down' ? 'text-red-600' : 'text-slate-400'}`}>
                        <span className={`w-0 h-0 border-x-4 border-x-transparent ${f.trend === 'up' ? 'border-b-4 border-b-emerald-500' : f.trend === 'down' ? 'border-t-4 border-t-red-500' : 'border-none'}`} />
                        {f.trend === 'up' ? 'Growing' : f.trend === 'down' ? 'Declining' : 'Flat'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Active Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-5 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Top Companies by AI Usage</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {topCompanies.slice(0, 6).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.city}, {c.state} · {c.techCount} techs</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">{c.aiUsage}%</p>
                  <p className="text-[10px] text-slate-400">AI usage</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Plan Distribution</h2>
          <div className="space-y-3">
            {[
              { plan: 'Enterprise', count: companies.filter(c => c.planTier === 'enterprise').length, color: '#EC4899' },
              { plan: 'Business', count: companies.filter(c => c.planTier === 'business').length, color: '#8B5CF6' },
              { plan: 'Pro', count: companies.filter(c => c.planTier === 'pro').length, color: '#10B981' },
              { plan: 'Team', count: companies.filter(c => c.planTier === 'team').length, color: '#3B82F6' },
              { plan: 'Solo', count: companies.filter(c => c.planTier === 'solo').length, color: '#F59E0B' },
            ].map((p) => {
              const pct = Math.round((p.count / companies.length) * 100);
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{p.plan}</span>
                    <span className="text-xs font-semibold text-slate-900">{p.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
