// Debug endpoint to check Supabase connection and data
import { NextResponse } from 'next/server';

export async function GET() {
  const results: any = {};

  // 1. Check env vars
  results.env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET (' + process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...)' : 'MISSING',
    serviceRole: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE ? 'SET (' + process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE?.substring(0, 10) + '...)' : 'MISSING',
    stripeKey: process.env.STRIPE_SECRET_KEY ? 'SET (' + process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...)' : 'MISSING',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'SET (' + process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 15) + '...)' : 'MISSING',
  };

  // 2. Try to connect to Supabase
  try {
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();
    if (admin) {
      results.supabase = { connected: true };
      const sb = admin as any;

      // Count companies
      const { data: companies, error: compErr } = await sb.from('companies').select('id,name,email,subscription_tier,subscription_status,created_at').limit(20);
      if (compErr) {
        results.companiesError = compErr.message;
      } else {
        results.companies = companies;
        results.companyCount = companies?.length || 0;
      }

      // Count auth_users
      const { data: users, error: userErr } = await sb.from('auth_users').select('id,email,role').limit(20);
      if (userErr) {
        results.usersError = userErr.message;
      } else {
        results.users = users;
        results.userCount = users?.length || 0;
      }
    } else {
      results.supabase = { connected: false, reason: 'getAdminClient returned null' };
    }
  } catch (e: any) {
    results.supabaseError = e.message;
  }

  // 3. Check Stripe connectivity
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-08-27.preview' as any });
    const webhooks = await stripe.webhookEndpoints.list({ limit: 1 });
    results.stripe = { connected: true, webhookCount: webhooks.data.length };
  } catch (e: any) {
    results.stripeError = e.message;
  }

  return NextResponse.json(results);
}
