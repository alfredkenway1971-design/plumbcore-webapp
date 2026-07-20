'use client';

import { useState, useMemo } from 'react';
import { Search, FileText, Download, Building2, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { downloadCSV } from '@/lib/csv-export';

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  paid: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
  overdue: { bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
  cancelled: { bg: 'bg-muted', text: 'text-muted-foreground/80', icon: XCircle },
};

const allInvoices: any[] = [];

export default function AdminInvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let data = [...allInvoices];
    if (search) data = data.filter((i: any) => i.companyName.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') data = data.filter((i: any) => i.status === statusFilter);
    return data;
  }, [search, statusFilter]);

  const handleExport = () => {
    downloadCSV([], "export");
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform-wide invoice management</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Collected', value: '$0', color: 'text-emerald-600', bg: 'bg-green-50' },
          { label: 'Pending', value: '$0', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Overdue', value: '$0', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-black/5 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input readOnly placeholder="Search invoices or companies..." className="w-full h-10 pl-10 pr-4 border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/80 outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'overdue', 'cancelled'].map((s: any) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="px-5 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-tint flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No invoices yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            When plumbers complete jobs and generate invoices, they'll appear here with status tracking for collected, pending, and overdue amounts.
          </p>
        </div>
      </div>
    </div>
  );
}
