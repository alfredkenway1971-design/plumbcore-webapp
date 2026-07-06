'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jobs, teamMembers, activities, getStats } from '@/lib/mock-data';
import type { Job } from '@/lib/mock-data';

/* ═══════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════ */
const I = {
  Eye: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Users: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.125-.952A4.125 4.125 0 0019.875 15h-1.5m-6 4.128A9.38 9.38 0 0112 19.5a9.38 9.38 0 01-2.625-.372A4.125 4.125 0 0113.125 15h2.25a4.125 4.125 0 014.125 4.125 9.337 9.337 0 01-4.125.952zM15 9a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Cursor: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"/></svg>,
  Cart: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>,
  Dots: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>,
  Sparkles: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>,
  Zap: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>,
  Send: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>,
  ArrowUp: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>,
  Expand: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>,
  Check: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
};

/* ═══════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════ */
const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-700' },
  'in-progress': { label: 'In Progress', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  urgent: { label: 'Urgent', bg: 'bg-red-50', text: 'text-red-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500' },
};

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
function StatCard({ label, value, change, trend, icon: Icon, iconBg }: {
  label: string; value: string; change: string; trend: { direction: 'up' | 'down'; label: string; color: string };
  icon: any; iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1.5">{value}</p>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trend.color} bg-opacity-10 px-1.5 py-0.5 rounded-full ${trend.direction === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          <I.ArrowUp className={`w-3 h-3 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
          {change}
        </span>
        <span className="text-xs text-slate-400">{trend.label}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REVENUE LINE CHART
   ═══════════════════════════════════════════ */
function RevenueChart() {
  const data = [12, 19, 15, 22, 18, 25, 20, 28, 24, 30, 27, 35, 32, 38, 34, 40, 36, 42, 38, 45, 41, 48, 44, 50, 46, 52, 48, 55, 51, 58];
  const max = Math.max(...data);
  const width = 600, height = 200;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height * 0.85 - 10}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-900">Total Profit</h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <I.ArrowUp className="w-3 h-3" /> 24.4%
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">$446.7K</p>
          <p className="text-xs text-slate-400 mt-0.5">vs. last period</p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <I.Dots className="w-5 h-5" />
        </button>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#revenueGrad)" />
        <polyline points={points} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => i % 5 === 0 && (
          <circle key={i} cx={(i / (data.length - 1)) * width} cy={height - (v / max) * height * 0.85 - 10} r="3" fill="#3B82F6" className="opacity-0 group-hover:opacity-100 transition-opacity" />
        ))}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MOST ACTIVE DAY BAR CHART
   ═══════════════════════════════════════════ */
function ActiveDayChart() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const values = [12, 18, 24, 20, 16, 22, 8];
  const max = Math.max(...values);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Most Active Day</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors"><I.Dots className="w-5 h-5" /></button>
      </div>
      <div className="flex items-end justify-between gap-2 h-32">
        {days.map((day, i) => {
          const isMax = i === 2;
          const h = (values[i] / max) * 100;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-slate-400">{values[i]}</span>
              <div className="w-full rounded-md relative" style={{ height: `${Math.max(h, 4)}%`, backgroundColor: isMax ? '#3B82F6' : '#E2E8F0' }}>
                <div className="absolute inset-0 rounded-md transition-all hover:opacity-80" />
              </div>
              <span className={`text-[11px] font-medium ${isMax ? 'text-blue-600' : 'text-slate-400'}`}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CUSTOMER SEGMENTS
   ═══════════════════════════════════════════ */
function CustomerSegments() {
  const segments = [
    { label: 'Retailers', count: '2,884', pct: 72, color: 'bg-blue-500' },
    { label: 'Distributors', count: '1,432', pct: 48, color: 'bg-emerald-500' },
    { label: 'Wholesalers', count: '562', pct: 24, color: 'bg-amber-500' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Customers</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors"><I.Dots className="w-5 h-5" /></button>
      </div>
      <div className="space-y-4">
        {segments.map((seg) => (
          <div key={seg.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700">{seg.label}</span>
              <span className="text-sm font-semibold text-slate-900">{seg.count}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${seg.color} transition-all duration-500`} style={{ width: `${seg.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REPEAT CUSTOMER RATE (GAUGE)
   ═══════════════════════════════════════════ */
function RepeatRateGauge() {
  const pct = 68;
  const r = 60;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * pct) / 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Repeat Customer Rate</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors"><I.Dots className="w-5 h-5" /></button>
      </div>
      <div className="flex flex-col items-center">
        <svg width="160" height="120" viewBox="0 0 160 140" className="mb-2">
          <path d={`M 20 110 A 60 60 0 1 1 140 110`} fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
          <path d={`M 20 110 A 60 60 0 1 1 140 110`} fill="none" stroke="#3B82F6" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(180 80 80)" />
          <text x="80" y="80" textAnchor="middle" dominantBaseline="central" className="text-3xl font-bold" fill="#0F172A">
            {pct}%
          </text>
          <text x="80" y="105" textAnchor="middle" className="text-xs" fill="#64748B">of customers return</text>
        </svg>
        <p className="text-xs text-slate-500 text-center">On track for 80% target</p>
        <a href="/reports" className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1">Show details →</a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUBSCRIPTION CARD
   ═══════════════════════════════════════════ */
const planLabels: Record<string, string> = {
  solo: 'Solo', team: 'Team', pro: 'Pro', business: 'Business', enterprise: 'Enterprise',
};
const planColors: Record<string, string> = {
  solo: 'from-slate-500 to-slate-600',
  team: 'from-blue-500 to-blue-600',
  pro: 'from-blue-500 via-blue-600 to-cyan-600',
  business: 'from-purple-500 to-purple-600',
  enterprise: 'from-amber-500 to-orange-500',
};
const priceMap: Record<string, number> = {solo:149, team:249, pro:349, business:499};

function UpgradeCard() {
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    // Try to get from zustand store
    import('@/lib/store').then(mod => {
      const state = mod.useAuthStore.getState();
      setCompany(state.company);
    });
  }, []);

  const openBilling = async () => {
    if (!company?.stripe_customer_id) {
      router.push('/billing');
      return;
    }
    setBillingLoading(true);
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: company.stripe_customer_id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setBillingLoading(false);
  };

  const tier: string = company?.subscription_tier || '';
  const status = company?.subscription_status || 'none';
  const label = planLabels[tier] || 'Free';
  const gradient = planColors[tier] || 'from-slate-400 to-slate-500';

  if (!tier || status === 'none') {
    return (
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 p-6 overflow-hidden shadow-md">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-4 backdrop-blur-sm">
            <I.Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Start Your Free Trial!</h3>
          <p className="text-sm text-blue-100 leading-relaxed mb-5">
            Unlock AI photo estimates, voice receptionist, and advanced analytics.
          </p>
          <button onClick={() => router.push('/#pricing')} className="h-10 px-5 rounded-xl bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors shadow-sm active:scale-[0.97]">
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-6 overflow-hidden shadow-md`}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-white/80 uppercase tracking-wider">{status === 'active' ? 'Active' : status}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{label} Plan</h3>
        {tier === 'enterprise' ? (
          <p className="text-sm text-blue-100 mb-4">Custom pricing</p>
        ) : (
          <p className="text-sm text-blue-100 mb-4">${tier ? priceMap[tier] + '/mo' : ''}</p>
        )}
        <div className="flex gap-2">
          <button onClick={openBilling} disabled={billingLoading} className="h-10 px-5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold backdrop-blur-sm transition-all active:scale-[0.97] border border-white/10">
            {billingLoading ? 'Opening...' : 'Manage Plan'}
          </button>
          <button onClick={() => router.push('/billing')} className="h-10 px-5 rounded-xl bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-all active:scale-[0.97]">
            Billing
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AI ASSISTANT WIDGET
   ═══════════════════════════════════════════ */
function AIAssistantWidget() {
  const [input, setInput] = useState('');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">AI Assistant</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors"><I.Expand className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-200">
          <I.Sparkles className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm text-slate-500">Ask me anything about your business</p>
      </div>
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-10 pl-4 pr-10 bg-slate-50 rounded-xl text-sm text-slate-600 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white border border-slate-200 transition-all"
        />
        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors active:scale-90">
          <I.Send className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-1.5">
        {[
          { label: 'Check today\'s schedule', icon: I.Check },
          { label: 'Create invoice for job #1024', icon: I.Check },
        ].map((s) => (
          <button key={s.label} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors text-left">
            <s.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   UPCOMING JOBS TABLE
   ═══════════════════════════════════════════ */
const demoJobs = [
  { id: 'JOB-1001', customer: 'John Smith', address: '123 Oak St, Austin, TX', service: 'Water Heater Repair', tech: 'Mike Torres', status: 'scheduled' as const },
  { id: 'JOB-1002', customer: 'Sarah Johnson', address: '456 Pine Ave, Austin, TX', service: 'Drain Cleaning', tech: 'Alex Chen', status: 'in-progress' as const },
  { id: 'JOB-1003', customer: 'Robert Davis', address: '789 Elm Blvd, Austin, TX', service: 'Pipe Replacement', tech: 'Carlos Ruiz', status: 'scheduled' as const },
  { id: 'JOB-1004', customer: 'Emily Wilson', address: '321 Maple Dr, Austin, TX', service: 'Faucet Installation', tech: 'Mike Torres', status: 'scheduled' as const },
  { id: 'JOB-1005', customer: 'David Brown', address: '654 Cedar Ln, Austin, TX', service: 'Sewer Line Inspection', tech: 'Alex Chen', status: 'in-progress' as const },
];

function UpcomingJobsTable() {
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Upcoming Jobs</h3>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-slate-600 transition-colors"><I.Dots className="w-5 h-5" /></button>
          <a href="/jobs" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All →</a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">ID</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Address</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Service</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Tech</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoJobs.map((job) => {
              const cfg = statusConfig[job.status];
              return (
                <tr
                  key={job.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-slate-900">{job.id}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-slate-700">{job.customer}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-slate-500">{job.address}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-slate-700">{job.service}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        {job.tech.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-slate-600">{job.tech}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <I.Dots className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MOBILE BOTTOM NAV
   ═══════════════════════════════════════════ */
function MobileBottomNav() {
  const items = [
    { icon: I.Eye, label: 'Home', href: '/dashboard', active: true },
    { icon: I.Dots, label: 'Jobs', href: '/jobs', active: false },
    { icon: I.Users, label: 'Add', href: '/jobs/new', active: false, highlight: true },
    { icon: I.Cursor, label: 'Leads', href: '/leads', active: false },
    { icon: I.Cart, label: 'Profile', href: '/settings', active: false },
  ];

  // Simple inline icons for bottom nav
  function SimpleWrench(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z"/></svg>; }
  function SimplePlus(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>; }
  function SimpleStar(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>; }
  function SimpleUsers(p: any) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.125-.952A4.125 4.125 0 0019.875 15h-1.5m-6 4.128A9.38 9.38 0 0112 19.5a9.38 9.38 0 01-2.625-.372A4.125 4.125 0 0113.125 15h2.25a4.125 4.125 0 014.125 4.125 9.337 9.337 0 01-4.125.952zM15 9a3 3 0 11-6 0 3 3 0 016 0z"/></svg>; }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 px-2 pb-safe-area">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 rounded-lg transition-colors ${
              item.highlight
                ? 'relative -top-3'
                : item.active
                ? 'text-blue-500'
                : 'text-slate-400'
            }`}
          >
            {item.highlight ? (
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
                <item.icon className="w-6 h-6 text-white" />
              </div>
            ) : (
              <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-500' : ''}`} />
            )}
            <span className={`text-[10px] font-medium ${item.highlight ? 'text-blue-600' : ''}`}>
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ═══════════════════════════════════════════ */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value="$12,450"
          change="+12%"
          trend={{ direction: 'up', label: 'vs 11,042 last period', color: 'text-emerald-600' }}
          icon={I.Eye} iconBg="bg-blue-500"
        />
        <StatCard
          label="Active Jobs"
          value="24"
          change="8 pending"
          trend={{ direction: 'up', label: 'this week', color: 'text-amber-600' }}
          icon={I.Users} iconBg="bg-violet-500"
        />
        <StatCard
          label="New Leads"
          value="18"
          change="+5 AI"
          trend={{ direction: 'up', label: 'new this week', color: 'text-cyan-600' }}
          icon={I.Cursor} iconBg="bg-cyan-500"
        />
        <StatCard
          label="Completed Jobs"
          value="47"
          change="+4.6%"
          trend={{ direction: 'up', label: 'this month', color: 'text-emerald-600' }}
          icon={I.Cart} iconBg="bg-emerald-500"
        />
      </div>

      {/* ── Row 2: Revenue Chart + Active Day ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <ActiveDayChart />
        </div>
      </div>

      {/* ── Row 3: Customer Segments + Repeat Rate + Upgrade + AI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-1">
          <CustomerSegments />
        </div>
        <div className="lg:col-span-1">
          <RepeatRateGauge />
        </div>
        <div className="lg:col-span-1">
          <UpgradeCard />
        </div>
        <div className="lg:col-span-1">
          <AIAssistantWidget />
        </div>
      </div>

      {/* ── Row 4: Upcoming Jobs Table ── */}
      <UpcomingJobsTable />

      {/* ── Mobile Bottom Nav ── */}
      <MobileBottomNav />
    </div>
  );
}
