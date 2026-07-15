/* ── Plumber Profile Types & Mock Data ── */

export type PlanTier = 'solo' | 'pro' | 'business' | 'enterprise';
export type PayoutSchedule = 'weekly' | 'biweekly' | 'monthly';
export type BackgroundCheckStatus = 'pending' | 'cleared' | 'failed';
export type PlumberStatus = 'active' | 'paused' | 'suspended';

export interface PlumberProfile {
  id: string;
  company_id: string;
  slug: string;
  company_name: string;
  logo_url: string;
  primary_color: string;
  plan_tier: PlanTier;
  service_area_zipcodes: string[];
  specialties: string[];
  
  // Stripe Connect
  stripe_connect_account_id: string;
  stripe_onboarding_complete: boolean;
  stripe_onboarding_url: string;
  
  // Payout settings
  payout_schedule: PayoutSchedule;
  payout_threshold_cents: number;
  
  // Performance
  avg_rating: number;
  total_reviews: number;
  total_jobs_completed: number;
  response_time_avg: number;     // minutes
  acceptance_rate: number;       // percentage 0-100
  
  // Lead limits
  monthly_lead_limit: number;
  current_month_leads: number;
  lead_fee_cents: number;
  
  // Compliance
  license_number: string;
  insurance_info: string;
  background_check_status: BackgroundCheckStatus;
  
  // Status
  status: PlumberStatus;
  
  created_at: string;
  updated_at: string;
}

/* ── Tab Config ── */
export type ProfileTab = 'overview' | 'financial' | 'performance' | 'compliance' | 'receptionist';

export const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'financial', label: 'Financial' },
  { key: 'performance', label: 'Performance' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'receptionist', label: 'AI Receptionist' },
];

/* ── Mock Plumber Profiles ── */

export const mockPlumberProfiles: PlumberProfile[] = [
  {
    id: 'pp-001',
    company_id: 'comp-001',
    slug: 'torres-plumbing',
    company_name: 'Torres Plumbing',
    logo_url: '',
    primary_color: '#3B82F6',
    plan_tier: 'pro',
    service_area_zipcodes: ['78701', '78702', '78703', '78704', '78705'],
    specialties: ['Residential Plumbing', 'Water Heaters', 'Drain Cleaning', 'Sewer Repair'],
    stripe_connect_account_id: 'acct_connect_001',
    stripe_onboarding_complete: true,
    stripe_onboarding_url: '',
    payout_schedule: 'weekly',
    payout_threshold_cents: 0,
    avg_rating: 4.8,
    total_reviews: 124,
    total_jobs_completed: 845,
    response_time_avg: 8.5,
    acceptance_rate: 94,
    monthly_lead_limit: 80,
    current_month_leads: 34,
    lead_fee_cents: 1000,   // Pro = $10/lead
    license_number: 'TX-PL-42891',
    insurance_info: 'General Liability $2M - State Farm',
    background_check_status: 'cleared',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2026-07-10T00:00:00Z',
  },
  {
    id: 'pp-002',
    company_id: 'comp-002',
    slug: 'wilson-plumb',
    company_name: 'Wilson Plumbing & Drain',
    logo_url: '',
    primary_color: '#10B981',
    plan_tier: 'solo',
    service_area_zipcodes: ['78701', '78702', '78746', '78731'],
    specialties: ['Residential Plumbing', 'Faucet Repair', 'Pipe Repair'],
    stripe_connect_account_id: 'acct_connect_002',
    stripe_onboarding_complete: true,
    stripe_onboarding_url: '',
    payout_schedule: 'weekly',
    payout_threshold_cents: 0,
    avg_rating: 4.6,
    total_reviews: 67,
    total_jobs_completed: 312,
    response_time_avg: 12.3,
    acceptance_rate: 88,
    monthly_lead_limit: 40,
    current_month_leads: 18,
    lead_fee_cents: 1500,   // Solo = $15/lead
    license_number: 'TX-PL-39182',
    insurance_info: 'General Liability $1M - Progressive',
    background_check_status: 'cleared',
    status: 'active',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2026-07-10T00:00:00Z',
  },
  {
    id: 'pp-003',
    company_id: 'comp-003',
    slug: 'blake-drain',
    company_name: 'Blake Drain & Sewer',
    logo_url: '',
    primary_color: '#8B5CF6',
    plan_tier: 'business',
    service_area_zipcodes: ['78701', '78702', '78703', '78704', '78705', '78746', '78731', '78758'],
    specialties: ['Drain Cleaning', 'Sewer Line Repair', 'Hydro Jetting', 'Camera Inspection', 'Emergency Service'],
    stripe_connect_account_id: 'acct_connect_003',
    stripe_onboarding_complete: true,
    stripe_onboarding_url: '',
    payout_schedule: 'weekly',
    payout_threshold_cents: 0,
    avg_rating: 4.9,
    total_reviews: 89,
    total_jobs_completed: 567,
    response_time_avg: 5.2,
    acceptance_rate: 97,
    monthly_lead_limit: 200,
    current_month_leads: 42,
    lead_fee_cents: 500,    // Business = $5/lead
    license_number: 'TX-PL-59273',
    insurance_info: 'General Liability $3M + Workers Comp - Zurich',
    background_check_status: 'cleared',
    status: 'active',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2026-07-10T00:00:00Z',
  },
  {
    id: 'pp-004',
    company_id: 'comp-004',
    slug: 'premier-pipe',
    company_name: 'Premier Pipe Services',
    logo_url: '',
    primary_color: '#F59E0B',
    plan_tier: 'solo',
    service_area_zipcodes: ['78701', '78704', '78745'],
    specialties: ['Pipe Repair', 'Water Heater', 'Fixture Installation'],
    stripe_connect_account_id: '',
    stripe_onboarding_complete: false,
    stripe_onboarding_url: 'https://connect.stripe.com/setup/...',
    payout_schedule: 'monthly',
    payout_threshold_cents: 5000,
    avg_rating: 4.2,
    total_reviews: 23,
    total_jobs_completed: 98,
    response_time_avg: 22.0,
    acceptance_rate: 76,
    monthly_lead_limit: 40,
    current_month_leads: 5,
    lead_fee_cents: 1500,
    license_number: '',
    insurance_info: '',
    background_check_status: 'pending',
    status: 'active',
    created_at: '2025-06-15T00:00:00Z',
    updated_at: '2026-07-10T00:00:00Z',
  },
];
