import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint') || 'summary';

    // Auth check for non-companies endpoints
    if (endpoint !== 'companies') {
      const authHeader = request.headers.get('Authorization');
      const authMatch = authHeader?.match(/Bearer\s+(.+)/);
      const cookieToken = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1];
      const token = authMatch?.[1] || cookieToken;

      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const { decodeSessionToken } = await import('@/lib/custom-auth');
      const session = decodeSessionToken(token);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({
        error: 'Database not configured',
        debug: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
          serviceRole: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE ? 'SET' : 'MISSING'
        }
      }, { status: 500 });
    }

    const sb = admin as any;
    let result: any = {};

    // Fetch companies — actually query auth_users since companies table is incomplete
    if (endpoint === 'companies') {
      const { data: users, error } = await sb
        .from('auth_users')
        .select('id,email,full_name,company_name,company_id,role,stripe_customer_id,stripe_subscription_id,subscription_tier,created_at')
        .order('created_at', { ascending: false });
      if (error) console.error('Users query error:', error);
      // Map auth_users fields to company-like structure for the admin page
      result.companies = (users || []).map((u: any) => ({
        id: u.company_id || u.id,
        name: u.company_name || u.full_name || u.email?.split('@')[0] || 'Unnamed',
        email: u.email || '',
        subscription_tier: u.subscription_tier || '',
        stripe_customer_id: u.stripe_customer_id || '',
        stripe_subscription_id: u.stripe_subscription_id || '',
        created_at: u.created_at,
        city: '',
        state: '',
      }));
    }

    // Fetch leads for the leads endpoint
    if (endpoint === 'leads') {
      const { data: leads, error: leadsError } = await sb
        .from('leads')
        .select('id,customer_name,customer_email,customer_phone,customer_address,customer_city,diagnosis,severity,total_estimate,deposit_paid,deposit_charged,deposit_tier,estimated_job_value,status,tracking_token,assigned_plumber_id,assigned_plumber_name,created_at,updated_at')
        .order('created_at', { ascending: false });
      if (leadsError) console.error('Leads query error:', leadsError);
      result.leads = leads || [];

      const { data: allData } = await sb.from('leads').select('status');
      result.stats = {
        matching: (allData?.filter((l: any) => l.status === 'matching').length) || 0,
        assigned: (allData?.filter((l: any) => l.status === 'assigned').length) || 0,
        complete: (allData?.filter((l: any) => l.status === 'complete').length) || 0,
        en_route: (allData?.filter((l: any) => l.status === 'en_route').length) || 0,
        arrived: (allData?.filter((l: any) => l.status === 'arrived').length) || 0,
        unfulfilled: (allData?.filter((l: any) => l.status === 'unfulfilled').length) || 0,
        refunded: (allData?.filter((l: any) => l.status === 'refunded').length) || 0,
      };
    }

    // Summary endpoint for admin overview page
    if (endpoint === 'summary') {
      const { data: allUsers } = await sb.from('auth_users').select('stripe_customer_id,subscription_tier,role').limit(100);
      const users = allUsers || [];
      const activePlumbers = users.filter((u: any) => u.subscription_tier && u.subscription_tier !== '').length;
      const totalUsers = users.filter((u: any) => u.role !== 'super_admin').length;
      result = {
        mrr: activePlumbers * 799, // avg MRR estimate
        activePlumbers,
        totalCompanies: totalUsers,
        freeTrials: 0,
        churnRate: 0,
        mrrGrowth: 0,
        plumberGrowth: 0,
        trialConversionRate: 0,
        churnTrend: 'down',
        leadsToday: 0,
        unfulfilledLeads: 0,
      };
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Admin data error:', error.message);
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 });
  }
}
