-- ──────────────────────────────────────────────
-- PlumbCore AI — Supabase Schema Migration
-- Run this in Supabase SQL Editor once
-- ──────────────────────────────────────────────

-- 1. Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  website TEXT,
  logo_url TEXT,
  timezone TEXT DEFAULT 'America/Chicago',
  business_hours JSONB DEFAULT '{}',
  hourly_rate NUMERIC DEFAULT 85,
  service_fee_percent NUMERIC DEFAULT 15,
  tax_rate NUMERIC DEFAULT 8.25,
  stripe_customer_id TEXT DEFAULT '',
  stripe_subscription_id TEXT DEFAULT '',
  subscription_tier TEXT DEFAULT '',
  subscription_status TEXT DEFAULT 'none',
  trial_end TIMESTAMPTZ,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'dispatcher', 'tech', 'lead-tech', 'accountant')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Auth users table (custom auth)
CREATE TABLE IF NOT EXISTS public.auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_slug TEXT NOT NULL,
  company_id UUID NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'admin',
  stripe_customer_id TEXT DEFAULT '',
  stripe_subscription_id TEXT DEFAULT '',
  subscription_tier TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON public.auth_users(email);

-- 5. Row Level Security (disabled for service_role usage)
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_users DISABLE ROW LEVEL SECURITY;
