-- ============================================
-- Fix RLS: Enable Row-Level Security on all tables
-- ============================================

-- 1. LEADS TABLE
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead (public form/checkout)
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
CREATE POLICY "Anyone can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

-- Only the assigned plumber or service_role (admin) can see leads
DROP POLICY IF EXISTS "Leads viewable by assigned plumber" ON leads;
CREATE POLICY "Leads viewable by assigned plumber" ON leads
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        auth.uid() = assigned_plumber_id::uuid
    );

-- Only the assigned plumber or service_role can update leads
DROP POLICY IF EXISTS "Leads updatable by assigned plumber" ON leads;
CREATE POLICY "Leads updatable by assigned plumber" ON leads
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        auth.uid() = assigned_plumber_id::uuid
    );

-- 2. PROFILES TABLE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. COMPANIES TABLE
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Company admin only" ON companies;
CREATE POLICY "Company admin only" ON companies
    FOR SELECT USING (auth.role() = 'service_role');

-- 4. JOBS TABLE
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Jobs admin only" ON jobs;
CREATE POLICY "Jobs admin only" ON jobs
    FOR SELECT USING (auth.role() = 'service_role');

-- 5. INVOICES TABLE
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Invoices admin only" ON invoices;
CREATE POLICY "Invoices admin only" ON invoices
    FOR SELECT USING (auth.role() = 'service_role');
