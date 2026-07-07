/* ── Admin Data Types & Mock Data ── */

export type HealthStatus = 'green' | 'yellow' | 'red';

export interface CompanyActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface Company {
  id: string;
  name: string;
  city: string;
  state: string;
  mrr: number;
  techCount: number;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  planTier: string;
  health: HealthStatus;
  // Detail page fields
  plan: string;
  techs: number;
  jobsPerMonth: number;
  aiUsage: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  billingInfo: string;
  sinceDate: string;
  totalPaid: number;
  nextBillingDate: string;
  recentActivity: CompanyActivityItem[];
  aiEstimatesCount: number;
  acceptedCount: number;
  closeRate: number;
  avgJobValue: number;
}

export interface TrialPipelineEntry {
  id: string;
  companyName: string;
  email: string;
  planTier: string;
  daysRemaining: number;
  engagementScore: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface ActivityFeedItem {
  id: string;
  companyName: string;
  type: string;
  severity: 'success' | 'warning' | 'error' | 'info';
  description: string;
  timestamp: string;
}

export interface AtRiskAccount {
  id: string;
  companyName: string;
  techCount: number;
  mrr: number;
  churnProbability: number;
  assignedRep: string;
  reason: string;
}

export interface FeatureAdoptionItem {
  featureKey: string;
  featureName: string;
  totalEnabled: number;
  weeklyActiveUsers: number;
  adoptionRate: number;
  trend: 'up' | 'down' | 'flat';
}

export interface RevenueBreakdownItem {
  planTier: string;
  totalMrr: number;
  percentageOfTotal: number;
  companyCount: number;
}

/* ── Platform KPIs ── */

export const platformKPIs = {
  totalMRR: 284500,
  mrrGrowth: 12.5,
  activePlumbers: 1847,
  plumberGrowth: 8.2,
  activeTrials: 1280,
  trialConversionRate: 24,
  churnRate: 2.1,
  churnTrend: 'down' as const,
};

/* ── Trial Pipeline ── */

export const trialPipeline: TrialPipelineEntry[] = [
  { id: 'TR-001', companyName: 'Premier Plumbing Co.', email: 'mike@premierplumb.com', planTier: 'pro', daysRemaining: 3, engagementScore: 82, riskLevel: 'high' },
  { id: 'TR-002', companyName: 'Drain Masters LLC', email: 'jen@drainmasters.com', planTier: 'solo', daysRemaining: 8, engagementScore: 55, riskLevel: 'medium' },
  { id: 'TR-003', companyName: 'Blue Ridge Mechanical', email: 'tom@blueridgemech.com', planTier: 'business', daysRemaining: 12, engagementScore: 91, riskLevel: 'low' },
  { id: 'TR-004', companyName: 'City Sewer & Drain', email: 'carlos@citysewer.com', planTier: 'team', daysRemaining: 18, engagementScore: 32, riskLevel: 'medium' },
  { id: 'TR-005', companyName: 'Quality Pipe Services', email: 'info@qualitypipe.com', planTier: 'enterprise', daysRemaining: -2, engagementScore: 18, riskLevel: 'high' },
  { id: 'TR-006', companyName: 'Flow Right Plumbing', email: 'amanda@flowright.com', planTier: 'solo', daysRemaining: 22, engagementScore: 48, riskLevel: 'low' },
];

/* ── At-Risk Accounts ── */

export const atRiskAccounts: AtRiskAccount[] = [
  { id: 'AR-001', companyName: 'McKenzie Mechanical', techCount: 8, mrr: 2499, churnProbability: 0.85, assignedRep: 'Alice Kim', reason: 'No job activity in 28 days' },
  { id: 'AR-002', companyName: 'Central TX Plumbing', techCount: 4, mrr: 999, churnProbability: 0.72, assignedRep: 'Bob Torres', reason: 'Payment past due — 35 days' },
  { id: 'AR-003', companyName: 'Pinnacle Pipe & Drain', techCount: 25, mrr: 4999, churnProbability: 0.45, assignedRep: 'Carol Chen', reason: 'Low AI usage — only 12% of jobs' },
  { id: 'AR-004', companyName: 'Rapid Rooter Services', techCount: 6, mrr: 1499, churnProbability: 0.52, assignedRep: 'Dave Singh', reason: 'Support tickets escalating' },
  { id: 'AR-005', companyName: 'Apex Septic & Water', techCount: 3, mrr: 999, churnProbability: 0.28, assignedRep: 'Alice Kim', reason: 'Usage decline over 3 months' },
];

/* ── Feature Adoption ── */

export const featureAdoption: FeatureAdoptionItem[] = [
  { featureKey: 'ai-quote', featureName: 'AI Quote Generator', totalEnabled: 1450, weeklyActiveUsers: 890, adoptionRate: 78.5, trend: 'up' },
  { featureKey: 'scheduling', featureName: 'Job Scheduling', totalEnabled: 1200, weeklyActiveUsers: 780, adoptionRate: 65.0, trend: 'up' },
  { featureKey: 'invoicing', featureName: 'Invoice & Payments', totalEnabled: 1100, weeklyActiveUsers: 650, adoptionRate: 59.5, trend: 'flat' },
  { featureKey: 'sms', featureName: 'SMS Notifications', totalEnabled: 950, weeklyActiveUsers: 540, adoptionRate: 51.4, trend: 'up' },
  { featureKey: 'inventory', featureName: 'Inventory Tracking', totalEnabled: 720, weeklyActiveUsers: 390, adoptionRate: 39.0, trend: 'down' },
  { featureKey: 'reports', featureName: 'Reports & Analytics', totalEnabled: 580, weeklyActiveUsers: 270, adoptionRate: 31.4, trend: 'flat' },
];

/* ── Revenue Breakdown ── */

export const revenueBreakdown: RevenueBreakdownItem[] = [
  { planTier: 'enterprise', totalMrr: 128025, percentageOfTotal: 45.0, companyCount: 85 },
  { planTier: 'business', totalMrr: 59745, percentageOfTotal: 21.0, companyCount: 62 },
  { planTier: 'team', totalMrr: 49850, percentageOfTotal: 17.5, companyCount: 104 },
  { planTier: 'pro', totalMrr: 33000, percentageOfTotal: 11.6, companyCount: 110 },
  { planTier: 'solo', totalMrr: 13880, percentageOfTotal: 4.9, companyCount: 92 },
];

/* ── Recent Activity Feed ── */

export const recentActivity: ActivityFeedItem[] = [
  { id: 'AF-001', companyName: 'Premier Plumbing Co.', type: 'company_created', severity: 'success', description: 'signed up for Pro plan', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'AF-002', companyName: 'Metro Mechanical Services', type: 'subscription_changed', severity: 'success', description: 'upgraded to Enterprise plan', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 'AF-003', companyName: 'Johnson Plumbing Co.', type: 'payment_succeeded', severity: 'success', description: 'paid invoice INV-891 ($1,250)', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'AF-004', companyName: 'Drain Masters LLC', type: 'trial_converted', severity: 'info', description: 'trial expires in 3 days', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'AF-005', companyName: 'McKenzie Mechanical', type: 'company_canceled', severity: 'error', description: 'cancelled subscription — high risk', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: 'AF-006', companyName: 'Flow Right Plumbing', type: 'onboarding_complete', severity: 'success', description: 'completed onboarding for Solo plan', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: 'AF-007', companyName: 'Bluewater Plumbing', type: 'payment_succeeded', severity: 'success', description: 'paid invoice INV-732 ($3,200)', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: 'AF-008', companyName: 'Apex Pipe & Drain', type: 'payment_failed', severity: 'warning', description: 'payment method declined — retrying', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 'AF-009', companyName: 'Quality Pipe Services', type: 'company_created', severity: 'info', description: 'trial expired — follow up needed', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'AF-010', companyName: 'Metro Mechanical Services', type: 'payment_failed', severity: 'warning', description: 'invoice INV-782 is 15 days overdue ($4,500)', timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() },
];

/* ── getPlatformSummary ── */

export function getPlatformSummary() {
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const totalTrials = companies.filter(c => c.status === 'trialing').length;
  const healthyCompanies = companies.filter(c => c.health === 'green').length;
  const totalTechs = companies.reduce((s, c) => s + c.techCount, 0);
  const totalMrr = companies.reduce((s, c) => s + c.mrr, 0);
  return { totalCompanies, activeCompanies, healthyCompanies, totalTrials, totalTechs, totalMrr };
}

/* ── Companies (for detail drill-down and admin dashboard) ── */

export const companies: Company[] = [
  {
    id: 'comp-001',
    name: 'Johnson Plumbing Co.',
    city: 'Austin',
    state: 'TX',
    mrr: 2499,
    techCount: 15,
    status: 'active',
    planTier: 'pro',
    plan: 'Professional',
    techs: 15,
    jobsPerMonth: 340,
    aiUsage: 78,
    health: 'green',
    ownerName: 'Mike Johnson',
    ownerEmail: 'mike@johnsonplumbing.com',
    ownerPhone: '(512) 555-0142',
    billingInfo: 'Visa ****4242',
    sinceDate: '2024-01-15',
    totalPaid: 34986,
    nextBillingDate: '2026-08-01',
    recentActivity: [
      { id: 'act-001', type: 'estimate_accepted', description: 'AI estimate accepted for water heater replacement', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { id: 'act-002', type: 'job_completed', description: 'Job JOB-452 marked as completed', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { id: 'act-003', type: 'invoice_paid', description: 'Invoice INV-891 paid ($1,250)', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      { id: 'act-004', type: 'ai_estimate', description: 'AI generated estimate for sewer line repair', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: 'act-005', type: 'tech_assigned', description: '2 techs assigned to emergency leak at Oak St', timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() },
    ],
    aiEstimatesCount: 890,
    acceptedCount: 734,
    closeRate: 82,
    avgJobValue: 245,
  },
  {
    id: 'comp-002',
    name: 'Apex Pipe & Drain',
    city: 'Round Rock',
    state: 'TX',
    mrr: 999,
    techCount: 5,
    status: 'active',
    planTier: 'solo',
    plan: 'Starter',
    techs: 5,
    jobsPerMonth: 98,
    aiUsage: 45,
    health: 'yellow',
    ownerName: 'Sarah Chen',
    ownerEmail: 'sarah@apexdrain.com',
    ownerPhone: '(512) 555-0187',
    billingInfo: 'Visa ****9876',
    sinceDate: '2024-06-01',
    totalPaid: 13995,
    nextBillingDate: '2026-08-01',
    recentActivity: [
      { id: 'act-006', type: 'payment_failed', description: 'Payment method declined — retrying', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'act-007', type: 'scheduled', description: 'New job scheduled for drain cleaning', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
      { id: 'act-008', type: 'estimate_sent', description: 'Estimate sent to client Robert Davis', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
    ],
    aiEstimatesCount: 210,
    acceptedCount: 142,
    closeRate: 68,
    avgJobValue: 189,
  },
  {
    id: 'comp-003',
    name: 'Metro Mechanical Services',
    city: 'San Antonio',
    state: 'TX',
    mrr: 4999,
    techCount: 32,
    status: 'active',
    planTier: 'enterprise',
    plan: 'Enterprise',
    techs: 32,
    jobsPerMonth: 620,
    aiUsage: 92,
    health: 'red',
    ownerName: 'James Rodriguez',
    ownerEmail: 'james@metromechanical.com',
    ownerPhone: '(512) 555-0321',
    billingInfo: 'Amex ****5555',
    sinceDate: '2023-09-01',
    totalPaid: 139986,
    nextBillingDate: '2026-08-01',
    recentActivity: [
      { id: 'act-009', type: 'ai_alert', description: 'AI usage limit at 92% — additional credits needed', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { id: 'act-010', type: 'support_ticket', description: 'Critical support ticket opened — API downtime', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'act-011', type: 'job_urgent', description: 'Urgent job at Sunset Retirement Home escalated', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      { id: 'act-012', type: 'invoice_overdue', description: 'Invoice INV-732 is 15 days overdue ($4,500)', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    ],
    aiEstimatesCount: 2450,
    acceptedCount: 1980,
    closeRate: 81,
    avgJobValue: 320,
  },
  {
    id: 'comp-004',
    name: 'Bluewater Plumbing',
    city: 'Cedar Park',
    state: 'TX',
    mrr: 2499,
    techCount: 18,
    status: 'active',
    planTier: 'team',
    plan: 'Professional',
    techs: 18,
    jobsPerMonth: 285,
    aiUsage: 65,
    health: 'green',
    ownerName: 'Emily Waters',
    ownerEmail: 'emily@bluewaterplumb.com',
    ownerPhone: '(512) 555-0456',
    billingInfo: 'Mastercard ****3344',
    sinceDate: '2024-03-10',
    totalPaid: 22491,
    nextBillingDate: '2026-08-15',
    recentActivity: [
      { id: 'act-013', type: 'estimate_accepted', description: 'AI estimate accepted for pipe repair', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { id: 'act-014', type: 'job_completed', description: 'Job JOB-521 completed successfully', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
    ],
    aiEstimatesCount: 650,
    acceptedCount: 520,
    closeRate: 80,
    avgJobValue: 275,
  },
  {
    id: 'comp-005',
    name: "O'Brien Septic & Drain",
    city: 'Georgetown',
    state: 'TX',
    mrr: 999,
    techCount: 3,
    status: 'active',
    planTier: 'solo',
    plan: 'Starter',
    techs: 3,
    jobsPerMonth: 45,
    aiUsage: 22,
    health: 'yellow',
    ownerName: 'Patrick O\'Brien',
    ownerEmail: 'patrick@obrienseptic.com',
    ownerPhone: '(512) 555-0789',
    billingInfo: 'Visa ****1122',
    sinceDate: '2025-01-05',
    totalPaid: 5994,
    nextBillingDate: '2026-08-01',
    recentActivity: [
      { id: 'act-015', type: 'ai_estimate', description: 'AI generated first estimate for new client', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    ],
    aiEstimatesCount: 85,
    acceptedCount: 48,
    closeRate: 56,
    avgJobValue: 310,
  },
  {
    id: 'comp-006',
    name: 'Pinnacle Pipe & Drain',
    city: 'Dallas',
    state: 'TX',
    mrr: 4999,
    techCount: 25,
    status: 'trialing',
    planTier: 'business',
    plan: 'Enterprise',
    techs: 25,
    jobsPerMonth: 450,
    aiUsage: 12,
    health: 'yellow',
    ownerName: 'Steve Mitchell',
    ownerEmail: 'steve@pinnaclepipe.com',
    ownerPhone: '(214) 555-0234',
    billingInfo: 'Visa ****8899',
    sinceDate: '2025-06-10',
    totalPaid: 0,
    nextBillingDate: '2026-08-01',
    recentActivity: [],
    aiEstimatesCount: 180,
    acceptedCount: 95,
    closeRate: 53,
    avgJobValue: 295,
  },
];
