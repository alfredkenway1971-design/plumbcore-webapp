'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/store';
import { canAccess } from '@/lib/feature-gates';
import type { PlanTier } from '@/lib/feature-gates';
import {
  Button,
  Card,
  Input,
  Modal,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import {
  plans as mockPlans,
  subscriptions as mockSubscriptions,
  visits as mockVisits,
  getMaintenanceMRR,
  getActiveSubscriptionCount,
  getUpcomingVisits,
} from '@/lib/plansDb';
import type {
  MaintenancePlanDb,
  MaintenanceSubscriptionDb,
  MaintenanceVisitDb,
  PlanTier as PlanTierDb,
} from '@/lib/plansDb';

/* ── Format Helpers ── */
function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function daysUntil(d: string): number {
  if (!d) return 999;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/* ── Tier Colors ── */
const tierColors: Record<string, string> = {
  basic: 'bg-muted text-foreground border-border',
  standard: 'bg-blue-100 text-blue-700 border-blue-200',
  premium: 'bg-amber-100 text-amber-700 border-amber-200',
  custom: 'bg-purple-100 text-purple-700 border-purple-200',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  expired: 'bg-muted text-muted-foreground border-border',
};

const visitStatusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  missed: 'bg-red-100 text-red-700 border-red-200',
};

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground mb-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground/80">{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CREATE PLAN FORM
   ═══════════════════════════════════════════ */
function CreatePlanForm({ onClose, onCreated }: { onClose: () => void; onCreated: (plan: MaintenancePlanDb) => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('99');
  const [description, setDescription] = useState('');
  const [intervalMonths, setIntervalMonths] = useState('6');
  const [planTier, setPlanTier] = useState<PlanTierDb>('standard');
  const [benefits, setBenefits] = useState('');
  const [services, setServices] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setSaving(true);

    const newPlan = {
      company_id: 'demo-company-001',
      name,
      price_monthly: parseFloat(price),
      description,
      interval_months: parseInt(intervalMonths) || 6,
      plan_tier: planTier,
      benefits: benefits.split('\n').filter(Boolean),
      included_services: services.split('\n').filter(Boolean),
      is_active: true,
    };

    // Try API first, fall back to local
    try {
      const res = await fetch('/api/maintenance-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_plan', ...newPlan }),
      });
      if (res.ok) {
        const data = await res.json();
        onCreated(data.plan);
        onClose();
        setSaving(false);
        return;
      }
    } catch {}

    // Fallback: import and create locally
    const { createPlan: localCreate } = await import('@/lib/plansDb');
    const plan = localCreate(newPlan);
    onCreated(plan);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">Create Maintenance Plan</h2>
          <button onClick={onClose} className="text-muted-foreground/80 hover:text-muted-foreground text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Plan Name *</label>
            <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g. Standard Coverage" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Monthly Price *</label>
              <Input type="number" value={price} onChange={(e: any) => setPrice(e.target.value)} placeholder="99" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Visit Interval</label>
              <select
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              >
                <option value="1">Every 1 month</option>
                <option value="3">Every 3 months (Quarterly)</option>
                <option value="6">Every 6 months (Bi-annual)</option>
                <option value="12">Every 12 months (Annual)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this plan includes..."
              className="w-full h-20 px-3 py-2 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Plan Tier</label>
            <select
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value as PlanTierDb)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            >
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Benefits (one per line)</label>
            <textarea
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="Priority scheduling&#10;10% off repairs&#10;Free emergency call-out"
              className="w-full h-20 px-3 py-2 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Included Services (one per line)</label>
            <textarea
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="Drain inspection&#10;Water heater check&#10;Leak detection"
              className="w-full h-20 px-3 py-2 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name || !price}>
              {saving ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   UPSEL TRACKING MODAL
   ═══════════════════════════════════════════ */
function UpsellModal({
  visit,
  onClose,
}: {
  visit: MaintenanceVisitDb & { customerName: string; planName: string };
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(visit.notes || '');
  const [upsells, setUpsells] = useState<{ description: string; potential_revenue: number }[]>(
    visit.upsell_opportunities || []
  );
  const [newDesc, setNewDesc] = useState('');
  const [newRev, setNewRev] = useState('');
  const [saving, setSaving] = useState(false);

  const addUpsell = () => {
    if (!newDesc || !newRev) return;
    setUpsells([...upsells, { description: newDesc, potential_revenue: parseFloat(newRev) }]);
    setNewDesc('');
    setNewRev('');
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { completeVisit } = await import('@/lib/plansDb');
      completeVisit(visit.id, notes, upsells);
    } catch {}
    setSaving(false);
    onClose();
  };

  const totalPotential = upsells.reduce((s, u) => s + u.potential_revenue, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Complete Visit</h2>
            <p className="text-sm text-muted-foreground">{visit.customerName} — {visit.planName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground/80 hover:text-muted-foreground text-xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Visit Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was done during this visit?"
              className="w-full h-24 px-3 py-2 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Upsell Opportunities</label>
              {upsells.length > 0 && (
                <span className="text-xs font-semibold text-emerald-600">
                  Potential: {formatCurrency(totalPotential)}
                </span>
              )}
            </div>
            {upsells.length > 0 && (
              <div className="space-y-2 mb-3">
                {upsells.map((u, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded-xl px-3 py-2 text-sm">
                    <span className="text-foreground flex-1">{u.description}</span>
                    <span className="font-semibold text-emerald-600 ml-2">{formatCurrency(u.potential_revenue)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newDesc}
                onChange={(e: any) => setNewDesc(e.target.value)}
                placeholder="Upsell description"
                className="flex-1"
              />
              <Input
                type="number"
                value={newRev}
                onChange={(e: any) => setNewRev(e.target.value)}
                placeholder="Amount"
                className="w-24"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addUpsell} disabled={!newDesc || !newRev}>+</Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleComplete} disabled={saving}>
              {saving ? 'Saving...' : 'Complete Visit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function MaintenancePlansPage() {
  const company = useAuthStore((s) => s.company);
  const profile = useAuthStore((s) => s.profile);
  const tier = (company?.subscription_tier || '') as PlanTier;
  const isAdmin = profile?.role === 'super_admin';

  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscribers' | 'visits'>('plans');
  const [upsellVisit, setUpsellVisit] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Feature gate
  const hasAccess = isAdmin || canAccess(tier, 'maintenancePlans');

  // Data
  const plans = useMemo(() => mockPlans.filter(p => p.is_active), [mounted]);
  const subscribers = useMemo(() => {
    // Return enriched subscriptions with customerName and planName
    return mockSubscriptions.map((s: any) => {
      const plan = mockPlans.find(p => p.id === s.plan_id);
      return {
        ...s,
        customerName: '',
        planName: plan?.name || 'Unknown Plan',
      };
    });
  }, [mounted]);
  const upcomingVisits = useMemo(() => getUpcomingVisits(), [mounted]);
  const mrr = useMemo(() => getMaintenanceMRR(), [mounted]);
  const activeCount = useMemo(() => getActiveSubscriptionCount(), [mounted]);

  if (!mounted) return null;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Upgrade to Access</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Maintenance Plans are available on the <strong>Pro</strong> plan and above. Upgrade to create recurring maintenance contracts and auto-schedule visits.
        </p>
        <Button onClick={() => window.location.href = '/settings'}>View Plans</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maintenance Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Create recurring maintenance contracts and manage subscribers</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Create Plan</Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Maintenance MRR" value={formatCurrency(mrr)} sub={`${activeCount} active subscribers`} />
        <StatCard label="Active Plans" value={String(plans.length)} />
        <StatCard label="Total Subscribers" value={String(subscribers.filter(s => s.status === 'active').length)} sub={`${subscribers.length} total`} />
        <StatCard label="Upcoming Visits" value={String(upcomingVisits.length)} />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(['plans', 'subscribers', 'visits'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'plans' ? 'Plans' : tab === 'subscribers' ? 'Subscribers' : 'Upcoming Visits'}
          </button>
        ))}
      </div>

      {/* ═══ PLANS TAB ═══ */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No plans yet"
                description="Create your first maintenance plan to start offering recurring contracts."
                action={<Button onClick={() => setShowCreate(true)}>Create Plan</Button>}
              />
            </div>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(plan.price_monthly)}<span className="text-sm font-normal text-muted-foreground/80">/mo</span></p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tierColors[plan.plan_tier] || tierColors.basic}`}>
                    {plan.plan_tier}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{plan.description || 'No description'}</p>
                <div className="text-xs text-muted-foreground/80 mb-3">
                  Visit interval: <span className="font-medium text-muted-foreground">Every {plan.interval_months} month{plan.interval_months !== 1 ? 's' : ''}</span>
                </div>
                {plan.benefits.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Benefits</p>
                    <ul className="space-y-1">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {plan.included_services.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Included Services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.included_services.map((s, i) => (
                        <span key={i} className="text-[11px] bg-blue-50 text-primary px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* ═══ SUBSCRIBERS TAB ═══ */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          {subscribers.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No subscribers yet" description="Subscribers will appear here once customers sign up for maintenance plans." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-5 py-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3">Plan</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Started</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Next Billing</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Next Visit</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-5 py-3">Auto-Renew</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => {
                    const plan = mockPlans.find(p => p.id === sub.plan_id);
                    const daysToBill = daysUntil(sub.next_billing_date);
                    return (
                      <tr key={sub.id} className="border-b border-slate-50 hover:bg-muted transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-slate-800">{sub.customerName}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-muted-foreground">{sub.planName}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[sub.status] || statusColors.active}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell text-muted-foreground">{formatDate(sub.start_date)}</td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">{formatDate(sub.next_billing_date)}</span>
                            {daysToBill <= 7 && daysToBill >= 0 && (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                {daysToBill}d
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell text-muted-foreground">
                          {sub.next_visit_date ? formatDate(sub.next_visit_date) : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`text-xs font-semibold ${sub.auto_renew ? 'text-emerald-600' : 'text-muted-foreground/80'}`}>
                            {sub.auto_renew ? 'On' : 'Off'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ VISITS TAB ═══ */}
      {activeTab === 'visits' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {upcomingVisits.length === 0 ? (
            <div className="col-span-full">
              <EmptyState title="No upcoming visits" description="Visits will be auto-scheduled when customers subscribe to maintenance plans." />
            </div>
          ) : (
            upcomingVisits.map((visit) => {
              const days = daysUntil(visit.scheduled_date);
              return (
                <div key={visit.id} className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{visit.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{visit.planName}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${visitStatusColors[visit.status] || visitStatusColors.scheduled}`}>
                      {visit.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <svg className="w-4 h-4 text-muted-foreground/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span>{formatDate(visit.scheduled_date)}</span>
                    {days >= 0 && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                        days <= 7 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-primary'
                      }`}>
                        {days === 0 ? 'Today' : `${days}d away`}
                      </span>
                    )}
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-muted-foreground mb-3 bg-muted rounded-xl px-3 py-2">{visit.notes}</p>
                  )}
                  {visit.upsell_opportunities && visit.upsell_opportunities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-emerald-600 mb-1">
                        Upsell opportunities: {formatCurrency(visit.upsell_opportunities.reduce((s, u) => s + u.potential_revenue, 0))}
                      </p>
                    </div>
                  )}
                  {visit.status === 'scheduled' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setUpsellVisit(visit)}
                    >
                      Complete & Track Upsells
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showCreate && (
        <CreatePlanForm
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            // Force re-render by toggling a state
            setActiveTab('plans');
          }}
        />
      )}
      {upsellVisit && (
        <UpsellModal
          visit={upsellVisit}
          onClose={() => setUpsellVisit(null)}
        />
      )}
    </div>
  );
}
