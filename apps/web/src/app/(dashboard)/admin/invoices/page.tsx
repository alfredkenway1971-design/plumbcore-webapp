'use client';

import { useState, useMemo } from 'react';
import { Search, FileText, Download, Filter, ChevronDown, Building2, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { companies, platformKPIs } from '@/lib/admin-data';
import { downloadCSV } from '@/lib/csv-export';



const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  paid: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
  overdue: { bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-400', icon: XCircle },
};

const generateInvoices = () => {
  const statuses = ['paid', 'pending', 'overdue', 'cancelled'];
  const invoices: any[] = [];
  companies.forEach((c, ci) => {
    for (let i = 0; i < 4; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 5000 + 200);
      invoices.push({
        id: 'INV-' + (800 + ci * 4 + i),
        companyName: c.name,
        companyId: c.id,
        amount,
        status,
        dueDate: new Date(Date.now() + (Math.random() * 30 - 15) * 86400000).toISOString().split('T')[0],
        created: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
      });
    }
  });
  return invoices.sort((a, b) => b.created.localeCompare(a.created));
};

const allInvoices = generateInvoices();

export default function AdminInvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let data = [...allInvoices];
    if (search) data = data.filter(i => i.companyName.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') data = data.filter(i => i.status === statusFilter);
    return data;
  }, [search, statusFilter]);

  const totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const pendingAmount = allInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const overdueAmount = allInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  const handleExport = () => {
    const data: Record<string, any>[] = [];
    downloadCSV(data, "export");
  };
  
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">Platform-wide invoice management</p>
        </div>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[ { label: 'Collected', value: '$' + totalRevenue.toLocaleString(), color: 'text-emerald-600', bg: 'bg-green-50' }, { label: 'Pending', value: '$' + pendingAmount.toLocaleString(), color: 'text-amber-600', bg: 'bg-amber-50' }, { label: 'Overdue', value: '$' + overdueAmount.toLocaleString(), color: 'text-red-600', bg: 'bg-red-50' } ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-black/5 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input placeholder="Search invoices or companies..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 border-0 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'overdue', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-500'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['Invoice', 'Company', 'Amount', 'Status', 'Due Date', 'Created'].map((h, i) => (
                <th key={i} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.slice(0, 25).map(inv => {
                const st = statusStyles[inv.status];
                const StatusIcon = st.icon;
                return (
                  <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" /><span className="text-sm font-semibold text-slate-900">{inv.id}</span></div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-600" /><span className="text-sm text-slate-700">{inv.companyName}</span></div>
                    </td>
                    <td className="py-3.5 px-5"><span className="text-sm font-semibold text-slate-900">${inv.amount.toLocaleString()}</span></td>
                    <td className="py-3.5 px-5"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}><StatusIcon className="w-3 h-3" />{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
                    <td className="py-3.5 px-5"><span className="text-sm text-slate-400">{inv.dueDate}</span></td>
                    <td className="py-3.5 px-5"><span className="text-sm text-slate-500">{inv.created}</span></td>
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
