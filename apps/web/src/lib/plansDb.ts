/* ──────────────────────────────────────────────
   PlumbCore AI — Maintenance Plans Data Layer
   Follows the same mock-data pattern as src/lib/mock-data.ts
   ────────────────────────────────────────────── */

import { supabase } from '@/lib/supabase';
import type {
  MaintenancePlanDb,
  MaintenanceSubscriptionDb,
  MaintenanceVisitDb,
  PlanTier,
  SubStatus,
} from '@/lib/supabase';

// ── Types ──
export type { PlanTier, SubStatus };
export type {
  MaintenancePlanDb,
  MaintenanceSubscriptionDb,
  MaintenanceVisitDb,
};

// ── Mock / fallback data ──
const fallbackPlans: MaintenancePlanDb[] = [
  {
    id: 'MP-001',
    company_id: 'demo-company-001',
    name: 'Basic Maintenance',
    price_monthly: 49,
    description: 'Annual plumbing inspection and priority service',
    benefits: ['Annual inspection', '10% off repairs', 'Priority scheduling'],
    included_services: ['Drain inspection', 'Water heater check', 'Leak detection'],
    plan_tier: 'basic',
    interval_months: 12,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'MP-002',
    company_id: 'demo-company-001',
    name: 'Standard Coverage',
    price_monthly: 99,
    description: 'Bi-annual inspections with discounted repairs',
    benefits: ['Bi-annual inspection', '20% off repairs', 'Priority scheduling', 'Free emergency call-out'],
    included_services: ['Drain inspection', 'Water heater flush', 'Leak detection', 'Sewer camera inspection'],
    plan_tier: 'standard',
    interval_months: 6,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'MP-003',
    company_id: 'demo-company-001',
    name: 'Premium Protection',
    price_monthly: 199,
    description: 'Quarterly inspections, full coverage, and priority service',
    benefits: ['Quarterly inspection', '30% off repairs', 'Priority scheduling', 'Free emergency call-out', 'Parts discount'],
    included_services: ['Drain inspection', 'Water heater flush', 'Leak detection', 'Sewer camera inspection', 'Gas line check', 'Pipe inspection'],
    plan_tier: 'premium',
    interval_months: 3,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
];

function getFallbackCustomers() {
  return [
    { id: 'CLT-001', name: 'James & Sarah Johnson' },
    { id: 'CLT-002', name: 'Robert Davis' },
    { id: 'CLT-003', name: 'Maria Wilson' },
    { id: 'CLT-005', name: 'Emily Thompson' },
  ];
}

const now = new Date();
const addMonths = (d: Date, n: number) => {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r.toISOString();
};

const fallbackSubscriptions: MaintenanceSubscriptionDb[] = [
  {
    id: 'MS-001',
    plan_id: 'MP-002',
    company_id: 'demo-company-001',
    customer_id: 'CLT-001',
    start_date: '2025-03-15T00:00:00Z',
    next_billing_date: addMonths(now, 1),
    next_visit_date: addMonths(now, 1),
    status: 'active',
    auto_renew: true,
    created_at: '2025-03-15T00:00:00Z',
  },
  {
    id: 'MS-002',
    plan_id: 'MP-001',
    company_id: 'demo-company-001',
    customer_id: 'CLT-003',
    start_date: '2025-02-01T00:00:00Z',
    next_billing_date: addMonths(now, 1),
    next_visit_date: addMonths(now, 4),
    status: 'active',
    auto_renew: true,
    created_at: '2025-02-01T00:00:00Z',
  },
  {
    id: 'MS-003',
    plan_id: 'MP-003',
    company_id: 'demo-company-001',
    customer_id: 'CLT-002',
    start_date: '2025-05-10T00:00:00Z',
    next_billing_date: addMonths(now, 1),
    next_visit_date: addMonths(now, 2),
    status: 'active',
    auto_renew: true,
    created_at: '2025-05-10T00:00:00Z',
  },
  {
    id: 'MS-004',
    plan_id: 'MP-002',
    company_id: 'demo-company-001',
    customer_id: 'CLT-005',
    start_date: '2025-04-20T00:00:00Z',
    next_billing_date: addMonths(now, 1),
    next_visit_date: addMonths(now, 3),
    status: 'active',
    auto_renew: false,
    created_at: '2025-04-20T00:00:00Z',
  },
  {
    id: 'MS-005',
    plan_id: 'MP-001',
    company_id: 'demo-company-001',
    customer_id: 'CLT-001',
    start_date: '2024-12-01T00:00:00Z',
    next_billing_date: '',
    status: 'cancelled',
    auto_renew: false,
    created_at: '2024-12-01T00:00:00Z',
  },
];

const fallbackVisits: MaintenanceVisitDb[] = [
  {
    id: 'MV-001',
    subscription_id: 'MS-001',
    company_id: 'demo-company-001',
    scheduled_date: '2025-09-15T09:00:00Z',
    completed_date: '2025-09-15T11:30:00Z',
    notes: 'Standard bi-annual inspection completed. Water heater in good condition.',
    status: 'completed',
    upsell_opportunities: [{ description: 'Recommend water heater replacement within 6 months', potential_revenue: 1200 }],
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'MV-002',
    subscription_id: 'MS-001',
    company_id: 'demo-company-001',
    scheduled_date: addMonths(now, 1),
    status: 'scheduled',
    created_at: now.toISOString(),
  },
  {
    id: 'MV-003',
    subscription_id: 'MS-003',
    company_id: 'demo-company-001',
    scheduled_date: addMonths(now, 2),
    status: 'scheduled',
    created_at: now.toISOString(),
  },
];

// ── In-memory store (matching mock-data pattern) ──
const data = {
  plans: [...fallbackPlans],
  subscriptions: [...fallbackSubscriptions],
  visits: [...fallbackVisits],
};

// ── Exported arrays (matching mock-data pattern) ──
export const plans = data.plans;
export const subscriptions = data.subscriptions;
export const visits = data.visits;

// ── Helper to get customer names ──
function customerNameById(id: string): string {
  return getFallbackCustomers().find(c => c.id === id)?.name || id;
}

// ── Plans CRUD ──

export function getPlans(companyId?: string): MaintenancePlanDb[] {
  if (companyId) {
    return data.plans.filter(p => p.company_id === companyId && p.is_active);
  }
  return data.plans.filter(p => p.is_active);
}

export function getPlanById(planId: string): MaintenancePlanDb | undefined {
  return data.plans.find(p => p.id === planId);
}

export function createPlan(plan: Omit<MaintenancePlanDb, 'id' | 'created_at'>): MaintenancePlanDb {
  const newPlan: MaintenancePlanDb = {
    ...plan,
    id: `MP-${String(data.plans.length + 1).padStart(3, '0')}`,
    created_at: new Date().toISOString(),
  };
  data.plans.push(newPlan);
  return newPlan;
}

export function updatePlan(planId: string, updates: Partial<Omit<MaintenancePlanDb, 'id' | 'created_at'>>): MaintenancePlanDb | undefined {
  const idx = data.plans.findIndex(p => p.id === planId);
  if (idx === -1) return undefined;
  data.plans[idx] = { ...data.plans[idx], ...updates };
  return data.plans[idx];
}

export function deletePlan(planId: string): boolean {
  const idx = data.plans.findIndex(p => p.id === planId);
  if (idx === -1) return false;
  data.plans.splice(idx, 1);
  return true;
}

// ── Subscriptions CRUD ──

export function getSubscriptions(companyId?: string): (MaintenanceSubscriptionDb & { customerName: string; planName: string })[] {
  let results = data.subscriptions;
  if (companyId) {
    results = results.filter(s => s.company_id === companyId);
  }
  return results.map(s => ({
    ...s,
    customerName: customerNameById(s.customer_id),
    planName: data.plans.find(p => p.id === s.plan_id)?.name || 'Unknown Plan',
  }));
}

export function getSubscriptionsByPlan(planId: string): (MaintenanceSubscriptionDb & { customerName: string })[] {
  return data.subscriptions
    .filter(s => s.plan_id === planId)
    .map(s => ({ ...s, customerName: customerNameById(s.customer_id), planName: data.plans.find(p => p.id === s.plan_id)?.name || 'Unknown Plan' }));
}

export function createSubscription(sub: Omit<MaintenanceSubscriptionDb, 'id' | 'created_at'>): MaintenanceSubscriptionDb {
  const newSub: MaintenanceSubscriptionDb = {
    ...sub,
    id: `MS-${String(data.subscriptions.length + 1).padStart(3, '0')}`,
    created_at: new Date().toISOString(),
  };
  data.subscriptions.push(newSub);
  return newSub;
}

export function updateSubscription(subId: string, updates: Partial<Omit<MaintenanceSubscriptionDb, 'id' | 'created_at'>>): MaintenanceSubscriptionDb | undefined {
  const idx = data.subscriptions.findIndex(s => s.id === subId);
  if (idx === -1) return undefined;
  data.subscriptions[idx] = { ...data.subscriptions[idx], ...updates };
  return data.subscriptions[idx];
}

export function cancelSubscription(subId: string): boolean {
  const idx = data.subscriptions.findIndex(s => s.id === subId);
  if (idx === -1) return false;
  data.subscriptions[idx].status = 'cancelled';
  data.subscriptions[idx].auto_renew = false;
  return true;
}

// ── Visits CRUD ──

export function getVisitsBySubscription(subId: string): MaintenanceVisitDb[] {
  return data.visits
    .filter(v => v.subscription_id === subId)
    .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
}

export function getUpcomingVisits(companyId?: string): (MaintenanceVisitDb & { customerName: string; planName: string })[] {
  let results = data.visits.filter(v => v.status === 'scheduled' || v.status === 'in-progress');
  if (companyId) {
    results = results.filter(v => v.company_id === companyId);
  }
  return results.map(v => {
    const sub = data.subscriptions.find(s => s.id === v.subscription_id);
    const plan = sub ? data.plans.find(p => p.id === sub.plan_id) : undefined;
    return {
      ...v,
      customerName: sub ? customerNameById(sub.customer_id) : 'Unknown',
      planName: plan?.name || 'Unknown Plan',
    };
  }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
}

export function createVisit(visit: Omit<MaintenanceVisitDb, 'id' | 'created_at'>): MaintenanceVisitDb {
  const newVisit: MaintenanceVisitDb = {
    ...visit,
    id: `MV-${String(data.visits.length + 1).padStart(3, '0')}`,
    created_at: new Date().toISOString(),
  };
  data.visits.push(newVisit);
  return newVisit;
}

export function completeVisit(visitId: string, notes: string, upsells?: { description: string; potential_revenue: number }[]): MaintenanceVisitDb | undefined {
  const idx = data.visits.findIndex(v => v.id === visitId);
  if (idx === -1) return undefined;
  data.visits[idx] = {
    ...data.visits[idx],
    status: 'completed',
    completed_date: new Date().toISOString(),
    notes,
    upsell_opportunities: upsells || data.visits[idx].upsell_opportunities,
  };
  return data.visits[idx];
}

// ── Analytics / Metrics ──

export function getMaintenanceMRR(companyId?: string): number {
  const active = data.subscriptions.filter(s => s.status === 'active');
  const filtered = companyId ? active.filter(s => s.company_id === companyId) : active;
  return filtered.reduce((sum, s) => {
    const plan = data.plans.find(p => p.id === s.plan_id);
    return sum + (plan?.price_monthly || 0);
  }, 0);
}

export function getActiveSubscriptionCount(companyId?: string): number {
  const active = data.subscriptions.filter(s => s.status === 'active');
  return companyId ? active.filter(s => s.company_id === companyId).length : active.length;
}

export async function syncPlansFromSupabase(companyId: string) {
  try {
    const { data: dbPlans, error: plansErr } = await supabase
      .from('maintenance_plans')
      .select('*')
      .eq('company_id', companyId);

    if (!plansErr && dbPlans && dbPlans.length > 0) {
      data.plans.length = 0;
      dbPlans.forEach((p: any) => data.plans.push(p));
    }

    const { data: dbSubs, error: subsErr } = await supabase
      .from('maintenance_subscriptions')
      .select('*')
      .eq('company_id', companyId);

    if (!subsErr && dbSubs && dbSubs.length > 0) {
      data.subscriptions.length = 0;
      dbSubs.forEach((s: any) => data.subscriptions.push(s));
    }

    const { data: dbVisits, error: visitsErr } = await supabase
      .from('maintenance_visits')
      .select('*')
      .eq('company_id', companyId);

    if (!visitsErr && dbVisits && dbVisits.length > 0) {
      data.visits.length = 0;
      dbVisits.forEach((v: any) => data.visits.push(v));
    }
  } catch {
    // Silently fall back to mock data
  }
}
