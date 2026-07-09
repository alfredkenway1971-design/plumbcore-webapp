-- ============================================================
-- PlumbCore AI v2 — New 3-Tier Pricing + Feature Tables
-- ============================================================

-- 1. Subscription Maintenance Plans
CREATE TABLE IF NOT EXISTS maintenance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  included_services TEXT[] NOT NULL DEFAULT '{}',
  plan_tier TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES maintenance_plans(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_billing_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_visit_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES maintenance_subscriptions(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  upsell_opportunities JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Review Automation
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  tech_id TEXT NOT NULL DEFAULT '',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  review_link_clicked BOOLEAN NOT NULL DEFAULT false,
  review_submitted BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tech_review_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tech_id TEXT NOT NULL,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  response_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Customer Financing
CREATE TABLE IF NOT EXISTS financing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  provider TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  approved_amount INTEGER,
  terms TEXT NOT NULL DEFAULT '',
  monthly_payment INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Truck GPS + Arrival Notifications
CREATE TABLE IF NOT EXISTS tech_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tech_id TEXT NOT NULL,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  battery_level NUMERIC(5,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS arrival_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notification_type TEXT NOT NULL DEFAULT 'en_route'
);

-- 5. AI Predictive Maintenance
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  install_date DATE,
  warranty_expiry DATE,
  last_service_date DATE,
  water_hardness NUMERIC(5,1),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  failure_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  predicted_failure_date DATE,
  recommended_action TEXT NOT NULL DEFAULT '',
  confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new subscription_tier values support
ALTER TABLE companies 
  DROP CONSTRAINT IF EXISTS companies_subscription_tier_check;

ALTER TABLE companies
  ADD CONSTRAINT companies_subscription_tier_check
  CHECK (subscription_tier IN ('solo', 'pro', 'business', 'enterprise', ''));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_company ON maintenance_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_subs_customer ON maintenance_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_visits_sub ON maintenance_visits(subscription_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_company ON review_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_tech_scores_company ON tech_review_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_financing_company ON financing_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_tech_locations_company ON tech_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_company ON equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_predictions_company ON predictions(company_id);
