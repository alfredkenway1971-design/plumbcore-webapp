/* ── Payout System Types & Logic ── */

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';

export interface PayoutRecord {
  id: string;
  company_id: string;
  plumber_profile_id: string;
  period_start: string;
  period_end: string;
  gross_amount: number;   // cents
  platform_fee: number;   // cents (PlumbCore keeps)
  net_amount: number;     // cents (to plumber)
  fee_count: number;
  stripe_transfer_id: string;
  stripe_payout_id: string;
  status: PayoutStatus;
  paid_at: string | null;
  notes: string;
  created_at: string;
  // Joined fields
  plumber_name?: string;
  company_name?: string;
}

export interface EarningSummary {
  thisWeek: number;     // cents
  thisMonth: number;    // cents
  lifetime: number;     // cents
  pendingPayouts: number;  // cents
  nextPayoutDate: string;
  avgPerJob: number;    // cents
  jobsThisMonth: number;
  jobsThisWeek: number;      // jobs completed this week
  depositsThisWeek: number;  // cents — deposits collected this week
  leadFeesCharged: number;   // cents (PlumbCore collected)
  platformFeesPaid: number;  // cents (your share)
}

export interface EarningPeriod {
  label: string;
  amount: number;   // cents
  jobs: number;
  isProjected: boolean;
}

/* ── Mock Data ── */

export const mockEarningSummary: EarningSummary = {
  thisWeek: 184000,       // $1,840
  thisMonth: 624000,      // $6,240
  lifetime: 18420000,     // $184,200
  pendingPayouts: 184000, // $1,840
  nextPayoutDate: 'Sunday, July 13, 2026',
  avgPerJob: 32500,       // $325
  jobsThisMonth: 19,
  jobsThisWeek: 4,
  depositsThisWeek: 34500,  // $345 collected in deposits this week
  leadFeesCharged: 93100,   // PlumbCore collected $931
  platformFeesPaid: 18900,  // Plumber paid $189 in platform fees
};

export const mockPayoutHistory: PayoutRecord[] = [
  { id: 'pay-001', company_id: 'comp-001', plumber_profile_id: 'pp-001', period_start: '2026-07-01', period_end: '2026-07-06', gross_amount: 32000, platform_fee: 3200, net_amount: 28800, fee_count: 4, stripe_transfer_id: 'tr_001', stripe_payout_id: 'po_001', status: 'pending', paid_at: null, notes: '', created_at: '2026-07-06T23:59:00Z', plumber_name: 'Mike Torres', company_name: 'Torres Plumbing' },
  { id: 'pay-002', company_id: 'comp-002', plumber_profile_id: 'pp-002', period_start: '2026-06-24', period_end: '2026-06-30', gross_amount: 24000, platform_fee: 2400, net_amount: 21600, fee_count: 3, stripe_transfer_id: 'tr_002', stripe_payout_id: 'po_002', status: 'paid', paid_at: '2026-07-01T08:00:00Z', notes: '', created_at: '2026-06-30T23:59:00Z', plumber_name: 'James Wilson', company_name: 'Wilson Plumb' },
  { id: 'pay-003', company_id: 'comp-003', plumber_profile_id: 'pp-003', period_start: '2026-06-17', period_end: '2026-06-23', gross_amount: 16000, platform_fee: 1600, net_amount: 14400, fee_count: 2, stripe_transfer_id: 'tr_003', stripe_payout_id: 'po_003', status: 'paid', paid_at: '2026-06-24T08:00:00Z', notes: '', created_at: '2026-06-23T23:59:00Z', plumber_name: 'Sarah Blake', company_name: 'Blake Drain' },
  { id: 'pay-004', company_id: 'comp-001', plumber_profile_id: 'pp-001', period_start: '2026-06-10', period_end: '2026-06-16', gross_amount: 40000, platform_fee: 4000, net_amount: 36000, fee_count: 5, stripe_transfer_id: 'tr_004', stripe_payout_id: 'po_004', status: 'paid', paid_at: '2026-06-17T08:00:00Z', notes: '', created_at: '2026-06-16T23:59:00Z', plumber_name: 'Mike Torres', company_name: 'Torres Plumbing' },
  { id: 'pay-005', company_id: 'comp-002', plumber_profile_id: 'pp-002', period_start: '2026-06-03', period_end: '2026-06-09', gross_amount: 24000, platform_fee: 2400, net_amount: 21600, fee_count: 3, stripe_transfer_id: 'tr_005', stripe_payout_id: 'po_005', status: 'paid', paid_at: '2026-06-10T08:00:00Z', notes: '', created_at: '2026-06-09T23:59:00Z', plumber_name: 'James Wilson', company_name: 'Wilson Plumb' },
];

export const mockEarningPeriods: EarningPeriod[] = [
  { label: 'This Week', amount: 184000, jobs: 4, isProjected: true },
  { label: 'Last Week', amount: 156000, jobs: 3, isProjected: false },
  { label: 'This Month', amount: 624000, jobs: 19, isProjected: true },
  { label: 'Last Month', amount: 812000, jobs: 24, isProjected: false },
];

/* ── Payout Calculation ── */

export function calculatePayout(
  leadFeeCents: number,     // What PlumbCore charges per lead (e.g. $49 = 4900)
  leadCount: number,
  planTier: string
): { gross: number; platformFee: number; net: number } {
  const gross = leadFeeCents * leadCount;
  
  // Platform fee is the lead fee PlumbCore keeps (diff between $49 deposit and plumber's fee)
  const plumberLeadFee = getLeadFeeForTier(planTier);
  const platformFee = (leadFeeCents - plumberLeadFee) * leadCount;
  const net = plumberLeadFee * leadCount;
  
  return { gross, platformFee, net };
}

export function getLeadFeeForTier(tier: string): number {
  const fees: Record<string, number> = {
    solo: 1500,
    pro: 1000,
    business: 500,
    enterprise: 0,
  };
  return fees[tier] || 1500;
}
