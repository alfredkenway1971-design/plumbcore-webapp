-- ============================================================
-- PlumbCore AI v3 — Plumber Profiles, Payouts & Tiers
-- ============================================================

-- 1. Plumber Profiles (extends companies table)
CREATE TABLE IF NOT EXISTS plumber_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#3B82F6',
  plan_tier TEXT NOT NULL DEFAULT 'solo' CHECK (plan_tier IN ('solo', 'pro', 'business', 'enterprise')),
  service_area_zipcodes TEXT[] NOT NULL DEFAULT '{}',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  
  -- Stripe Connect
  stripe_connect_account_id TEXT DEFAULT '',
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  stripe_onboarding_url TEXT DEFAULT '',
  
  -- Payout settings
  payout_schedule TEXT NOT NULL DEFAULT 'weekly' CHECK (payout_schedule IN ('weekly', 'biweekly', 'monthly')),
  payout_threshold_cents INTEGER DEFAULT 0,
  
  -- Performance stats (computed)
  avg_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  response_time_avg NUMERIC(6,1) DEFAULT 0,
  acceptance_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Lead limits
  monthly_lead_limit INTEGER DEFAULT 0,
  current_month_leads INTEGER DEFAULT 0,
  lead_fee_cents INTEGER DEFAULT 1500,  -- Default $15 per lead
  
  -- Compliance
  license_number TEXT DEFAULT '',
  insurance_info TEXT DEFAULT '',
  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'cleared', 'failed')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Payouts
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plumber_profile_id UUID REFERENCES plumber_profiles(id) ON DELETE SET NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Amounts (in cents)
  gross_amount INTEGER NOT NULL DEFAULT 0,       -- Total lead fees collected
  platform_fee INTEGER NOT NULL DEFAULT 0,       -- PlumbCore's cut (per plan)
  net_amount INTEGER NOT NULL DEFAULT 0,         -- Amount to pay plumber
  fee_count INTEGER NOT NULL DEFAULT 0,          -- Number of leads/transactions
  
  -- Stripe
  stripe_transfer_id TEXT DEFAULT '',
  stripe_payout_id TEXT DEFAULT '',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  paid_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Revenue tracking table (per-month per-company)
CREATE TABLE IF NOT EXISTS revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  month DATE NOT NULL,  -- First day of month
  
  -- SaaS
  subscription_cents INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'active',
  
  -- Lead fees earned by PlumbCore
  lead_fee_cents INTEGER DEFAULT 0,
  lead_count INTEGER DEFAULT 0,
  
  -- Payouts to plumber
  payout_cents INTEGER DEFAULT 0,
  payout_status TEXT DEFAULT 'pending',
  
  UNIQUE(company_id, month),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Stripe Connect accounts (plumber bank account links)
CREATE TABLE IF NOT EXISTS connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  account_type TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plumber_profiles_company ON plumber_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_plumber_profiles_slug ON plumber_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_plumber_profiles_tier ON plumber_profiles(plan_tier);
CREATE INDEX IF NOT EXISTS idx_plumber_profiles_status ON plumber_profiles(status);
CREATE INDEX IF NOT EXISTS idx_payouts_company ON payouts(company_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_period ON payouts(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_revenue_company_month ON revenue_records(company_id, month);
CREATE INDEX IF NOT EXISTS idx_connect_accounts_company ON connect_accounts(company_id);
