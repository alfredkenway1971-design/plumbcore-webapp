// Diagnostic: Check companies and auth_users state
import { NextResponse } from 'next/server';

export async function GET() {
  const { getAdminClient } = await import('@/lib/supabase-admin');
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: 'No DB' });

  const sb = admin as any;

  // Companies
  const { data: companies, error: compErr } = await sb.from('companies').select('id,name,email,subscription_tier,stripe_customer_id,created_at').limit(20);
  
  // Auth users with subscription info
  const { data: users } = await sb.from('auth_users').select('email,company_id,stripe_customer_id,subscription_tier').limit(20);

  return NextResponse.json({
    companiesError: compErr?.message,
    companyCount: companies?.length || 0,
    companies,
    usersWithSubs: (users || []).filter((u: any) => u.stripe_customer_id && u.stripe_customer_id !== ''),
  });
}
