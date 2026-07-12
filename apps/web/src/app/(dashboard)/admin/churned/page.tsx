import { useState, useMemo } from 'react';
import { Search, Building2, XCircle, TrendingDown, Download, ArrowDown, Clock, AlertTriangle } from 'lucide-react';
import { companies, platformKPIs } from '@/lib/admin-data';
import { downloadCSV } from '@/lib/csv-export';



const churnReasons = ['Price too high', 'Missing features', 'Poor support', 'No longer needed', 'Switched competitor', 'Budget cuts'];
const churnedData = companies.filter(c => c.status === 'cancelled').length > 0 ? companies.filter(c => c.status === 'cancelled').map(c => ({ ...c, churnReason: churnReasons[Math.floor(Math.random() * churnReasons.length)], churnDate: '2026-06-' + (10 + Math.floor(Math.random() * 20)), lastPayment: c.totalPaid })) : [
  { id: 'ch-001', name: 'McKenzie Mechanical', mrr: 2499, techCount: 8, planTier: 'pro', churnReason: 'Price too high', churnDate: '2026-06-15', lastPayment: 12495, city: 'Austin', state: 'TX' },
  { id: 'ch-002', name: 'Central TX Plumbing', mrr: 999, techCount: 4, planTier: 'solo', churnReason: 'Switched competitor', churnDate: '2026-06-22', lastPayment: 6993, city: 'Waco', state: 'TX' },
  { id: 'ch-003', name: 'Rapid Rooter Services', mrr: 1499, techCount: 6, planTier: 'team', churnReason: 'No longer needed', churnDate: '2026-05-08', lastPayment: 8994, city: 'Houston', state: 'TX' },
  { id: 'ch-004', name: 'Apex Septic & Water', mrr: 999, techCount: 3, planTier: 'solo', churnReason: 'Budget cuts', churnDate: '2026-04-30', lastPayment: 4995, city: 'San Antonio', state: 'TX' },
  { id: 'ch-005', name: 'Quality Pipe Services', mrr: 4999, techCount: 25, planTier: 'enterprise', churnReason: 'Missing features', churnDate: '2026-06-01', lastPayment: 44991, city: 'Dallas', state: 'TX' },
  { id: 'ch-006', name: 'Flow Right Plumbing', mrr: 999, techCount: 2, planTier: 'solo', churnReason: 'Poor support', churnDate: '2026-05-18', lastPayment: 3996, city: 'El Paso', state: 'TX' },
  { id: 'ch-007', name: 'Lone Star Drains', mrr: 2499, techCount: 12, planTier: 'pro', churnReason: 'Price too high', churnDate: '2026-04-12', lastPayment: 14994, city: 'Fort Worth', state: 'TX' },
];

const reasonColors: Record<string, string> = {
  'Price too high': 'bg-red-50 text-red-700',
  'Missing features': 'bg-amber-50 text-amber-600',
  'Poor support': 'bg-orange-500/10 text-orange-300',
  'No longer needed': 'bg-slate-100 text-slate-400',
  'Switched competitor': 'bg-purple-500/10 text-purple-300',
  'Budget cuts': 'bg-blue-50 text-blue-300',
};


  const handleExport = () => {
    const data: Record<string, any>[] = [];
    const labels: Record<string, string> = { companyName: 'Company', planTier: 'Plan', churnDate: 'Churn Date', reason: 'Reason' };
    downloadCSV(data, 'churned_accounts', labels);
  };

export default function AdminChurnedAccountsPage() {
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');

  const filtered = useMemo(() => {
    let data = [...churnedData];
    if (search) data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (reasonFilter !== 'all') data = data.filter(c => c.churnReason === reasonFilter);
    return data;
  }, [search, reasonFilter]);

  const totalLostMrr = churnedData.reduce((s, c) => s + c.mrr, 0);

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Churned Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Lost accounts and churn analysis</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white ring-1 ring-white/5 text-sm font-medium text-slate-700 hover:hover:bg-slate-50 transition-all shadow-sm ring-1 ring-black/5">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[ { label: 'Total Churned', value: churnedData.length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }, { label: 'MRR Lost', value: '$' + totalLostMrr.toLocaleString(), icon: ArrowDown, color: 'text-red-600', bg: 'bg-red-50' }, { label: 'Churn Rate', value: '2.1%', icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' }, { label: 'Avg Lifetime', value: '14 mo', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' } ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-white/5 p-5 shadow-sm ring-1 ring-black/5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-white/5 shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 hover:bg-slate-50 border-0 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setReasonFilter('all')} className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all ${reasonFilter === 'all' ? 'bg-slate-700 text-slate-900' : 'hover:bg-slate-50 text-slate-400 hover:bg-white/[0.05]'}`}>All</button>
            {churnReasons.map(r => (
              <button key={r} onClick={() => setReasonFilter(r)} className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all ${reasonFilter === r ? 'bg-slate-700 text-slate-900' : 'hover:bg-slate-50 text-slate-400 hover:bg-white/[0.05]'}`}>{r}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['Company', 'Plan', 'MRR Lost', 'Churn Date', 'Reason', 'Last Payment'].map((h, i) => (
                <th key={i} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center"><Building2 className="w-4 h-4 text-slate-500" /></div>
                      <div><p className="text-sm font-semibold text-slate-900">{c.name}</p><p className="text-xs text-slate-600">{c.city}, {c.state}</p></div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5"><span className="text-sm font-medium text-slate-700">{c.planTier?.charAt(0).toUpperCase() + (c.planTier?.slice(1) || '')}</span></td>
                  <td className="py-3.5 px-5"><span className="text-sm font-semibold text-red-600">-${c.mrr.toLocaleString()}/mo</span></td>
                  <td className="py-3.5 px-5"><span className="text-sm text-slate-400">{c.churnDate}</span></td>
                  <td className="py-3.5 px-5"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${reasonColors[c.churnReason] || 'hover:bg-slate-50 text-slate-400'}`}>{c.churnReason}</span></td>
                  <td className="py-3.5 px-5"><span className="text-sm font-medium text-slate-700">${c.lastPayment.toLocaleString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
