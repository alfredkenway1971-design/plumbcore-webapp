import { NextResponse } from 'next/server';

/**
 * POST /api/payouts/process-weekly
 * Cron endpoint: processes weekly payouts for plumbers based on jobs
 * completed in the past 7 days with deposit_credit_applied > 0.
 *
 * Groups by plumber_id, calculates gross/net amounts, creates plumber_payouts records.
 * Runs via cron every Sunday.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.CRON_SECRET || 'plumbcore-cron-secret';

    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      // Mock mode — generate simulated payout summary
      const mockSummary = {
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
        payoutsCreated: 3,
        totalGross: 14700,    // cents
        totalPlatformFee: 3000,
        totalNet: 11700,
        breakdown: [
          { plumberId: 'pp-001', plumberName: 'Mike Torres', leadCount: 4, gross: 9800, platformFee: 1400, net: 8400 },
          { plumberId: 'pp-002', plumberName: 'James Wilson', leadCount: 2, gross: 2900, platformFee: 600, net: 2300 },
          { plumberId: 'pp-003', plumberName: 'Sarah Blake', leadCount: 1, gross: 2000, platformFee: 500, net: 1500 },
        ],
        message: 'Mock mode: 3 payouts created successfully',
        processed: 3,
        failed: 0,
      };
      return NextResponse.json(mockSummary);
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const periodStart = sevenDaysAgo.toISOString().split('T')[0];
    const periodEnd = now.toISOString().split('T')[0];

    // Query jobs completed in the past week with deposit_credit_applied > 0
    const { data: jobs } = await (admin as any)
      .from('jobs')
      .select(`
        id,
        assigned_plumber_id,
        company_id,
        deposit_credit_applied,
        deposit_tier,
        estimated_cost,
        actual_cost,
        completed_at,
        plumber_profiles!jobs_assigned_plumber_id_fkey (
          id,
          company_name,
          plan_tier,
          lead_fee_cents
        )
      `)
      .gte('completed_at', sevenDaysAgo.toISOString())
      .lte('completed_at', now.toISOString())
      .gt('deposit_credit_applied', 0)
      .not('deposit_credit_applied', 'is', null);

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        message: 'No completed jobs with deposit credits found this week',
        processed: 0,
        period: { start: periodStart, end: periodEnd },
        breakdown: [],
      });
    }

    // Group by plumber_id
    const grouped: Record<string, {
      plumberProfileId: string;
      companyId: string;
      plumberName: string;
      planTier: string;
      leadFeeCents: number;
      jobIds: string[];
      totalDepositCredits: number;
      jobCount: number;
    }> = {};

    for (const job of jobs) {
      const plumberId = job.assigned_plumber_id || 'unknown';
      if (!grouped[plumberId]) {
        grouped[plumberId] = {
          plumberProfileId: job.plumber_profiles?.id || plumberId,
          companyId: job.company_id,
          plumberName: job.plumber_profiles?.company_name || 'Unknown Plumber',
          planTier: job.plumber_profiles?.plan_tier || 'solo',
          leadFeeCents: job.plumber_profiles?.lead_fee_cents || 1500,
          jobIds: [],
          totalDepositCredits: 0,
          jobCount: 0,
        };
      }
      grouped[plumberId].jobIds.push(job.id);
      grouped[plumberId].totalDepositCredits += (job.deposit_credit_applied || 0);
      grouped[plumberId].jobCount += 1;
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-06-24.dahlia' as any });

    let processed = 0;
    let failed = 0;
    const breakdown: any[] = [];

    for (const [, group] of Object.entries(grouped)) {
      const grossAmount = group.totalDepositCredits;
      // Platform fee = deposit total minus plumber's lead fee per job
      const platformFee = group.jobCount * (4900 - group.leadFeeCents); // $49 default deposit - lead fee
      const netAmount = group.jobCount * group.leadFeeCents;

      try {
        // Check if plumber already has a payout for this period
        const { data: existing } = await (admin as any)
          .from('payouts')
          .select('id')
          .eq('company_id', group.companyId)
          .eq('period_start', periodStart)
          .eq('period_end', periodEnd)
          .maybeSingle();

        if (existing) {
          // Already processed — skip
          breakdown.push({
            plumberId: group.plumberProfileId,
            plumberName: group.plumberName,
            skipped: true,
            reason: 'Already has payout for this period',
          });
          continue;
        }

        // Get plumber's Stripe Connect account
        const { data: plumberProfile } = await (admin as any)
          .from('plumber_profiles')
          .select('stripe_connect_account_id, stripe_onboarding_complete')
          .eq('id', group.plumberProfileId)
          .single();

        const connectAccountId = plumberProfile?.stripe_connect_account_id;
        let stripeTransferId = '';
        let stripePayoutId = '';

        if (connectAccountId && plumberProfile?.stripe_onboarding_complete) {
          try {
            const transfer = await stripe.transfers.create({
              amount: netAmount,
              currency: 'usd',
              destination: connectAccountId,
              description: `Weekly payout: ${group.jobCount} jobs, period ${periodStart} to ${periodEnd}`,
            });
            stripeTransferId = transfer.id;
          } catch (stripeErr: any) {
            console.error(`Stripe transfer failed for ${group.plumberName}:`, stripeErr.message);
            // Continue to create the payout record even if transfer fails
          }
        }

        // Create payout record
        const { data: payout } = await (admin as any)
          .from('payouts')
          .insert({
            company_id: group.companyId,
            plumber_profile_id: group.plumberProfileId,
            period_start: periodStart,
            period_end: periodEnd,
            gross_amount: grossAmount,
            platform_fee: platformFee,
            net_amount: netAmount,
            fee_count: group.jobCount,
            stripe_transfer_id: stripeTransferId,
            status: stripeTransferId ? 'processing' : 'pending',
            notes: `Auto-generated from ${group.jobCount} jobs with deposit credits`,
          })
          .select()
          .single();

        breakdown.push({
          plumberId: group.plumberProfileId,
          plumberName: group.plumberName,
          jobs: group.jobCount,
          gross: grossAmount,
          platformFee,
          net: netAmount,
          status: payout?.status || 'pending',
        });

        processed++;
      } catch (err: any) {
        console.error(`Failed to process payout for ${group.plumberName}:`, err.message);
        failed++;
        breakdown.push({
          plumberId: group.plumberProfileId,
          plumberName: group.plumberName,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${processed} payouts${failed ? `, ${failed} failed` : ''}`,
      period: { start: periodStart, end: periodEnd },
      processed,
      failed,
      breakdown,
      totalGross: breakdown.reduce((s: number, b: any) => s + (b.gross || 0), 0),
      totalNet: breakdown.reduce((s: number, b: any) => s + (b.net || 0), 0),
    });
  } catch (err: any) {
    console.error('Process weekly payouts error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
