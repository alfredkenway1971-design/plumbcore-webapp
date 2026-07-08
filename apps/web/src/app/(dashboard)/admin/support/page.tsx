'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building2,
  ChevronDown,
  MoreHorizontal,
  Download,
  Filter,
  XCircle,
  Flag,
  ArrowUp,
  ArrowDown,
  Reply,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { companies } from '@/lib/admin-data';
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

/* ── Mock Data ── */

const mockTickets: SupportTicket[] = [
  {
    id: 'TK-1001',
    subject: 'API downtime affecting job scheduling',
    companyName: 'Metro Mechanical Services',
    status: 'open',
    priority: 'critical',
    assignedAgent: 'Sarah Chen',
    createdDate: '2026-07-06T09:30:00Z',
    lastUpdated: '2026-07-08T14:22:00Z',
    category: 'Technical Issue',
  },
  {
    id: 'TK-1002',
    subject: 'Invoice payment not reflecting in dashboard',
    companyName: 'Johnson Plumbing Co.',
    status: 'in_progress',
    priority: 'high',
    assignedAgent: 'Mike Torres',
    createdDate: '2026-07-07T11:15:00Z',
    lastUpdated: '2026-07-08T10:05:00Z',
    category: 'Billing',
  },
  {
    id: 'TK-1003',
    subject: 'Unable to add new technician account',
    companyName: 'Bluewater Plumbing',
    status: 'in_progress',
    priority: 'high',
    assignedAgent: 'Lisa Park',
    createdDate: '2026-07-07T14:45:00Z',
    lastUpdated: '2026-07-08T09:30:00Z',
    category: 'Account Management',
  },
  {
    id: 'TK-1004',
    subject: 'AI estimate values seem inaccurate',
    companyName: "O'Brien Septic & Drain",
    status: 'open',
    priority: 'medium',
    assignedAgent: 'James Wilson',
    createdDate: '2026-07-08T08:00:00Z',
    lastUpdated: '2026-07-08T08:00:00Z',
    category: 'AI Accuracy',
  },
  {
    id: 'TK-1005',
    subject: 'Request for custom report template',
    companyName: 'Pinnacle Pipe & Drain',
    status: 'resolved',
    priority: 'low',
    assignedAgent: 'Sarah Chen',
    createdDate: '2026-07-05T10:30:00Z',
    lastUpdated: '2026-07-07T16:45:00Z',
    category: 'Feature Request',
  },
  {
    id: 'TK-1006',
    subject: 'SMS notifications not delivering to some customers',
    companyName: 'Apex Pipe & Drain',
    status: 'open',
    priority: 'high',
    assignedAgent: 'Mike Torres',
    createdDate: '2026-07-08T06:15:00Z',
    lastUpdated: '2026-07-08T12:30:00Z',
    category: 'Technical Issue',
  },
  {
    id: 'TK-1007',
    subject: 'Payment method decline loop',
    companyName: 'Central TX Plumbing',
    status: 'open',
    priority: 'critical',
    assignedAgent: 'Lisa Park',
    createdDate: '2026-07-08T07:45:00Z',
    lastUpdated: '2026-07-08T13:10:00Z',
    category: 'Billing',
  },
  {
    id: 'TK-1008',
    subject: 'Need help with inventory setup',
    companyName: 'Flow Right Plumbing',
    status: 'resolved',
    priority: 'low',
    assignedAgent: 'James Wilson',
    createdDate: '2026-07-04T13:00:00Z',
    lastUpdated: '2026-07-06T11:20:00Z',
    category: 'Onboarding',
  },
  {
    id: 'TK-1009',
    subject: 'Mobile app crash on job view',
    companyName: 'City Sewer & Drain',
    status: 'closed',
    priority: 'medium',
    assignedAgent: 'Sarah Chen',
    createdDate: '2026-07-03T15:20:00Z',
    lastUpdated: '2026-07-05T09:00:00Z',
    category: 'Technical Issue',
  },
  {
    id: 'TK-1010',
    subject: 'Bulk import of customer data failed',
    companyName: 'Premier Plumbing Co.',
    status: 'in_progress',
    priority: 'medium',
    assignedAgent: 'Mike Torres',
    createdDate: '2026-07-07T16:30:00Z',
    lastUpdated: '2026-07-08T08:45:00Z',
    category: 'Data Import',
  },
  {
    id: 'TK-1011',
    subject: 'Request for API access documentation',
    companyName: 'Quality Pipe Services',
    status: 'closed',
    priority: 'low',
    assignedAgent: 'Lisa Park',
    createdDate: '2026-07-02T09:00:00Z',
    lastUpdated: '2026-07-04T14:30:00Z',
    category: 'Feature Request',
  },
  {
    id: 'TK-1012',
    subject: 'Trial extension request for evaluation',
    companyName: 'Drain Masters LLC',
    status: 'open',
    priority: 'medium',
    assignedAgent: 'James Wilson',
    createdDate: '2026-07-08T10:00:00Z',
    lastUpdated: '2026-07-08T10:00:00Z',
    category: 'Account Management',
  },
];

/* ── Constants ── */

const priorityConfig: Record<string, { bg: string; text: string; dot: string; icon: any; label: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', icon: AlertTriangle, label: 'Critical' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', icon: ArrowUp, label: 'High' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: ArrowUp, label: 'Medium' },
  low: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', icon: ArrowDown, label: 'Low' },
};

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  open: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Open' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'In Progress' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Resolved' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Closed' },
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
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Skeleton className="h-5 w-44 m-5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-t border-slate-50">
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
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Failed to load support tickets</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
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
  const avgResolution = '2.4h';

  const cards = [
    {
      label: 'Open Tickets',
      value: String(openCount),
      change: `${tickets.filter((t) => t.status === 'open').length} awaiting assignment`,
      trend: 'up' as const,
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      label: 'Critical Priority',
      value: String(criticalCount),
      change: 'requires immediate attention',
      trend: criticalCount > 0 ? ('up' as const) : ('down' as const),
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      label: 'Resolved This Week',
      value: String(resolvedCount),
      change: `avg ${avgResolution} resolution time`,
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
    {
      label: 'Total Tickets',
      value: String(tickets.length),
      change: `${tickets.filter((t) => t.status === 'closed').length} closed`,
      trend: 'up' as const,
      icon: Clock,
      color: 'bg-violet-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isGoodDown = card.label === 'Critical Priority' && card.trend === 'down';
        const isPositive = card.trend === 'up';
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1.5">{card.value}</p>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  isGoodDown || (!isPositive && card.label !== 'Critical Priority')
                    ? 'bg-red-50 text-red-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {card.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Tickets Table ── */

function TicketsTable({
  tickets,
  filters,
}: {
  tickets: SupportTicket[];
  filters: { status: string; priority: string; agent: string; category: string; search: string };
}) {
  const filtered = useMemo(() => {
    let result = [...tickets];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.companyName.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.assignedAgent.toLowerCase().includes(q)
      );
    }
    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.agent) {
      result = result.filter((t) => t.assignedAgent === filters.agent);
    }
    if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }

    result.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return result;
  }, [tickets, filters]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">
          Support Tickets
          <span className="ml-2 text-xs font-normal text-slate-400">({filtered.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Eye className="w-3.5 h-3.5" />
            View All
          </button>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Ticket</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Company</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Priority</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Agent</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Created</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No tickets found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              filtered.map((ticket) => {
                const prioCfg = priorityConfig[ticket.priority];
                const PrioIcon = prioCfg.icon;
                const statCfg = statusConfig[ticket.status];
                const created = new Date(ticket.createdDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                });
                const isNew = Date.now() - new Date(ticket.createdDate).getTime() < 24 * 60 * 60 * 1000;

                return (
                  <tr
                    key={ticket.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${ticket.priority === 'critical' ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-semibold text-slate-400">{ticket.id}</span>
                          {isNew && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{ticket.subject}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-600 truncate max-w-[140px]">{ticket.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-slate-500">{ticket.category}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${prioCfg.bg} ${prioCfg.text}`}
                      >
                        <PrioIcon className="w-3 h-3" />
                        {prioCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="text-xs text-slate-600">{ticket.assignedAgent}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statCfg.bg} ${statCfg.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statCfg.dot}`} />
                        {statCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{created}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3.5">
                      <button className="text-slate-300 hover:text-slate-500 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">Showing {filtered.length} of {tickets.length} tickets</span>
        <div className="flex items-center gap-3">
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700">View Report →</button>
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

  const filters = {
    search,
    status: statusFilter,
    priority: priorityFilter,
    agent: agentFilter,
    category: categoryFilter,
  };

  if (isLoading) return <SupportLoading />;
  if (error) return <SupportError error={error} />;

  const hasFilters = statusFilter || priorityFilter || agentFilter || categoryFilter || search;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mockTickets.length} total tickets · {mockTickets.filter((t) => t.status === 'open').length} open · {mockTickets.filter((t) => t.priority === 'critical').length} critical
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Reply className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">New Ticket</span>
          </button>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
        <div className="p-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Filters:
              </div>

              {/* Status */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Priority */}
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Agent */}
              <div className="relative">
                <select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Agents</option>
                  {agents.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Category */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Clear */}
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setPriorityFilter('');
                    setAgentFilter('');
                    setCategoryFilter('');
                  }}
                  className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 font-medium mr-1">Quick Actions:</span>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition-colors">
          <MessageSquare className="w-3 h-3" />
          View Open
        </button>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold hover:bg-red-100 transition-colors">
          <AlertTriangle className="w-3 h-3" />
          Critical Only
        </button>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 transition-colors">
          <Clock className="w-3 h-3" />
          In Progress
        </button>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition-colors">
          <CheckCircle className="w-3 h-3" />
          Resolved
        </button>
        <button className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold hover:bg-slate-200 transition-colors">
          <User className="w-3 h-3" />
          My Tickets
        </button>
      </div>

      {/* Tickets Table */}
      <TicketsTable tickets={mockTickets} filters={filters} />
    </div>
  );
}
