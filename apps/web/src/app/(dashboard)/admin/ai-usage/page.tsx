'use client';

import { useState, useMemo } from 'react';
import { Brain, TrendingUp, Users, Zap, BarChart3, Search, Download, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { featureAdoption } from '@/lib/admin-data';

const trendIcons: Record<string, any> = { up: ArrowUp, down: ArrowDown, flat: Minus };
const trendColors: Record<string, string> = { up: 'text-emerald-500', down: 'text-red-500', flat: 'text-slate-600' };

const usageByDay = [
  { day: 'Mon', estimates: 245, voiceNotes: 89, chats: 134 },
  { day: 'Tue', estimates: 312, voiceNotes: 102, chats: 156 },
  { day: 'Wed', estimates: 287, voiceNotes: 95, chats: 142 },
  { day: 'Thu', estimates: 334, voiceNotes: 118, chats: 178 },
  { day: 'Fri', estimates: 298, voiceNotes: 92, chats: 149 },
  { day: 'Sat', estimates: 156, voiceNotes: 45, chats: 78 },
  { day: 'Sun', estimates: 98, voiceNotes: 28, chats: 52 },
];

const maxUsage = Math.max(...usageByDay.map(d => d.estimates + d.voiceNotes + d.chats));

export default function AdminAiUsageStatsPage() {
  const [search, setSearch] = useState('');

  const totalEstimates = usageByDay.reduce((s, d) => s + d.estimates, 0);
  const totalVoice = usageByDay.reduce((s, d) => s + d.voiceNotes, 0);
  const totalChats = usageByDay.reduce((s, d) => s + d.chats, 0);
  const totalWeekly = totalEstimates + totalVoice + totalChats;

  const filtered = useMemo(() => {
    if (!search) return featureAdoption;
    return featureAdoption.filter(f => f.featureName.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">AI Usage Stats</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor AI feature adoption and usage patterns</p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0F172A] ring-1 ring-white/5 text-sm font-medium text-slate-300 hover:bg-white/[0.02] transition-all">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[ { label: 'Weekly AI Calls', value: totalWeekly.toLocaleString(), icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' }, { label: 'Photo Estimates', value: totalEstimates.toLocaleString(), icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/10' }, { label: 'Voice Notes', value: totalVoice.toLocaleString(), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }, { label: 'AI Chats', value: totalChats.toLocaleString(), icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' } ].map((s, i) => (
          <div key={i} className="bg-[#0F172A] rounded-2xl ring-1 ring-white/5 p-5 shadow-lg shadow-black/30">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl ring-1 ring-white/5 p-6 shadow-lg shadow-black/30">
          <h3 className="text-sm font-semibold text-white mb-4">Daily AI Usage (This Week)</h3>
          <div className="flex items-end gap-3 h-48">
            {usageByDay.map(d => {
              const total = d.estimates + d.voiceNotes + d.chats;
              const height = (total / maxUsage) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end gap-0.5" style={{height: '160px'}}>
                    <div className="w-full rounded-t-md bg-blue-500 transition-all" style={{height: (d.chats / total * height) + '%'}} />
                    <div className="w-full bg-emerald-500 transition-all" style={{height: (d.voiceNotes / total * height) + '%'}} />
                    <div className="w-full bg-purple-500 rounded-t-sm transition-all" style={{height: (d.estimates / total * height) + '%'}} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{d.day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {[ { color: 'bg-purple-500', label: 'Photo Estimates' }, { color: 'bg-emerald-500', label: 'Voice Notes' }, { color: 'bg-blue-500', label: 'AI Chats' } ].map(l => (
              <div key={l.label} className="flex items-center gap-2"><div className={`w-3 h-3 rounded-sm ${l.color}`} /><span className="text-xs text-slate-500">{l.label}</span></div>
            ))}
          </div>
        </div>

        <div className="bg-[#0F172A] rounded-2xl ring-1 ring-white/5 p-6 shadow-lg shadow-black/30">
          <h3 className="text-sm font-semibold text-white mb-4">Top Features</h3>
          <div className="space-y-4">
            {featureAdoption.slice(0, 4).map(f => {
              const TrendIcon = trendIcons[f.trend];
              return (
                <div key={f.featureKey}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-300">{f.featureName}</span>
                    <div className="flex items-center gap-1"><TrendIcon className={`w-3.5 h-3.5 ${trendColors[f.trend]}`} /><span className="text-xs font-semibold text-slate-400">{f.adoptionRate}%</span></div>
                  </div>
                  <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{width: f.adoptionRate + '%'}} />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{f.weeklyActiveUsers.toLocaleString()} weekly users</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#0F172A] rounded-2xl ring-1 ring-white/5 shadow-lg shadow-black/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Feature Adoption Details</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input placeholder="Search features..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-white/[0.02] border-0 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Feature', 'Enabled', 'Weekly Users', 'Adoption', 'Trend'].map((h, i) => (
                <th key={i} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(f => {
                const TrendIcon = trendIcons[f.trend];
                return (
                  <tr key={f.featureKey} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5"><span className="text-sm font-semibold text-white">{f.featureName}</span></td>
                    <td className="py-3.5 px-5"><span className="text-sm text-slate-400">{f.totalEnabled.toLocaleString()}</span></td>
                    <td className="py-3.5 px-5"><span className="text-sm text-slate-400">{f.weeklyActiveUsers.toLocaleString()}</span></td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2"><div className="w-20 h-2 bg-white/[0.04] rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width: f.adoptionRate + '%'}} /></div><span className="text-xs font-semibold text-slate-400">{f.adoptionRate}%</span></div>
                    </td>
                    <td className="py-3.5 px-5"><TrendIcon className={`w-4 h-4 ${trendColors[f.trend]}`} /></td>
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
