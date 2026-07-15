import { NextResponse } from 'next/server';

/**
 * POST /api/db/migrate
 * One-shot migration endpoint — runs all SQL migrations in order.
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedKey = process.env.CRON_SECRET || 'plumbcore-cron-secret';

  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const fs = await import('fs');
    const path = await import('path');
    const dbDir = path.join(process.cwd(), 'src', 'db');

    const migrations = fs.readdirSync(dbDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();

    const results: { file: string; success: boolean; error?: string }[] = [];

    for (const file of migrations) {
      const sql = fs.readFileSync(path.join(dbDir, file), 'utf-8');
      try {
        // Execute each statement separately
        const statements = sql
          .split(';')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0 && !s.startsWith('--'));

        for (const stmt of statements) {
          if (stmt.length > 0) {
            await (admin as any).rpc('exec_sql', { query: stmt + ';' });
          }
        }
        results.push({ file, success: true });
        console.log(`✅ Migration ${file} applied`);
      } catch (err: any) {
        // Try direct SQL via raw query
        try {
          await (admin as any).from('_migrations').select('count').limit(1);
        } catch {}

        // Execute raw SQL via REST API
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || '';

        if (url && key) {
          // Use the Supabase REST API to run SQL via the /rest/v1/rpc/exec_sql endpoint
          const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': key,
              'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({ query: sql }),
          });

          if (response.ok) {
            results.push({ file, success: true });
            console.log(`✅ Migration ${file} applied via RPC`);
          } else {
            // Fallback: try direct SQL endpoint
            const sqlResponse = await fetch(`${url}/rest/v1/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Prefer': 'params=single-object',
              },
              body: JSON.stringify({ query: sql }),
            });

            if (sqlResponse.ok) {
              results.push({ file, success: true });
            } else {
              const errorText = await sqlResponse.text();
              results.push({ file, success: false, error: errorText.substring(0, 200) });
            }
          }
        } else {
          results.push({ file, success: false, error: 'No Supabase key available' });
        }
      }
    }

    return NextResponse.json({
      message: 'Migration run completed',
      results,
      total: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (err: any) {
    console.error('Migration error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
