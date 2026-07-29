#!/bin/bash
# Fix RLS via Supabase Management API
set -e

# Read key
SR_KEY=$(grep SERVICE_ROLE /root/plumbcore-ai/.env.prod | head -1 | cut -d= -f2- | tr -d '"')

# SQL to fix RLS
SQL="
DROP POLICY IF EXISTS \"Users can view their own profile\" ON public.profiles;
DROP POLICY IF EXISTS \"Users can view profiles in their company\" ON public.profiles;
DROP POLICY IF EXISTS \"Enable read access for authenticated users\" ON public.profiles;
DROP POLICY IF EXISTS \"Enable insert for authenticated users\" ON public.profiles;
DROP POLICY IF EXISTS \"Enable update for users based on id\" ON public.profiles;
DROP POLICY IF EXISTS \"Users can view own profile\" ON public.profiles;
DROP POLICY IF EXISTS \"Users can update own profile\" ON public.profiles;

CREATE POLICY \"select_own_profile\" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY \"select_company_profiles\" ON public.profiles FOR SELECT USING (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);
CREATE POLICY \"insert_own_profile\" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY \"update_own_profile\" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY \"admin_update_company_profiles\" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles AS admin_profile WHERE admin_profile.id = auth.uid() AND admin_profile.role IN ('admin', 'super_admin') AND admin_profile.company_id = company_id)
);
"

# Escape for JSON
JSON=$(python3 -c "import json; print(json.dumps({'query': '''$SQL'''.strip()}))")

# Call API
curl -s --max-time 15 -X POST "https://api.supabase.com/v1/projects/zwlwmehlewcyyljskpfv/sql" \
  -H "Authorization: Bearer $SR_KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON"
