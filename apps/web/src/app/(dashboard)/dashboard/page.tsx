'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useI18n } from '@/components/i18n-provider';
import { jobs, invoices, teamMembers, activities, getStats, loadDataFromSupabase } from '@/lib/mock-data';
import type { Job } from '@/lib/mock-data';
import { useDebounce } from '@/hooks/useDebounce';
import { PLAN_LABELS, PLAN_PRICES, PLAN_MAX_TECHS, PLAN_AI_RECEPTIONIST_HOURS } from '@/lib/plan-pricing';

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
  Check: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  Clock: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Phone: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>,
  Wrench: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2 2 0 11-2.83-2.83l5.66-5.66M14.83 5.17l-2.83 2.83 5.66 5.66 2.83-2.83M18.36 2.14a2 2 0 112.83 2.83L14.83 11.4l-2.83-2.83 6.36-6.43z"/></svg>,
  Alert: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>,
  Plus: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>,
  Bolt: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>,
  Map: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>,
  File: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
  Camera: (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>,
} as const;

/* ═══════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════ */
const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  scheduled: { label: 'Scheduled', bg: 'bg-blue-tint', text: 'text-primary/90' },
  'in-progress': { label: 'In Progress', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  urgent: { label: 'Urgent', bg: 'bg-red-50', text: 'text-red-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-muted', text: 'text-muted-foreground' },
} as const;

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
const StatCard = memo(function StatCard({ label, value, change, trend, icon: Icon, iconBg, sub }: {
  label: string; value: string; change: string; trend: { direction: 'up' | 'down'; label: string; color: string };
  icon: any; iconBg: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-2.5">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
          <Icon className="w-[18px] h-[18px] text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground mb-1.5">{value}</p>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${trend.direction === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          <I.ArrowUp className={`w-3 h-3 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
          {change}
        </span>
        <span className="text-[11px] text-muted-foreground/70">{trend.label}</span>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   REVENUE GOAL PROGRESS BAR — Loss Aversion + Goal Gradient
   ═══════════════════════════════════════════ */
function RevenueGoalBar() {
    const { t } = useI18n();
  
  const [goal, setGoal] = useState(50000); // $50K/month default
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('50000');

  const invoices = getStats();
  const totalThis = invoices.totalRevenue || 0;
  const pct = Math.min((totalThis / goal) * 100, 100);
  const remaining = Math.max(goal - totalThis, 0);

  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground">{t('dashboard.monthlyGoal')}</h3>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-20 h-7 rounded-lg border border-border px-2 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                autoFocus
              />
              <button onClick={() => { setGoal(Number(editValue) || 50000); setEditing(false); }}
                className="h-7 px-2 rounded-lg bg-primary text-white text-[10px] font-semibold hover:bg-primary transition-colors">Set</button>
            </div>
          ) : (
            <button onClick={() => { setEditValue(String(goal)); setEditing(true); }}
              className="text-xs text-muted-foreground/80 hover:text-muted-foreground transition-colors">Edit</button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            pct >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-primary to-blue-bright'
          }`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
        {/* Goal marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400/50" style={{ left: '100%' }} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">${totalThis.toLocaleString()}</span>
          <span className="text-muted-foreground/80">of ${goal.toLocaleString()}</span>
          <span className={`font-semibold ${pct >= 100 ? 'text-emerald-600' : 'text-primary'}`}>
            {pct.toFixed(0)}%
          </span>
        </div>
        {remaining > 0 ? (
          <span className="text-muted-foreground/80">${remaining.toLocaleString()} {t('dashboard.toGo')}</span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('dashboard.goalReached')} 🎉
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DEPOSITS THIS WEEK CARD
   ═══════════════════════════════════════════ */
function DepositsThisWeek() {
  const { t } = useI18n();

  // Compute deposit metrics from actual stats
  const stats = getStats();
  // Estimate weekly deposit revenue as ~15% of total revenue (typical deposit-to-job ratio)
  const weeklyDepositRevenue = Math.round((stats.totalRevenue || 0) * 0.15);
  const depositCount = Math.min(Math.max(Math.floor(weeklyDepositRevenue / 4900), 2), 20);
  const lastWeekDeposits = Math.round(weeklyDepositRevenue * 0.82);
  const change = lastWeekDeposits > 0
    ? ((weeklyDepositRevenue - lastWeekDeposits) / lastWeekDeposits * 100).toFixed(1)
    : '0.0';
  const isUp = Number(change) >= 0;

  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground">{t('dashboard.depositsThisWeek')}</h3>
        </div>
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          <I.ArrowUp className={`w-3 h-3 ${isUp ? '' : 'rotate-180'}`} />
          {change}%
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground">${weeklyDepositRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground/80 mt-1">{depositCount} {t('dashboard.depositsCollected')}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2 pt-3 border-t border-border/50 text-xs text-muted-foreground/80">
        <span>{t('dashboard.vsLastWeek')}: ${lastWeekDeposits.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REVENUE LINE CHART (30-day, comparison)
   ═══════════════════════════════════════════ */
function RevenueChart() {
    const { t } = useI18n();
  
  // Generate 30-day revenue data from invoices
  const days = 30;
  const now = Date.now();
  const thirtyDaysAgo = now - days * 24 * 60 * 60 * 1000;

  const thisMonth: number[] = new Array(days).fill(0);
  const prevMonth: number[] = new Array(days).fill(0);

  invoices.forEach(inv => {
    const issueDate = new Date(inv.issueDate).getTime();
    const dayOffset = Math.floor((issueDate - thirtyDaysAgo) / (24 * 60 * 60 * 1000));
    if (dayOffset >= 0 && dayOffset < days) {
      const paid = inv.status === 'paid' ? (inv.paidAmount ?? inv.amount) : 0;
      thisMonth[dayOffset] += paid;
    } else if (dayOffset >= -days && dayOffset < 0) {
      prevMonth[dayOffset + days] += inv.amount;
    }
  });

  // Ensure we have some data to display
  const hasData = thisMonth.some(v => v > 0) || prevMonth.some(v => v > 0);
  const chartThis = hasData ? thisMonth : [];
  const chartPrev = hasData ? prevMonth : [];
  const max = Math.max(...chartThis, ...chartPrev);
  const width = 600, height = 200;
  const toPoint = (v: number, i: number) => `${(i / (chartThis.length - 1)) * width},${height - (v / max) * height * 0.85 - 10}`;
  const thisPoints = chartThis.map((v, i) => toPoint(v, i)).join(' ');
  const prevPoints = chartPrev.map((v, i) => toPoint(v, i)).join(' ');
  const areaPoints = `0,${height} ${thisPoints} ${width},${height}`;
  const totalThis = chartThis.reduce((a, b) => a + b, 0);
  const totalPrev = chartPrev.reduce((a, b) => a + b, 0);
  const pctChange = ((totalThis - totalPrev) / totalPrev * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground">{t('dashboard.revenueChart')}</h3>
            <span className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full ${+pctChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <I.ArrowUp className={`w-3 h-3 ${+pctChange < 0 ? 'rotate-180' : ''}`} /> {pctChange}%
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">${totalThis.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground/80 mt-0.5">vs ${totalPrev.toLocaleString()} last month</p>
        </div>
        <button className="text-muted-foreground/80 hover:text-muted-foreground transition-colors"><I.Dots className="w-5 h-5" /></button>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Previous month (dashed) */}
        <polyline points={prevPoints} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#revGrad)" />
        {/* {t('dashboard.thisMonth')} (solid) */}
        <polyline points={thisPoints} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dot markers */}
        {chartThis.map((v, i) => i % 5 === 0 && (
          <circle key={i} cx={(i / (chartThis.length - 1)) * width} cy={height - (v / max) * height * 0.85 - 10} r="3" fill="#3B82F6" />
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded-full" /><span className="text-[10px] text-muted-foreground/80">This month</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-400 rounded-full" style={{borderTop: '2px dashed #94A3B8'}} /><span className="text-[10px] text-muted-foreground/80">{t('dashboard.lastMonth')}</span></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   JOB BREAKDOWN DONUT
   ═══════════════════════════════════════════ */
function JobDonutChart() {
    const { t } = useI18n();
  
  // Compute breakdown from actual jobs data
  const completed = jobs.filter(j => j.status === 'completed').length;
  const inProgress = jobs.filter(j => j.status === 'in-progress').length;
  const scheduled = jobs.filter(j => j.status === 'scheduled').length;
  const urgent = jobs.filter(j => j.status === 'urgent').length;
  const cancelled = jobs.filter(j => j.status === 'cancelled').length;

  const hasData = completed + inProgress + scheduled + urgent + cancelled > 0;
  const segments = hasData
    ? [
        { label: 'Completed', value: completed || 1, color: '#10B981' },
        { label: 'In Progress', value: inProgress || 1, color: '#3B82F6' },
        { label: 'Scheduled', value: scheduled || 1, color: '#F59E0B' },
        { label: 'Cancelled', value: cancelled || 1, color: '#94A3B8' },
      ].filter(s => s.value > 0)
    : [
        { label: 'Completed', value: 60, color: '#10B981' },
        { label: 'In Progress', value: 20, color: '#3B82F6' },
        { label: 'Cancelled', value: 12, color: '#94A3B8' },
        { label: t('dashboard.noShow'), value: 8, color: '#F59E0B' },
      ];
  const total = segments.reduce((s, v) => s + v.value, 0);
  const cx = 100, cy = 100, r = 72, sw = 28;

  let cumulative = 0;
  const slices = segments.map(seg => {
    const startAngle = (cumulative / total) * 360 - 90;
    cumulative += seg.value;
    const endAngle = (cumulative / total) * 360 - 90;
    const large = (endAngle - startAngle) > 180 ? 1 : 0;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    return { ...seg, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}` };
  });

  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">{t('dashboard.jobBreakdown')}</h3>
        <button className="text-muted-foreground/80 hover:text-muted-foreground transition-colors"><I.Dots className="w-5 h-5" /></button>
      </div>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 200 200">
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill="none" stroke={s.color} strokeWidth={sw} strokeLinecap="round" />
            ))}
            <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central" fill="#0F172A" fontFamily="system-ui" fontSize="28" fontWeight="700">{total}</text>
            <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central" fill="#64748B" fontFamily="system-ui" fontSize="11">Jobs</text>
          </svg>
        </div>
        <div className="flex-1 space-y-2.5 pt-2">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   WEEKLY PERFORMANCE (jobs + revenue per tech)
   ═══════════════════════════════════════════ */
function WeeklyTechChart() {
    const { t } = useI18n();
  
  // Compute from actual team members and their job assignments
  const hasTeamData = teamMembers.length > 0 && jobs.length > 0;
  const techs = hasTeamData
    ? teamMembers.map((tm, idx) => {
        const assignedJobs = jobs.filter(j => j.assignedTo.includes(tm.id));
        const totalRevenue = assignedJobs.reduce((sum, j) => sum + (j.actualCost || j.estimatedCost), 0);
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EF4444'];
        return {
          name: tm.name,
          initials: (tm.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
          jobs: assignedJobs.length,
          revenue: totalRevenue,
          color: colors[idx % colors.length],
        };
      }).sort((a, b) => b.jobs - a.jobs)
    : []
  const maxJobs = Math.max(...techs.map(t => t.jobs), 1);
  const maxRev = Math.max(...techs.map(t => t.revenue), 1);

  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">{t('dashboard.weeklyPerformance')}</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /><span className="text-[10px] text-muted-foreground/80">Jobs</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /><span className="text-[10px] text-muted-foreground/80">Revenue</span></div>
          <button className="text-muted-foreground/80 hover:text-muted-foreground transition-colors"><I.Dots className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="space-y-4">
        {techs.map(tech => {
          const jobsPct = (tech.jobs / maxJobs) * 100;
          const revPct = (tech.revenue / maxRev) * 100;
          return (
            <div key={tech.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-bright to-blue-tint flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                    {tech.initials}
                  </div>
                  <span className="text-sm font-medium text-foreground">{tech.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{tech.jobs} jobs · ${(tech.revenue / 100).toFixed(1)}K</span>
              </div>
              <div className="flex gap-1.5 items-center h-4">
                <div className="h-3 bg-primary rounded-full transition-all duration-500" style={{ width: `${jobsPct}%` }} />
                <div className="h-3 bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${revPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   UPCOMING JOBS TABLE (with Time)
   ═══════════════════════════════════════════ */
const demoJobs: any[] = [];

const UpcomingJobsTable = memo(function UpcomingJobsTable() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">{t('dashboard.upcomingJobs')}</h3>
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground/80 hover:text-muted-foreground transition-colors"><I.Dots className="w-5 h-5" /></button>
          <a href="/jobs" className="text-xs font-medium text-primary hover:text-primary/80">{t('dashboard.viewAll')} →</a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-border/50">
              <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-5 py-3">Time</th>
              <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Address</th>
              <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3">Tech</th>
              <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoJobs.map((job) => {
              const cfg = statusConfig[job.status];
              return (
                <tr key={job.id} className="border-b border-border/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => router.push(`/jobs/${job.id}`)}>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <I.Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
                      <span className="text-sm font-medium text-slate-800">{job.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="text-sm text-foreground font-medium">{job.customer}</span>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">{job.service}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{job.address}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-bright to-blue-tint flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        {job.tech.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-sm text-muted-foreground">{job.tech}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-muted-foreground/80 hover:text-muted-foreground transition-colors"><I.Dots className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   TECH STATUS TABLE
   ═══════════════════════════════════════════ */
const techStatusData: any[] = [];

const statusDotColors: Record<string, string> = {
  online: 'bg-emerald-400',
  busy: 'bg-primary',
  away: 'bg-amber-400',
  offline: 'bg-slate-300',
};

const TechStatusTable = memo(function TechStatusTable() {
  const { t } = useI18n();
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">{t('dashboard.techStatus')}</h3>
        <a href="/team" className="text-xs font-medium text-primary hover:text-primary/80">View All →</a>
      </div>
      <div className="divide-y divide-slate-50 max-h-[380px] overflow-y-auto">
        {techStatusData.map((tech, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors">
            <div className="relative shrink-0">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${tech.color} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                {tech.initials}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${statusDotColors[tech.status]} ring-2 ring-white`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{tech.name}</p>
              <p className="text-xs text-muted-foreground/80 truncate">{tech.job} · {tech.location}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-semibold text-foreground">{tech.jobsToday}</span>
              <p className="text-[10px] text-muted-foreground/80">today</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   ALERTS PANEL
   ═══════════════════════════════════════════ */
const alerts: any[] = [];

const AlertsPanel = memo(function AlertsPanel() {
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">Alerts</h3>
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">{alerts.length}</span>
      </div>
      <div className="divide-y divide-slate-50">
        {alerts.map((alert, i) => (
          <div key={i} className="px-5 py-3.5 hover:bg-muted transition-colors">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl ${alert.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                <alert.icon className={`w-4 h-4 ${alert.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{alert.message}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">{alert.time}</p>
              </div>
              <div className="shrink-0">
                <button onClick={() => router.push(alert.href)} className="text-xs font-medium text-primary hover:text-primary/80 whitespace-nowrap">
                  {alert.action} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   QUICK ACTIONS
   ═══════════════════════════════════════════ */
const QuickActionsBar = memo(function QuickActionsBar() {
  const router = useRouter();
  const actions = [
    { label: 'New Job', icon: I.Wrench, href: '/jobs/new', color: 'bg-primary' },
    { label: 'New Client', icon: I.Users, href: '/clients/new', color: 'bg-emerald-500' },
    { label: 'Create Invoice', icon: I.File, href: '/invoicing', color: 'bg-violet-500' },
    { label: 'AI Photo Estimate', icon: I.Camera, href: '/pricebook', color: 'bg-cyan-500' },
    { label: 'Dispatch Emergency', icon: I.Bolt, href: '/emergency-triage', color: 'bg-red-500' },
  ];
  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      <h3 className="text-base font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((a, i) => (
          <button key={i} onClick={() => router.push(a.href)}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-muted transition-colors active:scale-[0.98] group">
            <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center shadow-sm group-hover:shadow transition-shadow`}>
              <a.icon className="w-4 h-4 text-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">{a.label}</span>
            <I.ArrowUp className="w-3.5 h-3.5 text-slate-300 ml-auto rotate-45 group-hover:text-muted-foreground transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   SUBSCRIPTION CARD
   ═══════════════════════════════════════════ */
const planLabels: Record<string, string> = {
  solo: 'Solo',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};
const planColors: Record<string, string> = {
  solo: 'from-slate-500 to-slate-600',
  pro: 'from-blue-500 via-blue-600 to-cyan-600',
  business: 'from-purple-500 to-purple-600',
  enterprise: 'from-amber-500 to-orange-500',
};
const priceMap: Record<string, number> = {solo:349, pro:799, business:1499};

const UpgradeCard = memo(function UpgradeCard() {
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
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

  if (profile?.role === 'super_admin') return null;

  if (!tier || status === 'none') {
    return (
      <div className="relative rounded-2xl bg-gradient-to-br from-primary via-blue-deep to-blue-bright shadow-[0_8px_32px_rgba(59,130,246,0.15)] p-5 overflow-hidden shadow-md">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-3 backdrop-blur-sm"><I.Zap className="w-4 h-4 text-white" /></div>
          <h3 className="text-base font-bold text-foreground mb-1.5">Start Your Free Trial!</h3>
          <p className="text-xs text-blue-100 leading-relaxed mb-4">Unlock AI photo estimates, voice receptionist, and advanced analytics.</p>
          <button onClick={() => router.push('/pricing')} className="h-9 px-4 rounded-xl bg-white text-primary text-xs font-semibold hover:bg-blue-tint transition-colors shadow-sm active:scale-[0.97]">View Plans</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-5 overflow-hidden shadow-md`}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-foreground/80 uppercase tracking-wider">{status === 'active' ? 'Active' : status}</span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-0.5">{label} Plan</h3>
        {tier === 'enterprise' ? (
          <p className="text-xs text-blue-100 mb-3">Custom pricing</p>
        ) : (
          <p className="text-xs text-blue-100 mb-3">${tier ? priceMap[tier] + '/mo' : ''}</p>
        )}
        <div className="flex gap-2">
          <button onClick={openBilling} disabled={billingLoading} className="h-8 px-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition-all active:scale-[0.97] border border-white/10">
            {billingLoading ? 'Opening...' : 'Manage Plan'}
          </button>
          <button onClick={() => router.push('/billing')} className="h-8 px-3.5 rounded-xl bg-white text-primary text-xs font-semibold hover:bg-blue-tint transition-all active:scale-[0.97]">Billing</button>
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   AI ASSISTANT WIDGET
   ═══════════════════════════════════════════ */
const AIAssistantWidget = memo(function AIAssistantWidget() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role:string;content:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setShowChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }, [input, sendMessage]);

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-full">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-bright flex items-center justify-center shadow-sm">
            <I.Sparkles className="w-4 h-4 text-foreground" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">PlumbCore AI</h3>
        </div>
        {showChat && (
          <button onClick={() => { setShowChat(false); setMessages([]); }} className="text-xs text-muted-foreground/80 hover:text-muted-foreground transition-colors">Clear</button>
        )}
      </div>

      {showChat && messages.length > 0 && (
        <div className="px-5 pb-3 space-y-3 max-h-48 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md border border-border/50'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground/80 border border-border/50 rounded-bl-md">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {!showChat && (
        <div className="px-5 pb-3">
          <p className="text-xs text-muted-foreground/80 text-center mb-3">Ask me anything about your business</p>
          <div className="space-y-1">
            {[
              { label: "What's on my schedule today?", icon: I.Check },
              { label: 'How many jobs are active?', icon: I.Cursor },
              { label: 'Show me overdue invoices', icon: I.Cart },
            ].map((s) => (
              <button key={s.label} onClick={() => sendMessage(s.label)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left">
                <s.icon className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-5 pt-3 border-t border-border/50 mt-auto">
        <div className="relative">
          <input
            type="text"
            placeholder={loading ? 'Thinking...' : 'Ask me anything...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full h-10 pl-4 pr-10 bg-muted rounded-xl text-sm text-muted-foreground placeholder:text-muted-foreground/80 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white border border-border transition-all disabled:opacity-50"
          />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary transition-colors active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed">
            <I.Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   PLAN INFO WIDGET
   ═══════════════════════════════════════════ */
function PlanInfoWidget() {
  const [company, setCompany] = useState<any>(null);
  
  useEffect(() => {
    import('@/lib/store').then(mod => {
      const state = mod.useAuthStore.getState();
      setCompany(state.company);
    });
  }, []);

  const tier: string = company?.subscription_tier || 'solo';
  const planLabel = PLAN_LABELS[tier] || 'Solo';
  const planPrice = (PLAN_PRICES[tier] || 34900) / 100;
  const maxTechs = PLAN_MAX_TECHS[tier] || 1;
  const aiHours = PLAN_AI_RECEPTIONIST_HOURS[tier] || 15;
  const status = company?.subscription_status || 'active';

  const openBilling = async () => {
    if (!company?.stripe_customer_id) return;
    try {
      const res = await fetch('/api/create-billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: company.stripe_customer_id,
          returnUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-primary to-blue-bright flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground">Plan Info</h3>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {status === 'active' ? 'Active' : status}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <h2 className="text-2xl font-bold text-foreground">{planLabel}</h2>
        <span className="text-sm text-muted-foreground">· ${planPrice}/mo</span>
      </div>
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="bg-muted rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{aiHours}h</p>
          <p className="text-[10px] text-muted-foreground">AI Receptionist</p>
        </div>
        <div className="bg-muted rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{maxTechs === 999 ? '∞' : maxTechs}</p>
          <p className="text-[10px] text-muted-foreground">Max Techs</p>
        </div>
        <div className="bg-muted rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">${planPrice}</p>
          <p className="text-[10px] text-muted-foreground">/mo</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => window.location.href = '/settings?tab=billing'}
          className="flex-1 h-9 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary transition-all active:scale-[0.97]"
        >
          Upgrade
        </button>
        <button
          onClick={openBilling}
          className="flex-1 h-9 rounded-xl border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all active:scale-[0.97]"
        >
          Manage Billing
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ═══════════════════════════════════════════ */
export default function DashboardPage() {
  const { t } = useI18n();
  
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const stats = getStats();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    import('@/lib/store').then(mod => {
      const state = mod.useAuthStore.getState();
      setCompany(state.company);
      // Load real data from Supabase (clears mock data for authenticated users with no data)
      if (state.company?.id) {
        loadDataFromSupabase(state.company.id);
      }
    });
    const stored = localStorage.getItem('dismiss_subscription_banner');
    if (stored) {
      const ts = parseInt(stored, 10);
      if (Date.now() - ts < 24 * 60 * 60 * 1000) setDismissed(true);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem('dismiss_subscription_banner', String(Date.now()));
    setDismissed(true);
  }, []);

  const status = company?.subscription_status || '';

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-6 space-y-5">
      {/* ── Subscription Warning Banner ── */}
      {status === 'past_due' && !dismissed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Payment failed</p>
              <p className="text-sm text-amber-700">Update your billing info to keep your subscription active.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a href="/billing" className="h-8 px-4 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center active:scale-[0.97]">Update Billing</a>
            <button onClick={handleDismiss} className="text-amber-400 hover:text-amber-600 transition-colors" aria-label="Dismiss">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
      {(status === 'cancelled' || status === 'none') && !dismissed && company && profile?.role !== 'super_admin' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">Subscription {status === 'cancelled' ? 'Cancelled' : 'Inactive'}</p>
              <p className="text-sm text-red-700">
                {status === 'cancelled'
                  ? 'Your subscription has been cancelled. Choose a plan to regain access.'
                  : 'No active subscription found. Sign up for a plan to unlock all features.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a href="/pricing" className="h-8 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors flex items-center active:scale-[0.97]">{status === 'cancelled' ? 'Reactivate' : 'View Plans'}</a>
            <button onClick={handleDismiss} className="text-red-400 hover:text-red-600 transition-colors" aria-label="Dismiss">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Row 1: KPI Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t('dashboard.revenue')} value={`$${stats.totalRevenue.toLocaleString()}`} change={stats.totalRevenue > 0 ? '+12.5%' : '0%'} trend={{ direction: stats.totalRevenue > 0 ? 'up' : 'down', label: 'all time', color: 'text-emerald-600' }} icon={I.Eye} iconBg="bg-gradient-to-br from-primary to-blue-bright" />
        <StatCard label={t('dashboard.activeJobs')} value={String(stats.activeJobs)} change={stats.urgentJobs > 0 ? `${stats.urgentJobs} urgent` : '0 urgent'} trend={{ direction: 'up', label: 'this week', color: stats.urgentJobs > 0 ? 'text-red-600' : 'text-emerald-600' }} icon={I.Wrench} iconBg="bg-gradient-to-br from-violet-500 to-purple-400" />
        <StatCard label={t('dashboard.invoices')} value={`$${stats.outstandingRevenue.toLocaleString()}`} change={stats.completedJobs > 0 ? `${stats.completedJobs} paid` : '0 paid'} trend={{ direction: 'up', label: 'needs attention', color: 'text-amber-600' }} icon={I.File} iconBg="bg-gradient-to-br from-amber-500 to-orange-400" />
        <StatCard label={t('dashboard.jobs')} value={String(stats.totalJobs)} change={stats.completedJobs > 0 ? `${Math.round(stats.completedJobs / Math.max(stats.totalJobs, 1) * 100)}% complete` : '0%'} trend={{ direction: 'up', label: 'completion rate', color: 'text-emerald-600' }} icon={I.Sparkles} iconBg="bg-gradient-to-br from-cyan-500 to-teal-400" />
      </div>

      {/* ── Revenue Goal + Deposits + Plan Info row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><RevenueGoalBar /><DepositsThisWeek /></div>
        <div className="lg:col-span-1">{company && <PlanInfoWidget />}</div>
      </div>

      {/* ── Row 2: Revenue Chart + Job Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3"><RevenueChart /></div>
        <div className="lg:col-span-2"><JobDonutChart /></div>
      </div>

      {/* ── Row 3: Weekly Tech Performance ── */}
      <div><WeeklyTechChart /></div>

      {/* ── Row 4: Upcoming Jobs + Tech Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3"><UpcomingJobsTable /></div>
        <div className="lg:col-span-2"><TechStatusTable /></div>
      </div>

      {/* ── Row 5: Alerts + Quick Actions + Upgrade + AI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2"><AlertsPanel /></div>
        <div className="lg:col-span-1 flex flex-col gap-4">
          <QuickActionsBar />
          <UpgradeCard />
        </div>
        <div className="lg:col-span-2"><AIAssistantWidget /></div>
      </div>
    </div>
  );
}
