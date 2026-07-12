'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download, Clock, CheckCircle, AlertTriangle, XCircle, Info, Building2 } from 'lucide-react';
import { recentActivity } from '@/lib/admin-data';
import { downloadCSV } from '@/lib/csv-export';



const severityStyles: Record<string, { bg: string; text: string; icon: any; dot: string }> = {
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertTriangle, dot: 'bg-amber-500' },
  error: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, dot: 'bg-red-500' },
  info: { bg: 'bg-blue-50', text: 'text-blue-300', icon: Info, dot: 'bg-blue-500' },
};

const typeLabels: Record<string, string> = {
  company_created: 'Company Created',
  subscription_changed: 'Subscription Changed',
  payment_succeeded: 'Payment Succeeded',
  trial_converted: 'Trial Converted',
  company_canceled: 'Company Canceled',
  onboarding_complete: 'Onboarding Complete',
  payment_failed: 'Payment Failed',
};


  const handleExport = () => {
    const data: Record<string, any>[] = [];
    downloadCSV(data, 'audit');
  };

export default function AdminAuditLogPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = useMemo(() => {
    let data = [...recentActivity];
    if (search) data = data.filter(a => a.companyName.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
    if (severityFilter !== 'all') data = data.filter(a => a.severity === severityFilter);
    return data;
  }, [search, severityFilter]);

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-1">Track all platform activity and changes</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white ring-1 ring-white/5 text-sm font-medium text-slate-700 hover:hover:bg-slate-50 transition-all">
          <Download className="w-4 h-4" /> Export Log
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[ { label: 'Total Events', value: recentActivity.length, color: 'text-blue-500', bg: 'bg-blue-50' }, { label: 'Success', value: recentActivity.filter(a => a.severity === 'success').length, color: 'text-emerald-500', bg: 'bg-emerald-50' }, { label: 'Warnings', value: recentActivity.filter(a => a.severity === 'warning').length, color: 'text-amber-600', bg: 'bg-amber-50' }, { label: 'Errors', value: recentActivity.filter(a => a.severity === 'error').length, color: 'text-red-500', bg: 'bg-red-50' } ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-white/5 p-4 shadow-sm ring-1 ring-black/5 text-center">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-white/5 shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 hover:bg-slate-50 border-0 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="flex gap-2">
            {['all', 'success', 'warning', 'error', 'info'].map(s => (
              <button key={s} onClick={() => setSeverityFilter(s)} className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all capitalize ${severityFilter === s ? 'bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-400 hover:bg-white/[0.04]'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['Time', 'Company', 'Event', 'Description', 'Severity'].map((h, i) => (
                <th key={i} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(a => {
                const sev = severityStyles[a.severity];
                const SevIcon = sev.icon;
                return (
                  <tr key={a.id} className="border-b border-white/[0.03] hover:hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5"><span className="text-xs text-slate-500 font-mono">{new Date(a.timestamp).toLocaleString()}</span></td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-600" /><span className="text-sm font-medium text-slate-700">{a.companyName}</span></div>
                    </td>
                    <td className="py-3.5 px-5"><span className="text-sm text-slate-400">{typeLabels[a.type] || a.type}</span></td>
                    <td className="py-3.5 px-5"><span className="text-sm text-slate-400">{a.description}</span></td>
                    <td className="py-3.5 px-5"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sev.bg} ${sev.text}`}><span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />{a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}</span></td>
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
