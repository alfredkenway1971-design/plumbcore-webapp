'use client';

import { Download, AlertTriangle, Search } from 'lucide-react';
import { downloadCSV } from '@/lib/csv-export';

export default function AdminAtRiskAccountsPage() {
  const accounts: any[] = [];

  const handleExport = () => {
    downloadCSV([], "export");
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">At-Risk Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Accounts showing signs of potential churn</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm ring-1 ring-black/5">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'At-Risk Accounts', value: 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'MRR at Risk', value: '$0', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Churn Probability', value: '0%', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Reps Assigned', value: 0, icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm ring-1 ring-black/5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input readOnly placeholder="Search accounts..." className="w-full h-10 pl-10 pr-4 hover:bg-slate-50 border-0 rounded-xl text-sm text-slate-900 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
        <div className="px-5 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No at-risk accounts yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            When plumbers show signs of potential churn — like declining usage, late payments, or support escalations — they'll appear here so you can take action.
          </p>
        </div>
      </div>
    </div>
  );
}
