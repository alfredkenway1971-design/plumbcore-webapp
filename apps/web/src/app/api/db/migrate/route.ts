import { NextResponse } from 'next/server';

/**
 * POST /api/db/migrate
 * Runs SQL migration files against Supabase using the service_role key.
 * Protected by CRON_SECRET — only callable via curl with the secret.
 * 
 * WARNING: DELETE THIS ENDPOINT AFTER RUNNING MIGRATIONS.
 * It exposes raw SQL execution via REST API.
 */

export async function POST(req: Request) {
  // Check auth
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const expected = process.env.CRON_SECRET || 'plumbcore-migration-2026';
  
  if (token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sql } = await req.json();
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Execute via Supabase REST API SQL endpoint
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ sql }),
    });

    const text = await res.text();
    return NextResponse.json({ 
      status: res.status,
      ok: res.ok,
      response: text.slice(0, 500),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
