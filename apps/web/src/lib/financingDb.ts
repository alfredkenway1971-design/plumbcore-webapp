import { supabase } from '@/lib/supabase';
import type { FinancingApplicationDb, FinancingStatus, FinancingProvider } from '@/lib/supabase';

/* ── In-memory fallback store (when no Supabase) ── */
let fallbackApps: FinancingApplicationDb[] = [];
let fallbackIdCounter = 0;

function generateId(): string {
  return `FIN-${String(++fallbackIdCounter).padStart(3, '0')}`;
}

/* ── Types ── */
export interface FinancingSettings {
  enabled: boolean;
  minJobAmount: number;
  provider: FinancingProvider;
  defaultTermsMonths: number;
  defaultApr: number;
}

export const DEFAULT_FINANCING_SETTINGS: FinancingSettings = {
  enabled: false,
  minJobAmount: 500,
  provider: 'affirm',
  defaultTermsMonths: 12,
  defaultApr: 9.99,
};

/* ── Simulated application decision engine ── */
export interface ApplicationDecision {
  approved: boolean;
  approvedAmount?: number;
  monthlyPayment?: number;
  apr?: number;
  termsMonths: number;
  reason?: string;
}

export function simulateApplicationDecision(
  amount: number,
  termsMonths: number,
  customerName?: string
): ApplicationDecision {
  const baseApr = 9.99;
  const apr = amount > 2000 ? 7.99 : baseApr;

  // Simulated approval logic: 85% approval rate for amounts >= $500
  const random = Math.random();
  const approved = random < 0.85 && amount >= 500;

  if (!approved) {
    return {
      approved: false,
      termsMonths,
      reason: random < 0.5
        ? 'Application requires additional verification. Please contact support.'
        : 'Unable to approve at this time. Try a smaller amount or pay in full.',
    };
  }

  const monthlyRate = apr / 100 / 12;
  const monthlyPayment = Math.round(
    (amount * (monthlyRate * Math.pow(1 + monthlyRate, termsMonths))) /
      (Math.pow(1 + monthlyRate, termsMonths) - 1) * 100
  ) / 100;

  return {
    approved: true,
    approvedAmount: amount,
    monthlyPayment,
    apr,
    termsMonths,
  };
}

/* ── Check if Supabase is available ── */
function isSupabaseAvailable(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key);
}

/* ── CRUD Operations ── */

/** Get all financing applications for a company */
export async function getFinancingApplications(companyId: string): Promise<FinancingApplicationDb[]> {
  if (!isSupabaseAvailable()) {
    return fallbackApps.filter((a) => a.company_id === companyId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const { data, error } = await supabase
    .from('financing_applications')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[financingDb] Error fetching applications:', error);
    return [];
  }
  return data || [];
}

/** Get a single financing application by ID */
export async function getFinancingApplication(id: string): Promise<FinancingApplicationDb | null> {
  if (!isSupabaseAvailable()) {
    return fallbackApps.find((a) => a.id === id) || null;
  }

  const { data, error } = await supabase
    .from('financing_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[financingDb] Error fetching application:', error);
    return null;
  }
  return data;
}

/** Create a new financing application */
export async function createFinancingApplication(app: Omit<FinancingApplicationDb, 'id' | 'created_at' | 'updated_at'>): Promise<FinancingApplicationDb | null> {
  if (!isSupabaseAvailable()) {
    const newApp: FinancingApplicationDb = {
      ...app,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    fallbackApps.push(newApp);
    return newApp;
  }

  const { data, error } = await supabase
    .from('financing_applications')
    .insert([{
      company_id: app.company_id,
      invoice_id: app.invoice_id,
      job_id: app.job_id,
      customer_id: app.customer_id,
      customer_name: app.customer_name,
      customer_email: app.customer_email,
      customer_phone: app.customer_phone,
      amount: app.amount,
      provider: app.provider,
      status: app.status,
      approved_amount: app.approved_amount,
      terms_months: app.terms_months,
      monthly_payment: app.monthly_payment,
      apr: app.apr,
      application_data: app.application_data,
      notes: app.notes,
    }])
    .select()
    .single();

  if (error) {
    console.error('[financingDb] Error creating application:', error);
    return null;
  }
  return data;
}

/** Update a financing application */
export async function updateFinancingApplication(
  id: string,
  updates: Partial<Omit<FinancingApplicationDb, 'id' | 'created_at'>>
): Promise<FinancingApplicationDb | null> {
  if (!isSupabaseAvailable()) {
    const idx = fallbackApps.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    fallbackApps[idx] = { ...fallbackApps[idx], ...updates, updated_at: new Date().toISOString() };
    return fallbackApps[idx];
  }

  const { data, error } = await supabase
    .from('financing_applications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[financingDb] Error updating application:', error);
    return null;
  }
  return data;
}

/** Get financing revenue summary for a company */
export async function getFinancingRevenueSummary(companyId: string): Promise<{
  totalFinanced: number;
  totalApproved: number;
  activeFinancing: number;
  paidOff: number;
  pendingCount: number;
  avgMonthlyPayment: number;
}> {
  const apps = await getFinancingApplications(companyId);

  const approved = apps.filter((a) => a.status === 'approved' || a.status === 'active' || a.status === 'paid_off');
  const active = apps.filter((a) => a.status === 'active');
  const paidOff = apps.filter((a) => a.status === 'paid_off');
  const pending = apps.filter((a) => a.status === 'pending');

  const totalApproved = approved.reduce((sum, a) => sum + (a.approved_amount || a.amount), 0);
  const activeMonthlyPayments = active.reduce((sum, a) => sum + (a.monthly_payment || 0), 0);

  return {
    totalFinanced: apps.reduce((sum, a) => sum + a.amount, 0),
    totalApproved,
    activeFinancing: active.length,
    paidOff: paidOff.length,
    pendingCount: pending.length,
    avgMonthlyPayment: active.length > 0 ? Math.round((activeMonthlyPayments / active.length) * 100) / 100 : 0,
  };
}

/** Seed sample financing applications for demo */
export function seedDemoFinancingApplications(companyId: string): FinancingApplicationDb[] {
  const samples: Omit<FinancingApplicationDb, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      company_id: companyId,
      invoice_id: 'INV-001',
      job_id: 'JOB-003',
      customer_id: 'CLT-003',
      customer_name: 'Maria Wilson',
      customer_email: 'mwilson@email.com',
      customer_phone: '(555) 101-2003',
      amount: 2100,
      provider: 'affirm',
      status: 'active',
      approved_amount: 2100,
      terms_months: 12,
      monthly_payment: 184.50,
      apr: 7.99,
      notes: 'Financed pipe replacement job',
    },
    {
      company_id: companyId,
      invoice_id: 'INV-002',
      job_id: 'JOB-001',
      customer_id: 'CLT-001',
      customer_name: 'James & Sarah Johnson',
      customer_email: 'johnson@email.com',
      customer_phone: '(555) 101-2001',
      amount: 850,
      provider: 'affirm',
      status: 'approved',
      approved_amount: 850,
      terms_months: 12,
      monthly_payment: 74.74,
      apr: 9.99,
      notes: 'Water heater repair financing',
    },
    {
      company_id: companyId,
      invoice_id: 'INV-004',
      job_id: 'JOB-006',
      customer_id: 'CLT-011',
      customer_name: 'Oak Springs Apartments',
      customer_email: 'leasing@oaksprings.com',
      customer_phone: '(555) 101-2011',
      amount: 1500,
      provider: 'sunbit',
      status: 'pending',
      terms_months: 12,
      monthly_payment: 131.84,
      apr: 9.99,
    },
    {
      company_id: companyId,
      invoice_id: 'INV-003',
      job_id: 'JOB-008',
      customer_id: 'CLT-002',
      customer_name: 'Robert Davis',
      customer_email: 'rdavis@email.com',
      customer_phone: '(555) 101-2002',
      amount: 275,
      provider: 'affirm',
      status: 'declined',
      terms_months: 6,
      notes: 'Amount below minimum financing threshold',
    },
  ];

  fallbackApps = samples.map((s) => ({
    ...s,
    id: generateId(),
    created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return fallbackApps;
}

/** Reset fallback data — for tests / admin */
export function resetFallbackData(): void {
  fallbackApps = [];
  fallbackIdCounter = 0;
}
