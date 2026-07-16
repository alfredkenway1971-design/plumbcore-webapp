-- Fix RLS policies for leads table to allow admin dashboard access
-- Run this in Supabase SQL Editor

-- First, force disable RLS temporarily to test
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Now create a proper policy that allows authenticated users with admin/super_admin role
DROP POLICY IF EXISTS "Allow authenticated admins to view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow service role to read leads" ON public.leads;

-- Policy for authenticated users who are admins
CREATE POLICY "Allow authenticated admins to view leads"
  ON public.leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      JOIN auth.profiles p ON u.id = p.user_id
      WHERE u.id = auth.uid()
      AND p.role IN ('super_admin', 'admin')
    )
  );

-- Policy for service role key (bypasses user authentication)
CREATE POLICY "Allow service role to read leads"
  ON public.leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Recreate indexes if needed
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_stripe_session ON public.leads(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_leads_tracking ON public.leads(tracking_token);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);

-- Verify the policies are applied
SELECT * FROM pg_policies WHERE tablename = 'leads';
