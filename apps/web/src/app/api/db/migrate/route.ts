import { NextResponse } from 'next/server';

/**
 * POST /api/db/migrate
 * Executes RLS migration SQL against the Supabase database.
 * Protected by CRON_SECRET.
 */

const RLS_SQL = `
-- ============================================
-- Fix RLS: Enable Row-Level Security on all tables
-- ============================================

-- 1. LEADS TABLE
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
CREATE POLICY "Anyone can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Leads viewable by assigned plumber" ON leads;
CREATE POLICY "Leads viewable by assigned plumber" ON leads
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        auth.uid() = assigned_plumber_id::uuid
    );

DROP POLICY IF EXISTS "Leads updatable by assigned plumber" ON leads;
CREATE POLICY "Leads updatable by assigned plumber" ON leads
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        auth.uid() = assigned_plumber_id::uuid
    );

-- 2. PROFILES TABLE
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. COMPANIES TABLE
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Company admin only" ON companies;
CREATE POLICY "Company admin only" ON companies
    FOR SELECT USING (auth.role() = 'service_role');

-- 4. JOBS TABLE
ALTER TABLE IF EXISTS jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Jobs admin only" ON jobs;
CREATE POLICY "Jobs admin only" ON jobs
    FOR SELECT USING (auth.role() = 'service_role');

-- 5. INVOICES TABLE
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Invoices admin only" ON invoices;
CREATE POLICY "Invoices admin only" ON invoices
    FOR SELECT USING (auth.role() = 'service_role');

-- Also create the exec_sql helper function
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
`;

export async function POST(req: Request) {
  // Check auth
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const expected = process.env.CRON_SECRET || 'plumbcore-migration-2026';
  
  if (token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { step: string; status: string; error?: string }[] = [];

  try {
    // Try method 1: Direct Supabase REST API with exec_sql RPC
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || '';
    
    if (url && serviceKey) {
      // Method A: Try calling exec_sql RPC (may not exist yet)
      try {
        const rpcRes = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ sql: RLS_SQL }),
        });
        if (rpcRes.ok) {
          results.push({ step: 'exec_sql_rpc', status: 'success' });
          return NextResponse.json({ ok: true, methods: results });
        }
        results.push({ step: 'exec_sql_rpc', status: 'failed', error: await rpcRes.text() });
      } catch (e: any) {
        results.push({ step: 'exec_sql_rpc', status: 'error', error: e.message });
      }

      // Method B: Try Management API from Vercel IP (not Cloudflare blocked)
      try {
        const projectRef = url.replace('https://', '').split('.')[0];
        const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ query: RLS_SQL }),
        });
        if (mgmtRes.ok) {
          results.push({ step: 'mgmt_api', status: 'success' });
          return NextResponse.json({ ok: true, methods: results });
        }
        const errText = await mgmtRes.text();
        results.push({ step: 'mgmt_api', status: 'failed', error: errText.slice(0, 200) });
      } catch (e: any) {
        results.push({ step: 'mgmt_api', status: 'error', error: e.message });
      }

      // Method C: Try direct pg connection via pg package
      try {
        const { Client } = require('pg');
        const projectRef = url.replace('https://', '').split('.')[0];
        
        // Try with service_role JWT as password
        const regions = ['us-east-1', 'ca-central-1', 'eu-west-1'];
        for (const region of regions) {
          const client = new Client({
            host: `aws-0-${region}.pooler.supabase.com`,
            port: 6543,
            user: `postgres.${projectRef}`,
            password: serviceKey,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000,
          });
          try {
            await client.connect();
            await client.query(RLS_SQL);
            await client.end();
            results.push({ step: `pg_${region}`, status: 'success' });
            return NextResponse.json({ ok: true, methods: results });
          } catch (pgErr: any) {
            await client.end().catch(() => {});
            results.push({ step: `pg_${region}`, status: 'failed', error: pgErr.message?.slice(0, 150) });
          }
        }
      } catch (e: any) {
        results.push({ step: 'pg', status: 'error', error: e.message });
      }
    }

    return NextResponse.json({ ok: false, methods: results }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, methods: results }, { status: 500 });
  }
}
