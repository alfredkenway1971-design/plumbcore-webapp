import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: 'No DB' });
  const sb = admin as any;

  // Query auth_users with all subscription fields
  const { data: users, error: ue } = await sb
    .from('auth_users')
    .select('id,email,full_name,company_id,company_name,role,stripe_customer_id,stripe_subscription_id,subscription_tier,created_at')
    .not('stripe_customer_id', 'is', null)
    .not('stripe_customer_id', 'eq', '')
    .order('created_at', { ascending: false });

  // Query all auth_users for comparison
  const { data: allUsers } = await sb.from('auth_users').select('id,email,role,company_id').limit(50);

  // Try to insert a minimal company
  const testId = 't-' + Date.now();
  let companyInsertResult = 'not attempted';
  try {
    const { error: ie } = await sb.from('companies').insert({
      id: testId, name: 'Test Co', email: 'test@test.co',
      stripe_customer_id: 'test_cus_123',
      subscription_tier: 'solo',
    }).select('id').single();
    companyInsertResult = ie ? `FAIL: ${ie.message}` : 'OK';
    if (!ie) await sb.from('companies').delete().eq('id', testId);
  } catch (e: any) {
    companyInsertResult = `ERROR: ${e.message}`;
  }

  return NextResponse.json({
    usersWithSubscriptions: users || [],
    userCount: users?.length || 0,
    allUsers: allUsers?.length || 0,
    companyInsertTest: companyInsertResult,
    userErr: ue?.message,
  });
}
