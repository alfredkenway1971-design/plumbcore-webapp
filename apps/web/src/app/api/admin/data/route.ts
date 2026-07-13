// Admin API — Real platform-wide metrics from Supabase
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getAdminClient } from '@/lib/supabase-admin';
import { PLAN_PRICES } from '@/lib/plan-pricing';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  // Only super_admin and admin can access
  if (auth.role !== 'super_admin' && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    const sb = admin as any;
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'summary';

    switch (endpoint) {

      case 'summary': {
        // Platform-wide KPIs
        const [companiesRes, profilesRes, jobsRes, invoicesRes] = await Promise.all([
          sb.from('companies').select('*'),
          sb.from('profiles').select('*'),
          sb.from('jobs').select('status,estimated_cost,actual_cost,created_at'),
          sb.from('invoices').select('status,total,amount_paid'),
        ]);

        const companies = companiesRes.data || [];
        const profiles = profilesRes.data || [];
        const jobs = jobsRes.data || [];
        const invoices = invoicesRes.data || [];

        const activeCompanies = companies.filter((c: any) => c.subscription_status === 'active' || c.subscription_status === 'trialing');
        const trialingCompanies = companies.filter((c: any) => c.subscription_status === 'trialing');
        const cancelledCompanies = companies.filter((c: any) => c.subscription_status === 'cancelled' || c.subscription_status === 'past_due');

        // MRR: sum of subscription prices for active companies (PLAN_PRICES is in cents, convert to dollars)
        const mrr = activeCompanies.reduce((sum: number, c: any) => {
          return sum + ((PLAN_PRICES[c.subscription_tier] || 0) / 100);
        }, 0);

        const totalJobs30d = jobs.filter((j: any) => {
          const d = new Date(j.created_at);
          return Date.now() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
        }).length;

        const totalRevenue30d = invoices
          .filter((i: any) => i.status === 'paid')
          .reduce((sum: number, i: any) => sum + (i.amount_paid || i.total || 0), 0);

        return NextResponse.json({
          mrr,
          activePlumbers: profiles.filter((p: any) => p.is_active !== false).length,
          freeTrials: trialingCompanies.length,
          churnRate: companies.length > 0 ? (cancelledCompanies.length / companies.length * 100).toFixed(1) : '0',
          totalCompanies: companies.length,
          totalProfiles: profiles.length,
          totalJobs30d,
          totalRevenue30d,
          trialingCompanies: trialingCompanies.length,
          activeCompanies: activeCompanies.length,
        });
      }

      case 'companies': {
        const { data: companies } = await sb.from('companies').select('*, profiles!inner(*)');
        return NextResponse.json({ companies: companies || [] });
      }

      case 'company-detail': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

        const [companyRes, profilesRes, jobsRes, invoicesRes] = await Promise.all([
          sb.from('companies').select('*').eq('id', id).single(),
          sb.from('profiles').select('*').eq('company_id', id),
          sb.from('jobs').select('*').eq('company_id', id).order('created_at', { ascending: false }).limit(50),
          sb.from('invoices').select('*').eq('company_id', id).order('created_at', { ascending: false }).limit(50),
        ]);

        return NextResponse.json({
          company: companyRes.data || null,
          profiles: profilesRes.data || [],
          jobs: jobsRes.data || [],
          invoices: invoicesRes.data || [],
        });
      }

      case 'trial-pipeline': {
        const { data: companies } = await sb
          .from('companies')
          .select('*')
          .eq('subscription_status', 'trialing')
          .order('trial_end', { ascending: true });

        return NextResponse.json({ trials: companies || [] });
      }

      default:
        return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Admin query failed' }, { status: 500 });
  }
}
