'use client';

import { useState, useMemo } from 'react';
import {
  Lightbulb,
  MessageSquarePlus,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Loader2,
  Search,
  User,
  Mail,
  Tag,
  FileText,
  ChevronDown,
  ThumbsUp,
} from 'lucide-react';

/* ── Types ── */

interface FeatureRequest {
  id: string;
  name: string;
  email: string;
  title: string;
  description: string;
  category: string;
  status: 'under-review' | 'planned' | 'in-progress' | 'completed' | 'declined';
  votes: number;
  createdAt: string;
}

/* ── Mock Data ── */

const mockRequests: FeatureRequest[] = [
  {
    id: 'FR-001',
    name: 'Mike Johnson',
    email: 'mike@johnsonplumbing.com',
    title: 'Mobile app offline mode for estimates',
    description: 'When working in basements with no signal, we need to be able to create estimates offline and sync when we reconnect.',
    category: 'Mobile App',
    status: 'planned',
    votes: 24,
    createdAt: '2026-07-08',
  },
  {
    id: 'FR-002',
    name: 'Sarah Chen',
    email: 'sarah@apexpipe.com',
    title: 'Bulk SMS send to customers',
    description: 'Ability to send bulk SMS notifications to all customers with open jobs for appointment reminders and promotions.',
    category: 'Communications',
    status: 'in-progress',
    votes: 18,
    createdAt: '2026-07-07',
  },
  {
    id: 'FR-003',
    name: 'James Rodriguez',
    email: 'james@metromechanical.com',
    title: 'QuickBooks Online direct integration',
    description: 'Native syncing with QuickBooks Online for invoices, payments, and customer data without third-party middleware.',
    category: 'Integrations',
    status: 'under-review',
    votes: 31,
    createdAt: '2026-07-06',
  },
  {
    id: 'FR-004',
    name: 'Emily Waters',
    email: 'emily@bluewaterplumbing.com',
    title: 'Customer portal for job tracking',
    description: 'Allow homeowners to log in and see job status, upcoming appointments, and invoice history without calling the office.',
    category: 'Customer Portal',
    status: 'completed',
    votes: 15,
    createdAt: '2026-07-05',
  },
  {
    id: 'FR-005',
    name: 'Steve Mitchell',
    email: 'steve@pinnaclepipe.com',
    title: 'Photo annotation on job reports',
    description: 'Ability to draw arrows, circles, and text annotations on photos taken during jobs to highlight issues for customers.',
    category: 'Mobile App',
    status: 'declined',
    votes: 7,
    createdAt: '2026-07-04',
  },
  {
    id: 'FR-006',
    name: 'Amanda Lee',
    email: 'amanda@flowrightplumbing.com',
    title: 'Recurring maintenance plan automations',
    description: 'Auto-schedule recurring maintenance visits and send reminders without manual entry each month.',
    category: 'Scheduling',
    status: 'under-review',
    votes: 22,
    createdAt: '2026-07-03',
  },
];

/* ── Status Config ── */

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: any; label: string }> = {
  'under-review': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', icon: Clock, label: 'Under Review' },
  planned: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', icon: Lightbulb, label: 'Planned' },
  'in-progress': { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500', icon: ArrowRight, label: 'In Progress' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircle2, label: 'Completed' },
  declined: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', icon: XCircle, label: 'Declined' },
};

const categories = ['Mobile App', 'Communications', 'Integrations', 'Customer Portal', 'Scheduling', 'Reporting', 'Billing'];

const initialForm = { name: '', email: '', title: '', description: '', category: '' };

/* ── Page Component ── */

export default function AdminFeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>(mockRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    let data = [...requests];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') data = data.filter((r) => r.status === statusFilter);
    return data;
  }, [search, statusFilter, requests]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      underReview: requests.filter((r) => r.status === 'under-review').length,
      inProgress: requests.filter((r) => r.status === 'in-progress' || r.status === 'planned').length,
      completed: requests.filter((r) => r.status === 'completed').length,
    };
  }, [requests]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      const newRequest: FeatureRequest = {
        id: `FR-${String(requests.length + 1).padStart(3, '0')}`,
        ...form,
        status: 'under-review',
        votes: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setRequests((prev) => [newRequest, ...prev]);
      setForm(initialForm);
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setShowForm(false);
    }, 800);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Feature Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Collect and manage plumber feature requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
        >
          <MessageSquarePlus className="w-4 h-4" />
          {showForm ? 'Close Form' : 'Submit Request'}
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Requests', value: stats.total, icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Under Review', value: stats.underReview, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Progress', value: stats.inProgress, icon: ArrowRight, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm ring-1 ring-black/5 p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Submission Form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm ring-1 ring-black/5 p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Submit a Feature Request</h2>
              <p className="text-xs text-slate-500">Suggest a new feature or improvement</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-white ring-1 ring-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="e.g. john@company.com"
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-white ring-1 ring-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Feature Title</label>
              <div className="relative">
                <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Offline mode for estimates"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white ring-1 ring-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select
                  required
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-white ring-1 ring-slate-200 text-sm text-slate-900 outline-none appearance-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the feature and how it would help..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-1">
              {submitted && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Request submitted!
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-10 px-5 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Requests Table ── */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm ring-1 ring-black/5 overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white ring-1 ring-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'under-review', 'planned', 'in-progress', 'completed', 'declined'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all capitalize ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s === 'under-review' ? 'Under Review' : s === 'in-progress' ? 'In Progress' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Request</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">From</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Votes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">No feature requests found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or submit a new request</p>
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const statCfg = statusConfig[req.status];
                  const StatusIcon = statCfg.icon;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono font-semibold text-slate-400">{req.id}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 leading-snug">{req.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-[280px]">{req.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {req.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate max-w-[130px]">{req.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-xs text-slate-500">
                          <Tag className="w-3 h-3" />
                          {req.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statCfg.bg} ${statCfg.text}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{req.createdAt}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-xs font-semibold text-slate-600">
                          <ThumbsUp className="w-3 h-3" />
                          {req.votes}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Showing {filtered.length} of {requests.length} requests
          </span>
        </div>
      </div>
    </div>
  );
}
