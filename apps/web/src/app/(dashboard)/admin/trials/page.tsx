'use client';

import { useState, useMemo } from 'react';
import { Search, Clock, AlertTriangle, CheckCircle, TrendingUp, Filter, ChevronDown, MoreHorizontal, Download, Building2 } from 'lucide-react';
import { trialPipeline } from '@/lib/admin-data';
import type { TrialPipelineEntry } from '@/lib/admin-data';

const riskStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  high: { bg: 'bg-red-500/10', text: 'text-red-300', dot: 'bg-red-500', label: 'High Risk' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-500', label: 'Medium Risk' },
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-500', label: 'Low Risk' },
};

const planColors: Record<string, string> = { solo: '#F59E0B', team: '#3B82F6', pro: '#10B981', business: '#8B5CF6', enterprise: '#EC4899' };

export default function AdminTrialPipelinePage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'daysRemaining' | 'engagementScore'>('daysRemaining');

  const filtered = useMemo(() => {
    let data = [...trialPipeline];
    if (search) data = data.filter(t => t.companyName.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));
    if (riskFilter !== 'all') data = data.filter(t => t.riskLevel === riskFilter);
    data.sort((a, b) => sortField === 'daysRemaining' ? a.daysRemaining - b.daysRemaining : b.engagementScore - a.engagementScore);
    return data;
  }, [search, riskFilter, sortField]);

  const stats = { total: trialPipeline.length, highRisk: trialPipeline.filter(t => t.riskLevel === 'high').length, expired: trialPipeline.filter(t => t.daysRemaining <= 0).length, avgEngagement: Math.round(trialPipeline.reduce((s, t) => s + t.engagementScore, 0) / trialPipeline.length) };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Trial Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor active trials and conversion progress</p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0F172A] ring-1 ring-white/5 text-sm font-medium text-slate-300 hover:bg-white/[0.02] transition-all shadow-lg shadow-black/30">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[ { label: 'Active Trials', value: stats.total, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' }, { label: 'High Risk', value: stats.highRisk, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' }, { label: 'Expired', value: stats.expired, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' }, { label: 'Avg Engagement', value: stats.avgEngagement + '%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' } ].map((s, i) => (
          <div key={i} className="bg-[#0F172A] rounded-2xl ring-1 ring-white/5 p-5 shadow-lg shadow-black/30">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0F172A] rounded-2xl ring-1 ring-white/5 shadow-lg shadow-black/30 overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-white/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-white/[0.02] border-0 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(r => (
              <button key={r} onClick={() => setRiskFilter(r)} className={`h-10 px-4 rounded-xl text-xs font-semibold transition-all ${riskFilter === r ? 'bg-slate-700 text-white' : 'bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'}`}>{r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Company', 'Plan', 'Days Left', 'Engagement', 'Risk'].map((h, i) => (
                <th key={i} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(t => {
                const risk = riskStyles[t.riskLevel];
                return (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.02] flex items-center justify-center"><Building2 className="w-4 h-4 text-slate-500" /></div>
                        <div><p className="text-sm font-semibold text-white">{t.companyName}</p><p className="text-xs text-slate-600">{t.email}</p></div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{backgroundColor: planColors[t.planTier] + '20', color: planColors[t.planTier]}}>{t.planTier.charAt(0).toUpperCase() + t.planTier.slice(1)}</span></td>
                    <td className="py-3.5 px-5"><span className={`text-sm font-semibold ${t.daysRemaining <= 0 ? 'text-red-400' : t.daysRemaining <= 5 ? 'text-amber-400' : 'text-slate-300'}`}>{t.daysRemaining <= 0 ? 'Expired' : t.daysRemaining + ' days'}</span></td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2"><div className="w-24 h-2 bg-white/[0.02] rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${t.engagementScore >= 70 ? 'bg-emerald-500' : t.engagementScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: t.engagementScore + '%'}} /></div><span className="text-xs font-semibold text-slate-400">{t.engagementScore}%</span></div>
                    </td>
                    <td className="py-3.5 px-5"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${risk.bg} ${risk.text}`}><span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />{risk.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
