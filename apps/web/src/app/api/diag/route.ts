// Fix: Add missing columns to companies table
import { NextResponse } from 'next/server';

export async function GET() {
  const { getAdminClient } = await import('@/lib/supabase-admin');
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: 'No DB' });

  const sb = admin as any;
  const results: any = {};

  // Check what columns exist by trying a minimal insert
  const testId = '00000000-0000-0000-0000-000000000000';
  try {
    await sb.from('companies').insert({ id: testId, name: 'test', email: 'test@test.com' }).select('id');
    results.minimalInsert = 'ok';
    // Clean up test
    await sb.from('companies').delete().eq('id', testId);
  } catch (e: any) {
    results.minimalInsert = e.message;
  }

  // Try adding missing columns via raw SQL
  const sqlCmds = [
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_subscription_id text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_id text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York'`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#3B82F6'`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS website text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS street text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS state text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS country text DEFAULT 'US'`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS service_area_zipcodes text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS how_heard text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS monthly_lead_limit integer DEFAULT 0`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS current_month_leads integer DEFAULT 0`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS lead_fee_cents integer DEFAULT 4900`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS payout_threshold_cents integer DEFAULT 0`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS payout_schedule text DEFAULT 'weekly'`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean DEFAULT false`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_connect_account_id text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_onboarding_url text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone text DEFAULT ''`,
  ];

  results.migrations = [];
  for (const sql of sqlCmds) {
    try {
      await sb.rpc('exec_sql', { sql });
      results.migrations.push({ sql: sql.substring(0, 60), ok: true });
    } catch (e: any) {
      // Try raw query
      try {
        await sb.from('companies').select('id').limit(0);
        // Just try the alter via a direct query
        const { error } = await sb.rpc('exec_sql', { sql_text: sql });
        results.migrations.push({ sql: sql.substring(0, 60), ok: !error, error: error?.message });
      } catch (e2: any) {
        results.migrations.push({ sql: sql.substring(0, 60), ok: false, error: e2.message });
      }
    }
  }

  // Now try to read companies
  const { data: companies, error } = await sb.from('companies').select('id,name,email,subscription_tier,stripe_customer_id').limit(10);
  results.finalCompanies = companies || [];
  results.finalError = error?.message;

  return NextResponse.json(results);
}
