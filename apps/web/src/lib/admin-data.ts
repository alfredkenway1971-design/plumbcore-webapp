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
  totalMRR: 0,
  mrrGrowth: 0,
  activePlumbers: 0,
  plumberGrowth: 0,
  activeTrials: 0,
  trialConversionRate: 0,
  churnRate: 0,
  churnTrend: 'down' as const,
};

/* ── Trial Pipeline ── */

export const trialPipeline: TrialPipelineEntry[] = [];

/* ── At-Risk Accounts ── */

export const atRiskAccounts: AtRiskAccount[] = [];

/* ── Feature Adoption ── */

export const featureAdoption: FeatureAdoptionItem[] = [];

/* ── Revenue Breakdown ── */

export const revenueBreakdown: RevenueBreakdownItem[] = [];

/* ── Recent Activity Feed ── */

export const recentActivity: ActivityFeedItem[] = [];

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

export const companies: Company[] = [];
