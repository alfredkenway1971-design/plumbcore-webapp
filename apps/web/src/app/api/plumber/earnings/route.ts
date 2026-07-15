import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

/**
 * GET /api/plumber/earnings?companyId=xxx
 * Returns earnings summary and payout history for a plumber
 * POST /api/plumber/earnings — trigger payout
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      // Return mock data when Supabase not configured
      const { mockEarningSummary, mockPayoutHistory, mockEarningPeriods } = await import('@/lib/payouts');
      return NextResponse.json({
        summary: mockEarningSummary,
        payouts: mockPayoutHistory,
        periods: mockEarningPeriods,
      });
    }

    // Try real DB first, fall back to mock
    const { data: payouts } = await (admin as any)
      .from('payouts')
      .select('*')
      .eq('company_id', companyId)
      .order('period_start', { ascending: false })
      .limit(20);

    if (payouts && payouts.length > 0) {
      // Calculate summary from real data
      const now = new Date();
      const thisMonth = payouts.filter((p: any) => {
        const d = new Date(p.period_start);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const thisMonthTotal = thisMonth.reduce((s: number, p: any) => s + p.net_amount, 0);
      const pendingTotal = payouts
        .filter((p: any) => p.status === 'pending')
        .reduce((s: number, p: any) => s + p.net_amount, 0);

      return NextResponse.json({
        summary: {
          thisWeek: thisMonthTotal,
          thisMonth: thisMonthTotal,
          lifetime: payouts.reduce((s: number, p: any) => s + p.net_amount, 0),
          pendingPayouts: pendingTotal,
          nextPayoutDate: 'Sunday, July 13, 2026',
          avgPerJob: 32500,
          jobsThisMonth: 0,
          jobsThisWeek: 0,
          depositsThisWeek: 0,
          leadFeesCharged: thisMonthTotal,
          platformFeesPaid: thisMonthTotal * 0.1,
        },
        payouts,
        periods: [],
      });
    }

    // Fallback to mock
    const { mockEarningSummary, mockPayoutHistory, mockEarningPeriods } = await import('@/lib/payouts');
    return NextResponse.json({
      summary: mockEarningSummary,
      payouts: mockPayoutHistory,
      periods: mockEarningPeriods,
    });
  } catch (err: any) {
    console.error('Earnings GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/plumber/earnings — create a manual payout (admin trigger)
 */
export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { companyId, periodStart, periodEnd, amount, feeCount, notes } = await req.json();
    if (!companyId || !periodStart || !periodEnd) {
      return NextResponse.json({ error: 'companyId, periodStart, periodEnd required' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ message: 'DB not configured', payout: { id: 'mock-payout', status: 'pending' } });
    }

    // Get plumber profile for tier & lead fee
    const { data: profile } = await (admin as any)
      .from('plumber_profiles')
      .select('plan_tier, lead_fee_cents')
      .eq('company_id', companyId)
      .single();

    const planTier = profile?.plan_tier || 'solo';
    const leadFeeCents = profile?.lead_fee_cents || 1500;
    const netPerLead = leadFeeCents;
    const platformFee = 4900 - leadFeeCents; // $49 deposit minus plumber's fee

    const gross = amount || 4900;
    const fc = feeCount || 1;

    const { data: payout } = await (admin as any)
      .from('payouts')
      .insert({
        company_id: companyId,
        period_start: periodStart,
        period_end: periodEnd,
        gross_amount: gross * fc,
        platform_fee: platformFee * fc,
        net_amount: netPerLead * fc,
        fee_count: fc,
        status: 'pending',
        notes: notes || '',
      })
      .select()
      .single();

    return NextResponse.json({ message: 'Payout created', payout });
  } catch (err: any) {
    console.error('Payout POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
