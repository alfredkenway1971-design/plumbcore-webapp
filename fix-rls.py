#!/usr/bin/env python3
"""Fix RLS infinite recursion on profiles table via Supabase Management API"""
import json, re, os, urllib.request

# Read service role key
with open('/root/plumbcore-ai/.env.prod') as f:
    env = f.read()
m = re.search(r'SERVICE_ROLE[\s=]+["\']?([^"\'\n]+)', env)
if not m:
    print("ERROR: Could not find SERVICE_ROLE key")
    exit(1)
key = m.group(1).strip()

sql = """
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "select_company_profiles" ON public.profiles FOR SELECT USING (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admin_update_company_profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles AS ap WHERE ap.id = auth.uid() AND ap.role IN ('admin', 'super_admin') AND ap.company_id = company_id)
);
"""

payload = json.dumps({"query": sql.strip()}).encode()
req = urllib.request.Request(
    "https://api.supabase.com/v1/projects/zwlwmehlewcyyljskpfv/sql",
    data=payload, method='POST'
)
req.add_header('Authorization', f'Bearer {key}')
req.add_header('Content-Type', 'application/json')

try:
    resp = urllib.request.urlopen(req, timeout=15)
    body = resp.read().decode()
    print(f"Status: {resp.status}")
    if body:
        print(body[:500])
    else:
        print("SQL executed successfully (empty response)")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code}: {body[:500]}")
except Exception as e:
    print(f"Error: {e}")
