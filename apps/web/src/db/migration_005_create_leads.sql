-- Migration 005: Create leads table
-- Core table for the lead marketplace — customer leads from AI quote flow

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_city TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  severity TEXT DEFAULT 'moderate',
  total_estimate NUMERIC DEFAULT 0,
  deposit_paid NUMERIC DEFAULT 0,
  deposit_charged NUMERIC DEFAULT 49,
  deposit_tier TEXT DEFAULT '',
  estimated_job_value NUMERIC DEFAULT 0,
  tracking_token TEXT,
  status TEXT DEFAULT 'matching',
  assigned_plumber_id TEXT,
  assigned_plumber_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Enable RLS but allow service_role full access
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Service role bypass (admin data API)
CREATE POLICY "Service role can do everything on leads"
  ON public.leads
  USING (true)
  WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_stripe_session ON public.leads(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_leads_tracking ON public.leads(tracking_token);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
