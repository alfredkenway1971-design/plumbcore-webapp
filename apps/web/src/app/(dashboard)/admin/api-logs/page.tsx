'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download, Clock, CheckCircle, XCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { downloadCSV } from '@/lib/csv-export';

const statusStyles: Record<number, { bg: string; text: string; icon: any }> = {
  200: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  201: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  400: { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertTriangle },
  401: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  403: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  404: { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertTriangle },
  500: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

const generateLogs = () => {
  const endpoints = ['/api/ai/analyze-photo', '/api/auth/google', '/api/auth/login', '/api/auth/signup', '/api/ai/chat', '/api/create-checkout-session', '/api/webhooks/stripe', '/api/translations', '/api/admin/data', '/api/ai/voice-to-job'];
  const methods = ['GET', 'POST', 'DELETE'];
  const statusCodes = [200, 200, 200, 200, 200, 201, 400, 401, 403, 404, 500];
  const logs: any[] = [];
  for (let i = 0; i < 50; i++) {
    const status = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    logs.push({
      id: 'log-' + (i + 1).toString().padStart(4, '0'),
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
      method: methods[Math.floor(Math.random() * methods.length)],
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      status,
      latency: status >= 400 ? Math.floor(Math.random() * 2000 + 500) : Math.floor(Math.random() * 300 + 20),
      ip: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
    });
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const apiLogs = generateLogs();

export default function AdminApiLogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let data = [...apiLogs];
    if (search) data = data.filter(l => l.endpoint.toLowerCase().includes(search.toLowerCase()) || l.ip.includes(search));
    if (statusFilter !== 'all') {
      if (statusFilter === '2xx') data = data.filter(l => l.status >= 200 && l.status < 300);
      else if (statusFilter === '4xx') data = data.filter(l => l.status >= 400 && l.status < 500);
      else if (statusFilter === '5xx') data = data.filter(l => l.status >= 500);
      else data = data.filter(l => l.status === parseInt(statusFilter));
    }
    if (methodFilter !== 'all') data = data.filter(l => l.method === methodFilter);
    return data;
  }, [search, statusFilter, methodFilter]);

  const totalRequests = apiLogs.length;
  const errorRate = Math.round(apiLogs.filter(l => l.status >= 400).length / totalRequests * 100);
  const avgLatency = Math.round(apiLogs.reduce((s, l) => s + l.latency, 0) / totalRequests);

  const handleExport = () => {
    const data: Record<string, any>[] = [];
    downloadCSV(data, "export");
  };
  
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">API Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor API requests and diagnose issues</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white ring-1 ring-border text-sm font-medium text-foreground hover:bg-muted transition-all">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white ring-1 ring-border text-sm font-medium text-foreground hover:bg-muted transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[ { label: 'Total Requests', value: totalRequests, color: 'text-primary', bg: 'bg-blue-tint' }, { label: 'Error Rate', value: errorRate + '%', color: errorRate > 5 ? 'text-red-500' : 'text-emerald-500', bg: errorRate > 5 ? 'bg-red-50' : 'bg-emerald-50' }, { label: 'Avg Latency', value: avgLatency + 'ms', color: 'text-purple-500', bg: 'bg-purple-50' } ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-border p-4 shadow-sm ring-1 ring-black/5 text-center">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input placeholder="Search endpoints or IPs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 hover:bg-muted border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2">
            {['all', 'GET', 'POST', 'DELETE'].map(m => (
              <button key={m} onClick={() => setMethodFilter(m)} className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all ${methodFilter === m ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}>{m === 'all' ? 'All' : m}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border/50">
              {['Time', 'Method', 'Endpoint', 'Status', 'Latency', 'IP'].map((h, i) => (
                <th key={i} className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(l => {
                const s = statusStyles[l.status] || { bg: 'hover:bg-muted', text: 'text-muted-foreground/80', icon: Clock };
                const StatusIcon = s.icon;
                return (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-muted transition-colors font-mono text-xs">
                    <td className="py-3 px-5 text-muted-foreground">{new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-5"><span className={`font-semibold ${l.method === 'GET' ? 'text-primary' : l.method === 'POST' ? 'text-emerald-600' : 'text-red-600'}`}>{l.method}</span></td>
                    <td className="py-3 px-5"><span className="text-foreground">{l.endpoint}</span></td>
                    <td className="py-3 px-5"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${s.bg} ${s.text}`}><StatusIcon className="w-3 h-3" />{l.status}</span></td>
                    <td className="py-3 px-5"><span className={`${l.latency > 1000 ? 'text-red-600' : l.latency > 500 ? 'text-amber-600' : 'text-muted-foreground'}`}>{l.latency}ms</span></td>
                    <td className="py-3 px-5 text-muted-foreground">{l.ip}</td>
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
