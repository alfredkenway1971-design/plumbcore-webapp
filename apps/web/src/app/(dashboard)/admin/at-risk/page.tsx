import { useState, useMemo } from 'react';
import { Search, Building2, AlertTriangle, Phone, Mail, MoreHorizontal, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { atRiskAccounts } from '@/lib/admin-data';
import { downloadCSV } from '@/lib/csv-export';





  const handleExport = () => {
    const data: Record<string, any>[] = [];
    downloadCSV(data, 'at-risk');
  };

export default function AdminAtRiskAccountsPage() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'churnProbability' | 'mrr'>('churnProbability');

  const filtered = useMemo(() => {
    let data = [...atRiskAccounts];
    if (search) data = data.filter(a => a.companyName.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase()));
    data.sort((a, b) => sortField === 'churnProbability' ? b.churnProbability - a.churnProbability : b.mrr - a.mrr);
    return data;
  }, [search, sortField]);

  const totalMrrAtRisk = atRiskAccounts.reduce((s, a) => s + a.mrr, 0);
  const avgChurnProb = Math.round(atRiskAccounts.reduce((s, a) => s + a.churnProbability, 0) / atRiskAccounts.length * 100);

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">At-Risk Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Accounts showing signs of potential churn</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white ring-1 ring-white/5 text-sm font-medium text-slate-700 hover:hover:bg-slate-50 transition-all shadow-sm ring-1 ring-black/5">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[ { label: 'At-Risk Accounts', value: atRiskAccounts.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }, { label: 'MRR at Risk', value: '$' + totalMrrAtRisk.toLocaleString(), icon: ArrowDown, color: 'text-amber-600', bg: 'bg-amber-50' }, { label: 'Avg Churn Probability', value: avgChurnProb + '%', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' }, { label: 'Reps Assigned', value: new Set(atRiskAccounts.map(a => a.assignedRep)).size, icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' } ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-white/5 p-5 shadow-sm ring-1 ring-black/5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-white/5 shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 hover:bg-slate-50 border-0 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['Company', 'MRR', 'Techs', 'Churn Risk', 'Reason', 'Assigned Rep', 'Action'].map((h, i) => (
                <th key={i} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-slate-100 hover:hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center"><Building2 className="w-4 h-4 text-red-600" /></div>
                      <p className="text-sm font-semibold text-slate-900">{a.companyName}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-5"><span className="text-sm font-semibold text-slate-900">${a.mrr.toLocaleString()}</span></td>
                  <td className="py-3.5 px-5"><span className="text-sm text-slate-400">{a.techCount}</span></td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2"><div className="w-20 h-2 hover:bg-slate-50 rounded-full overflow-hidden"><div className={`h-full rounded-full ${a.churnProbability >= 0.7 ? 'bg-red-500' : a.churnProbability >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: a.churnProbability * 100 + '%'}} /></div><span className="text-xs font-bold text-slate-700">{Math.round(a.churnProbability * 100)}%</span></div>
                  </td>
                  <td className="py-3.5 px-5"><span className="text-sm text-slate-400">{a.reason}</span></td>
                  <td className="py-3.5 px-5"><span className="text-sm font-medium text-slate-700">{a.assignedRep}</span></td>
                  <td className="py-3.5 px-5">
                    <div className="flex gap-2">
                      <button className="h-8 px-3 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors">Contact</button>
                      <button className="h-8 px-3 rounded-lg ring-1 ring-white/5 text-slate-400 text-xs font-medium hover:hover:bg-slate-50 transition-colors">View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
