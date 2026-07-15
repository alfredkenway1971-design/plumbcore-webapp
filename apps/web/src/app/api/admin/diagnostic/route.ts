import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  // 1. Check env vars
  results.env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseUrl_value: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').slice(0, 15) + '...',
    serviceRole_from_direct: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRole_from_public: !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
    serviceRole_public_len: (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || '').length,
    stripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
  };

  // 2. Test admin client
  const { getAdminClient } = await import('@/lib/supabase-admin');
  const admin = getAdminClient();
  results.adminClient = admin ? 'CONNECTED' : 'NULL (no key or url)';

  // 3. Test leads table
  if (admin) {
    try {
      const { data, error, count } = await (admin as any)
        .from('leads')
        .select('*', { count: 'exact' })
        .limit(1);
      
      results.leadsTable = {
        exists: !error,
        error: error?.message || null,
        count,
        sample: data?.length ? data[0].id : 'no rows',
      };

      // Check columns
      if (data?.length) {
        results.leadsTable.columns = Object.keys(data[0]);
      }
    } catch (e: any) {
      results.leadsTable = { exists: false, error: e.message };
    }

    // 4. Check routing table
    try {
      const { data: routes } = await (admin as any)
        .from('routing_sessions')
        .select('id')
        .limit(1);
      results.routingTable = { exists: true, hasRows: routes?.length > 0 };
    } catch {
      results.routingTable = { exists: false };
    }
  }

  // 5. Check Stripe webhook secret
  results.stripeWebhookSecretSet = !!process.env.STRIPE_WEBHOOK_SECRET;

  return NextResponse.json(results);
}
