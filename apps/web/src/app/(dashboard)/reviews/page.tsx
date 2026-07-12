'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { canAccess } from '@/lib/feature-gates';
import type { PlanTier } from '@/lib/feature-gates';
import {
  getReviewRequests,
  getReviewsThisMonth,
  getTechLeaderboard,
  getCompletedJobsWithoutReview,
  createReviewRequest,
  generateReviewMessage,
} from '@/lib/reviewsDb';
import { jobs as mockJobs, clients as mockClients, teamMembers as mockTeam } from '@/lib/mock-data';
import type { ReviewRequest, TechReviewScore } from '@/lib/reviewsDb';

/* ── Icons ── */
const I = {
  Star: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  StarFill: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
  Send: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>,
  Check: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  Clock: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  ArrowUp: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>,
  ArrowDown: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6.75-6.75M12 19.5l6.75-6.75"/></svg>,
  External: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>,
  Search: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>,
  X: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  Sparkles: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>,
  Users: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.125-.952A4.125 4.125 0 0019.875 15h-1.5m-6 4.128A9.38 9.38 0 0112 19.5a9.38 9.38 0 01-2.625-.372A4.125 4.125 0 0113.125 15h2.25a4.125 4.125 0 014.125 4.125 9.337 9.337 0 01-4.125.952zM15 9a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
};

/* ── Status Config ── */
const statusConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', icon: I.Clock },
  sent: { label: 'Sent', bg: 'bg-blue-50', text: 'text-blue-700', icon: I.Send },
  clicked: { label: 'Clicked', bg: 'bg-cyan-50', text: 'text-cyan-700', icon: I.External },
  submitted: { label: 'Submitted', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: I.Check },
};

/* ── Star Rating Component ── */
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <I.StarFill
          key={star}
          className={`${sizeClass} ${star <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

/* ── Page Component ── */
export default function ReviewsPage() {
  const company = useAuthStore(s => s.company);
  const tier = (company?.subscription_tier || '') as PlanTier;
  const hasAccess = canAccess(tier, 'reviewAutomation');

  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [stats, setStats] = useState({ count: 0, avgRating: 0, lastMonthCount: 0, lastMonthRating: 0 });
  const [leaderboard, setLeaderboard] = useState<TechReviewScore[]>([]);
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getReviewsThisMonth();
    const lb = getTechLeaderboard();
    const pending = getCompletedJobsWithoutReview();
    setStats(s);
    setLeaderboard(lb);
    setPendingJobs(pending);
    setReviewRequests(getReviewRequests());
  }, []);

  const filteredRequests = reviewRequests.filter(r => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.techName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSendReview = async (job: any) => {
    setSelectedJob(job);
    setShowSendModal(true);
  };

  const confirmSend = async () => {
    if (!selectedJob) return;
    setSending(true);
    setError(null);

    try {
      // Find the client and job IDs from mock data
      const client = mockClients.find(c => c.name === selectedJob.clientName);
      const job = mockJobs.find(j => j.id === selectedJob.id);
      const clientId = client?.id || selectedJob.clientName;

      const message = generateReviewMessage(
        selectedJob.title,
        selectedJob.clientName,
        selectedJob.techName
      );

      await createReviewRequest(
        selectedJob.id,
        clientId,
        selectedJob.techId,
        message,
        company?.id
      );

      setSendSuccess(`Review request sent to ${selectedJob.clientName} for ${selectedJob.title}`);
      setShowSendModal(false);
      setSelectedJob(null);

      // Refresh data
      setStats(getReviewsThisMonth());
      setLeaderboard(getTechLeaderboard());
      setPendingJobs(getCompletedJobsWithoutReview());
      setReviewRequests(getReviewRequests());
    } catch (e: any) {
      setError(e.message || 'Failed to send review request');
    } finally {
      setSending(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <I.Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Review Automation</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Review Automation is available on the <strong>Pro</strong> plan and above.
              Auto-request Google reviews after job completion and track performance by technician.
            </p>
            <a
              href="/settings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Reviews</h1>
            <p className="text-sm text-slate-500 mt-1">Manage review requests and track performance</p>
          </div>
          {sendSuccess && (
            <div className="w-full sm:w-auto flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-sm">
              <I.Check className="w-4 h-4 shrink-0" />
              <span className="flex-1">{sendSuccess}</span>
              <button onClick={() => setSendSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
                <I.X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">Reviews This Month</p>
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <I.Star className="w-5 h-5 text-slate-900" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1.5">{stats.count}</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full
                ${stats.count >= stats.lastMonthCount ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <I.ArrowUp className={`w-3 h-3 ${stats.count < stats.lastMonthCount ? 'rotate-180' : ''}`} />
                {stats.count - stats.lastMonthCount >= 0 ? '+' : ''}{stats.count - stats.lastMonthCount}
              </span>
              <span className="text-xs text-slate-400">vs last month ({stats.lastMonthCount})</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">Average Rating</p>
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <I.StarFill className="w-5 h-5 text-slate-900" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1.5">{stats.avgRating || '—'}</p>
            {stats.avgRating > 0 && <StarRating rating={stats.avgRating} size="md" />}
            <p className="text-xs text-slate-400 mt-1">
              {stats.lastMonthRating > 0
                ? `vs ${stats.lastMonthRating} last month`
                : 'No ratings yet this month'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">Response Rate</p>
              <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
                <I.Users className="w-5 h-5 text-slate-900" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1.5">
              {reviewRequests.length > 0
                ? Math.round((reviewRequests.filter(r => r.reviewLinkClicked || r.reviewSubmitted).length / reviewRequests.length) * 100)
                : 0}%
            </p>
            <p className="text-xs text-slate-400">
              {reviewRequests.filter(r => r.reviewLinkClicked || r.reviewSubmitted).length} of {reviewRequests.length} requests clicked
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">Pending Requests</p>
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <I.Clock className="w-5 h-5 text-slate-900" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1.5">{pendingJobs.length}</p>
            <p className="text-xs text-slate-400">Completed jobs without reviews</p>
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Tech Leaderboard ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Tech Leaderboard</h2>
                <p className="text-xs text-slate-400 mt-0.5">Average rating & response rate</p>
              </div>
              <div className="divide-y divide-slate-50">
                {leaderboard.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-slate-400">
                    No reviews submitted yet
                  </div>
                )}
                {leaderboard.map((tech, idx) => (
                  <div key={tech.techId} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${idx === 0 ? 'bg-amber-100 text-amber-700' :
                          idx === 1 ? 'bg-slate-100 text-slate-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-50 text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{tech.techName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating rating={tech.avgRating} />
                          <span className="text-xs text-slate-400">({tech.avgRating})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{tech.totalReviews}</p>
                        <p className="text-xs text-slate-400">{tech.responseRate}% resp.</p>
                      </div>
                    </div>
                    {/* Progress bar for response rate */}
                    <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${tech.responseRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Send Review Request Panel ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mt-6">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Send Review Request</h2>
                <p className="text-xs text-slate-400 mt-0.5">Completed jobs ready for review</p>
              </div>
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {pendingJobs.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-slate-400">
                    <I.Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    All completed jobs have review requests
                  </div>
                )}
                {pendingJobs.map(job => (
                  <div key={job.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                        <p className="text-xs text-slate-500 truncate">{job.clientName} · {job.techName}</p>
                      </div>
                      <button
                        onClick={() => handleSendReview(job)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <I.Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Review Request Log ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Review Request Log</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{reviewRequests.length} total requests</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <I.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full sm:w-48 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="sent">Sent</option>
                      <option value="clicked">Clicked</option>
                      <option value="submitted">Submitted</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table - Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Job</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tech</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                          No review requests found
                        </td>
                      </tr>
                    )}
                    {filteredRequests.map(req => {
                      const sc = statusConfig[req.status];
                      const StatusIcon = sc?.icon;
                      return (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-900">{req.customerName}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-700">{req.jobTitle}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-700">{req.techName}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc?.bg} ${sc?.text}`}>
                              {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                              {sc?.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {req.rating ? (
                              <div className="flex items-center gap-1.5">
                                <StarRating rating={req.rating} />
                                <span className="text-xs text-slate-400">{req.rating}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-slate-500">
                              {req.sentAt ? new Date(req.sentAt).toLocaleDateString() : 'Not sent'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Card list - Mobile */}
              <div className="sm:hidden divide-y divide-slate-50">
                {filteredRequests.length === 0 && (
                  <div className="px-5 py-12 text-center text-sm text-slate-400">
                    No review requests found
                  </div>
                )}
                {filteredRequests.map(req => {
                  const sc = statusConfig[req.status];
                  const StatusIcon = sc?.icon;
                  return (
                    <div key={req.id} className="px-5 py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{req.customerName}</p>
                        {req.rating ? (
                          <StarRating rating={req.rating} />
                        ) : (
                          <span className="text-xs text-slate-300">No rating</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">{req.jobTitle} · {req.techName}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc?.bg} ${sc?.text}`}>
                          {StatusIcon && <StatusIcon className="w-3 h-3" />}
                          {sc?.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {req.sentAt ? `Sent ${new Date(req.sentAt).toLocaleDateString()}` : 'Not sent'}
                      </p>
                      {req.reviewText && (
                        <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl">
                          &ldquo;{req.reviewText}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Send Review Modal ── */}
      {showSendModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={() => { if (!sending) { setShowSendModal(false); setSelectedJob(null); } }}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Send Review Request</h3>
              <button
                onClick={() => { setShowSendModal(false); setSelectedJob(null); }}
                disabled={sending}
                className="text-slate-400 hover:text-slate-600"
              >
                <I.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Job</span>
                  <span className="font-medium text-slate-900">{selectedJob.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-medium text-slate-900">{selectedJob.clientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Technician</span>
                  <span className="font-medium text-slate-900">{selectedJob.techName}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <I.Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-1">AI-Generated Message</p>
                    <p className="text-sm text-blue-900">
                      {generateReviewMessage(selectedJob.title, selectedJob.clientName, selectedJob.techName)}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowSendModal(false); setSelectedJob(null); }}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSend}
                  disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <I.Send className="w-4 h-4" />
                      Send Review Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
