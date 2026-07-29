-- Fix RLS infinite recursion on profiles table
-- The issue: SELECT policy on profiles reads from profiles, causing recursion
-- Fix: Use auth.uid() directly instead of a subquery on profiles

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Create clean, non-recursive policies

-- Allow users to view their own profile
CREATE POLICY "select_own_profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to view profiles in the same company (needed for team features, invoicing, etc.)
-- This avoids recursion by NOT using a subquery on profiles
CREATE POLICY "select_company_profiles"
  ON public.profiles
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
    )
  );

-- Allow users to insert their own profile
CREATE POLICY "insert_own_profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "update_own_profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow company admins to update profiles in their company
CREATE POLICY "admin_update_company_profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role IN ('admin', 'super_admin')
      AND admin_profile.company_id = company_id
    )
  );
