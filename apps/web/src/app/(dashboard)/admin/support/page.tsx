'use client';

import { useState } from 'react';
import { MessageSquare, AlertTriangle, Search, Download, Filter, ChevronDown, XCircle, User, Clock, CheckCircle, ArrowUp, ArrowDown, Eye, MoreHorizontal, Reply, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Types ── */

interface SupportTicket {
  id: string;
  subject: string;
  companyName: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedAgent: string;
  createdDate: string;
  lastUpdated: string;
  category: string;
}

const mockTickets: SupportTicket[] = [];

/* ── Constants ── */

const priorityConfig: Record<string, { bg: string; text: string; dot: string; icon: any; label: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', icon: AlertTriangle, label: 'Critical' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', icon: ArrowUp, label: 'High' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', icon: ArrowUp, label: 'Medium' },
  low: { bg: 'bg-muted', text: 'text-muted-foreground/80', dot: 'bg-slate-400', icon: ArrowDown, label: 'Low' },
};

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  open: { bg: 'bg-blue-50', text: 'text-primary', dot: 'bg-blue-500', label: 'Open' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'In Progress' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Resolved' },
  closed: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-slate-400', label: 'Closed' },
};

const agents = ['Sarah Chen', 'Mike Torres', 'Lisa Park', 'James Wilson'];
const categories = ['Technical Issue', 'Billing', 'Account Management', 'AI Accuracy', 'Feature Request', 'Onboarding', 'Data Import'];

/* ── Loading State ── */

function SupportLoading() {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm ring-1 ring-black/5">
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
        <Skeleton className="h-5 w-44 m-5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-t border-border/50">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-48 flex-1" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Error State ── */

function SupportError({ error }: { error: string }) {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm ring-1 ring-black/5 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Failed to load support tickets</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-primary transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/* ── KPI Cards ── */

function SupportKPIs({ tickets }: { tickets: SupportTicket[] }) {
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const criticalCount = tickets.filter((t) => t.priority === 'critical').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  const cards = [
    { label: 'Open Tickets', value: String(openCount), change: `${tickets.filter((t) => t.status === 'open').length} awaiting assignment`, trend: 'up' as const, icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'Critical Priority', value: String(criticalCount), change: 'requires immediate attention', trend: criticalCount > 0 ? ('up' as const) : ('down' as const), icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Resolved This Week', value: String(resolvedCount), change: 'avg — resolution time', trend: 'up' as const, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Total Tickets', value: String(tickets.length), change: `${tickets.filter((t) => t.status === 'closed').length} closed`, trend: 'up' as const, icon: Clock, color: 'bg-violet-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1.5">{card.value}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{card.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Empty State ── */

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="w-7 h-7 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No support tickets yet</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        When plumbers submit support requests, they'll appear here with priority levels, status tracking, and agent assignments.
      </p>
    </div>
  );
}

/* ── Tickets Table with Mobile Cards ── */

function TicketsTable({ tickets, filters }: {
  tickets: SupportTicket[];
  filters: { status: string; priority: string; agent: string; category: string; search: string };
}) {
  const filtered = tickets;

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">
          Support Tickets
          <span className="ml-2 text-xs font-normal text-muted-foreground">({filtered.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground/80 hover:bg-muted transition-colors">
            <Eye className="w-3.5 h-3.5" />
            View All
          </button>
          <button className="text-muted-foreground hover:text-muted-foreground/80 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-border/50">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Ticket</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Company</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Priority</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Agent</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Created</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              filtered.map((ticket) => {
                const prioCfg = priorityConfig[ticket.priority];
                const PrioIcon = prioCfg.icon;
                const statCfg = statusConfig[ticket.status];
                const created = new Date(ticket.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                return (
                  <tr key={ticket.id} className={`border-b border-border/50 hover:bg-muted transition-colors ${ticket.priority === 'critical' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-semibold text-muted-foreground">{ticket.id}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{ticket.subject}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground/80 truncate max-w-[140px]">{ticket.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><span className="text-xs text-muted-foreground">{ticket.category}</span></td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${prioCfg.bg} ${prioCfg.text}`}>
                        <PrioIcon className="w-3 h-3" />{prioCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center"><User className="w-3 h-3 text-muted-foreground" /></div>
                        <span className="text-xs text-muted-foreground/80">{ticket.assignedAgent}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statCfg.bg} ${statCfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statCfg.dot}`} />{statCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{created}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3.5">
                      <button className="text-foreground hover:text-muted-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {filtered.length > 0 && (
        <div className="sm:hidden space-y-2 p-4">
          {filtered.map((ticket) => {
            const prioCfg = priorityConfig[ticket.priority];
            const PrioIcon = prioCfg.icon;
            const statCfg = statusConfig[ticket.status];
            const created = new Date(ticket.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <div key={ticket.id} className="bg-white rounded-xl border border-border p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground">{ticket.id}</span>
                    <p className="text-sm font-medium text-foreground mt-0.5">{ticket.subject}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statCfg.bg} ${statCfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statCfg.dot}`} />{statCfg.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Building2 className="w-3 h-3" />{ticket.companyName}</div>
                  <div className="flex items-center gap-1"><span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${prioCfg.bg} ${prioCfg.text}`}><PrioIcon className="w-2.5 h-2.5" />{prioCfg.label}</span></div>
                  <div className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.assignedAgent}</div>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{created}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground">Showing {filtered.length} of {tickets.length} tickets</span>
        <div className="flex items-center gap-3">
          <button className="text-xs font-medium text-primary hover:text-primary">View Report →</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function AdminSupportPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [agentFilter, setAgentFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filters = { search, status: statusFilter, priority: priorityFilter, agent: agentFilter, category: categoryFilter };

  if (isLoading) return <SupportLoading />;
  if (error) return <SupportError error={error} />;

  const hasFilters = statusFilter || priorityFilter || agentFilter || categoryFilter || search;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            0 total tickets · 0 open · 0 critical
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground/80 hover:bg-muted transition-colors">
            <Reply className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">New Ticket</span>
          </button>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-primary transition-colors shadow-sm ring-1 ring-black/5">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6">
        <SupportKPIs tickets={mockTickets} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm ring-1 ring-black/5 mb-4">
        <div className="p-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-blue-400 transition-all" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-muted-foreground"><XCircle className="w-4 h-4" /></button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1"><Filter className="w-3.5 h-3.5" />Filters:</div>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-border text-xs font-medium text-muted-foreground/80 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">All Statuses</option>
                  <option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-border text-xs font-medium text-muted-foreground/80 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">All Priorities</option>
                  <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-border text-xs font-medium text-muted-foreground/80 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">All Agents</option>
                  {agents.map((a) => (<option key={a} value={a}>{a}</option>))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-border text-xs font-medium text-muted-foreground/80 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option value="">All Categories</option>
                  {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
              {hasFilters && (
                <button onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setAgentFilter(''); setCategoryFilter(''); }} className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Clear</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground font-medium mr-1">Quick Actions:</span>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-blue-50 text-primary text-[11px] font-semibold hover:bg-blue-100 transition-colors"><MessageSquare className="w-3 h-3" />View Open</button>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold hover:bg-red-100 transition-colors"><AlertTriangle className="w-3 h-3" />Critical Only</button>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-amber-50 text-amber-600 text-[11px] font-semibold hover:bg-amber-100 transition-colors"><Clock className="w-3 h-3" />In Progress</button>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition-colors"><CheckCircle className="w-3 h-3" />Resolved</button>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-muted text-muted-foreground/80 text-[11px] font-semibold hover:bg-slate-700 transition-colors"><User className="w-3 h-3" />My Tickets</button>
      </div>

      {/* Tickets Table */}
      <TicketsTable tickets={mockTickets} filters={filters} />
    </div>
  );
}
