import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || '';
  if (!url || !key) return NextResponse.json({ error: 'No creds' });
  
  const results: any = {};

  // Try Supabase SQL endpoint: POST {project_url}/sql
  const sqlUrl = url.replace('/rest/v1', '') + '/sql';
  
  const sqlCommands = [
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_subscription_id text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT ''`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT ''`,
  ];

  for (const sql of sqlCommands) {
    try {
      const resp = await fetch(sqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({ query: sql })
      });
      const text = await resp.text();
      results[sql.substring(0, 40)] = { status: resp.status, text: text.substring(0, 100) };
    } catch (e: any) {
      results[sql.substring(0, 40)] = { error: e.message };
    }
  }

  // Verify: try to read companies
  try {
    const admin = (await import('@/lib/supabase-admin')).getAdminClient();
    if (admin) {
      const sb = admin as any;
      const { data: companies } = await sb
        .from('companies')
        .select('id,name,email,subscription_tier,stripe_customer_id')
        .limit(10);
      results.companies = companies;
    }
  } catch (e: any) {
    results.verifyError = e.message;
  }

  return NextResponse.json(results);
}
